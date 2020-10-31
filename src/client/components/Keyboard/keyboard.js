import React, { useImperativeHandle, useRef, useEffect } from 'react';
import './keyboard.css';
import Layout from './layout';

const START = 1;
const MOVE = 2;
const END = 3;
const Keyboard = ({cRef}) => {
    const canvasRef = useRef(null);
    const corpusSize = 30000;
    const sampleSize = 50;



    let wordDict = [];
    let layout = null;
    let userPath = [];
    let candidates = [];
    let isStart = false;
    let keyboardParameter = {};

    useImperativeHandle(cRef, () => ({
        onEvent: (type, pos, normalized) => {
          onEvent(type, pos, normalized);
        }
    }));
    


    useEffect(() => {
        init()
    }, [canvasRef])


    let init = () => {
        let canvas = canvasRef.current
        let context = canvas.getContext('2d');
        const keyboardHeight = 450;
        keyboardParameter = {
            width: canvas.width,
            height: keyboardHeight,
            posx: 0,  // position of keyboard in canvas
            posy: canvas.height - keyboardHeight
        };
        layout = new Layout(keyboardParameter);
        layout.render(context);
        loadCorpus();
        canvas.onmousedown = mouseDown;
        canvas.onmousemove = mouseMove;
        canvas.onmouseup = mouseUp;

       
    
        
    }

    let windowToCanvas = (c, x, y) => {
        let rect = c.getBoundingClientRect()
        let xpos = x - rect.left * (c.width / rect.width);
        let ypos = y - rect.top * (c.height/ rect.height);
        return {x: xpos, y: ypos};
    }

    let mouseDown = (e) => {
        let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        onEvent(START, position);
    }

    let mouseMove = (e) => {
        let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        onEvent(MOVE, position);
    }

    let mouseUp = (e) => {
        let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        onEvent(END, position);
    }


    let loadCorpus = () => {
        fetch('/public/corpus.txt')
        .then(res => {
            return res.text()
        })
        .then(data => {
            let lineData = data.split('\n');
            for (let i = 0; i < corpusSize; i++) {
                let item = lineData[i].split(' ');
                let word = item[0].trim();
                let freq = parseInt(item[1]);
                wordDict.push([word, freq, getPath(word)]);
            }
            alert("loading corpus complete!");
        })
    }

    let getPath = (word) => {
        let ret = []
        for (let i of word) {
            ret.push(layout.getCenter(i));
        }
        return resamplePath(ret);
    }

    let resamplePath = (path) => {
        let n = path.length;
        let ret = [];
        if (n == 1) {
            for (let i = 0; i<sampleSize; i++) {
                ret.push(path[0]);
            }
            return ret
        }
        let length = 0;
        for (let i = 0; i < n - 1; i++) {
            length += distance(path[i], path[i+1]);
        }
        let interval = length / (sampleSize - 1);
        let lastPos = path[0];
        let currLen = 0;
        let no = 1;
        ret.push(path[0]);
        while (no < n) {
            let dist = distance(lastPos, path[no]);
            if (currLen + dist >= interval && dist > 0) {
                let ratio = (interval - currLen) / dist;
                let { x, y } = lastPos;
                lastPos = {
                        x: x + ratio * (path[no].x - x),
                        y: y + ratio * (path[no].y - y)
                    }
                ret.push(lastPos);
                currLen = 0;
            } else {
                currLen += dist;
                lastPos = path[no]
                no ++;
            }
        }
        for (let i=ret.length; i < sampleSize; i++) {
            ret.push(path[n - 1]);
        }
        return ret;
    }

    let distance = (t1, t2) => {
        let dx = t1.x - t2.x;
        let dy = t1.y - t2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    let onEvent = (type, pos, normalized = false) => {
        if (normalized) {
            pos.x = pos.x * keyboardParameter.width;
            pos.y = pos.y * keyboardParameter.height;
        }
        let canvas = canvasRef.current
        let context = canvas.getContext('2d');
        // console.log("in onevent:" + pos.x + "," + pos.y);
        switch (type) {
            case START:
                if (userPath.length > 0) {
                    userPath = [];
                }
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.beginPath();
                layout.render(context);
                context.moveTo(pos.x, pos.y); 
                userPath.push(pos);
                isStart = true;
                break;
            case MOVE:
                if (isStart) {
                    userPath.push(pos);
                    context.lineTo(pos.x, pos.y);
                    context.stroke();
                }
                break;
            case END:
                if (isStart) {
                    userPath.push(pos);
                    calculateCandidate();
                }
                isStart = false;
                break;
            default:
                break;
        }
    }

    let similarity = (p1, p2) =>{
        if (p1.length != sampleSize || p2.length != sampleSize) {
            throw new Error("Path length invalid!" + p1.length + "," + p2.length);
        }
        let ret = 0;
        for (let i = 0; i< sampleSize; i++) {
            ret += distance(p1[i], p2[i]);
        }
        return ret / sampleSize;
    }

    let calculateCandidate = () => {
        let userP = resamplePath(userPath);
        let ans = [];
        wordDict.forEach(ele => {
            let word = ele[0];
            let freq = ele[1];
            let path = ele[2];
            ans.push([word, similarity(userP, path)]);
        });
        ans.sort((a, b) => {return a[1] - b[1]});
        // console.log(ans);
        candidates = [];
        for (let i=0; i<5; i++) {
            candidates.push(ans[i]);
            console.log(ans[i][0], ",", ans[i][1]);
        }
        console.log(candidates);
    }

    return (
      <div>
        <canvas ref={canvasRef} width="450" height="450" />
        <div>
        {candidates.map( (candidate)=>
            (<div>{candidate[0]}, {candidate[1]}</div>)
        )}
        </div>
      </div>    
    );
}

export default Keyboard;