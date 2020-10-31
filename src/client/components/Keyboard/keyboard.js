import React, { useImperativeHandle, useRef, useEffect, useState } from 'react';
import './keyboard.css';
import Layout from './layout';
import io from 'socket.io-client';


const START = 1;
const MOVE = 2;
const END = 3;
const EXPLORE = 4;
const Keyboard = ({cRef}) => {
    const canvasRef = useRef(null);
    const corpusSize = 30000;
    const sampleSize = 50;
    const [candidates, setCandidates] = useState([]);
    const isStart = useRef(false);
    const userPath = useRef([]);
    const layout = useRef(null);
    const cursorPos = useRef(null);
    const keyboardParameter= useRef(null);



    let wordDict = [];

    useImperativeHandle(cRef, () => ({
        onEvent: (type, pos, normalized) => {
          onEvent(type, pos, normalized);
        }
    }));

    useEffect(() => {
        updateCanvas();
    }, [userPath]);
    

    useEffect(() => {
        init()
    }, [canvasRef]);


    let init = () => {
        let canvas = canvasRef.current
        let context = canvas.getContext('2d');
        const keyboardHeight = 450 / 2;
        keyboardParameter.current = {
            width: canvas.width,
            height: keyboardHeight,
            posx: 0,  // position of keyboard in canvas
            posy: canvas.height - keyboardHeight
        };
        layout.current = new Layout(keyboardParameter.current);
        layout.current.render(context);
        loadCorpus();
        canvas.onmousedown = mouseDown;
        canvas.onmousemove = mouseMove;
        canvas.onmouseup = mouseUp;
        const socket = io();
    socket.on('connect', () => {
        console.log('connected!!');
      });
    socket.on('data', function(data) {
      let lines = data.split('\n');
      lines.forEach(element => {
        let items = element.split(' ');
        onEvent(parseInt(items[0]), {x: parseFloat(items[1]), y: parseFloat(items[2])}, true);        
      });
    });

       
    
        
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
        // let corpus = require('../../assets/corpus.txt');
        // let lineData = data.split('\n');
        // for (let i = 0; i < corpusSize; i++) {
        //     let item = lineData[i].split(' ');
        //     let word = item[0].trim();
        //     let freq = parseInt(item[1]);
        //     wordDict.push([word, freq, getPath(word)]);
        // }
        // alert("loading corpus complete!");
        fetch('/corpus.txt')
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
            ret.push(layout.current.getCenter(i));
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

    let updateCanvas = () => {
        let canvas = canvasRef.current;
        let context = canvas.getContext('2d');
        if (context == null) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        if (layout.current != null) {
            layout.current.render(context);
        }
        let uPath = userPath.current;
        if (uPath.length > 0) {
            context.moveTo(uPath[0].x, uPath[0].y);
            for (let i = 1; i<uPath.length; i++) {
                context.lineTo(uPath[i].x, uPath[i].y);
            }
            context.stroke();
        }
        if (cursorPos.current != null) {
            context.beginPath();
            context.arc(cursorPos.current.x, cursorPos.current.y, 5, 0, 2*Math.PI);
            context.fill();
        }
    }

    let onEvent = (type, pos, normalized = false) => {
        if (type != START && type != MOVE && type != EXPLORE && type != END) {return;}
        if (normalized) {
            pos.x = pos.x * canvasRef.current.width;
            pos.y = pos.y * canvasRef.current.height;
        }
        cursorPos.current = pos;
        switch (type) {
            case START:
                userPath.current = [pos];
                isStart.current = true;
                break;
            case MOVE:
            case EXPLORE:
                if (isStart.current) {
                    userPath.current.push(pos);
                }                
                break;
            case END:
                if (isStart.current) {
                    userPath.current.push(pos);
                    calculateCandidate();
                }
                isStart.current = false;
                break;
            default:
                break;
        }
        updateCanvas();
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
        let userP = resamplePath(userPath.current);
        let ans = [];
        let totDis = 0;
        let totFreq = 0;
        wordDict.forEach(ele => {
            let word = ele[0];
            let freq = ele[1];
            let path = ele[2];
            let dis = similarity(userP, path);
            ans.push([word, -Math.log(dis)]);// - 15*Math.log(dis)]);
            totDis += 1/dis;
            totFreq += freq;
        });
        // for (let i=0; i<ans.length; i++) {
        //     ans[i][1] += Math.log(wordDict[i][1]);Math.log(ans[i][1])+Math.log(wordDict[i][1] / totFreq);
        // }
        ans.sort((a, b) => {return b[1] - a[1]});
        setCandidates(ans.slice(0, 5));
    }

    return (
      <div>
        <canvas ref={canvasRef} width="450" height="450" />
        <ul>
        {candidates.map( (candidate, i)=>
            (<li key={i}>{candidate[0]}</li>)
        )}
        </ul>
      </div>    
    );
}

export default Keyboard;