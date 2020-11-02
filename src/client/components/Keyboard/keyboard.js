import { Col, InputNumber, List, notification, Row, Switch } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import io from 'socket.io-client';
import './keyboard.css';
import Layout from './layout';

const START = 1;
const MOVE = 2;
const END = 3;
const EXPLORE = 4;
const Keyboard = ({cRef}) => {
    const canvasRef = useRef(null);
    const sampleSize = 50;
    const [candidates, setCandidates] = useState([]);
    const isStart = useRef(false);
    const userPath = useRef([]);
    const layout = useRef(null);
    const cursorPos = useRef(null);
    const keyboardParameter= useRef(null);



    const [wordDict, setWordDict] = useState([]);
    const [useMouse, setUseMouse] = useState(false);
    const [corpusSize, setCorpusSize] = useState(1000);


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
        
        canvas.onmousedown = mouseDown;
        canvas.onmousemove = mouseMove;
        canvas.onmouseup = mouseUp;        
    }

    useEffect(() => {
        loadCorpus();
        const socket = io(document.domain+':8081');
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
    }, []);

    let windowToCanvas = (c, x, y) => {
        let rect = c.getBoundingClientRect()
        let xpos = x - rect.left * (c.width / rect.width);
        let ypos = y - rect.top * (c.height/ rect.height);
        return {x: xpos, y: ypos};
    }

    let mouseControl = (type, e) => {
        if (useMouse) {
            let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
            onEvent(type, position);
        }
    }

    let mouseDown = (e) => {
        console.log("in mouse down");
        console.log(wordDict);
        if (!useMouse) {return;}
        // console.log("mouse down 2");
        let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        onEvent(START, position);
    }


    let mouseMove = (e) => {
        if (!useMouse) {return;}

        let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        onEvent(MOVE, position);
    }

    let mouseUp = (e) => {
        if (!useMouse) {return;}

        let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        onEvent(END, position);
    }

    const openNotification = (type, content) => {
        notification[type]({
            message: content
        });
    };


    let loadCorpus = () => {
        fetch('/corpus.txt')
        .then(res => {
            return res.text()
        })
        .then(data => {
            let lineData = data.split('\n');
            let tempDict = [];
            for (let i = 0; i < lineData.length; i++) {
                let item = lineData[i].split(' ');
                let word = item[0].trim();
                let freq = parseInt(item[1]);
                tempDict.push([word, freq, getPath(word)]);
            }
            setWordDict(tempDict);
            console.log(wordDict);
            openNotification('success', '词库加载成功');
        })
        .catch(err => {
            openNotification('error', '词库加载失败' + err);
        });
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
        console.log("in calculate candidate");
        let userP = resamplePath(userPath.current);
        let ans = [];
        let totDis = 0;
        let totFreq = 0;
        console.log(wordDict);
        for (let i=0; i < corpusSize; i++) {
            let ele = wordDict[i];
            // console.log(ele);
            let word = ele[0];
            let freq = ele[1];
            let path = ele[2];
            let dis = similarity(userP, path);
            ans.push([word, -Math.log(dis)]);// - 15*Math.log(dis)]);
            totDis += 1/dis;
            totFreq += freq;
        }
        // for (let i=0; i<ans.length; i++) {
        //     ans[i][1] += Math.log(wordDict[i][1]);Math.log(ans[i][1])+Math.log(wordDict[i][1] / totFreq);
        // }
        ans.sort((a, b) => {return b[1] - a[1]});
        setCandidates(ans.slice(0, 5));
    };

    return (
      <Row style={{textAlign: 'center'}}>
          
          <Col span={12}>
            <canvas ref={canvasRef} width="450" height="450"  onMouseDown={e=>mouseControl(START, e)} onMouseMove={e=>mouseControl(MOVE, e)} onMouseUp={e=>mouseControl(END, e)}/>
            {/* <canvas ref={canvasRef} width="450" height="450"/> */}
            </Col>
          <Col span={6}>
            <List
                header={<div>候选词列表</div>}
                bordered
                dataSource={candidates}
                renderItem={item => (
                    <List.Item>
                    <div>{item[0]}</div>
                    </List.Item>
                )}
                />
          </Col>
          <Col span={6}>
            配置{corpusSize}
            <InputNumber onChange={v=>setCorpusSize(v)} value={corpusSize} />
        绑定鼠标: <Switch size="small" checked={useMouse} onChange={(v)=>{setUseMouse(v);console.log(v);console.log(useMouse);}} />

          </Col>
      </Row>
    );
}

export default Keyboard;