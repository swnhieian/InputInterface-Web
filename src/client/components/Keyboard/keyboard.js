import { ClearOutlined, FullscreenExitOutlined, FullscreenOutlined, SettingOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Drawer, Form, InputNumber, List, notification, Row, Space, Switch } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useRef, useState } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import io from 'socket.io-client';
import './keyboard.css';
import Layout from './layout';


const START = 1;
const MOVE = 2;
const END = 3;
const EXPLORE = 4;
const Keyboard = ({cRef}) => {
    const canvasRef = useRef({'width':450,'height':450});
    const sampleSize = 50;
    const [candidates, setCandidates] = useState([]);
    const isStart = useRef(false);
    const userPath = useRef([]);
    const cursorPos = useRef(null);
    const keyboardParameter= useRef(null);



    // const [wordDict, setWordDict] = useState([]);
    const wordDict = useRef([]);
    const [useMouse, setUseMouse] = useState(false);
    const [showScore, setShowScore] = useState(false);
    const [useRelativeModel, setUseRelativeModel] = useState(true);
    const [useLanguageModel, setUseLanguageModel] = useState(true);
    const [corpusSize, setCorpusSize] = useState(1000);
    const [showSettings, setShowSettings] = useState(false);
    const [keyboardWidth, setKeyboardWidth] = useState(450);
    const [keyboardHeight, setKeyboardHeight] = useState(225);
    const [keyboardPosX, setKeyboardPosX] = useState(0);
    const [keyboardPosY, setKeyboardPosY] = useState(225);
    const [canvasWidth, setCanvasWidth] = useState(450);
    const [canvasHeight, setCanvasHeight] = useState(450);
    const fullScreenHandle = useFullScreenHandle();


    const layout = useRef(null);
    // const [layout, setLayout] = useState(new Layout({'width': 450, 'height': 225, 'posx': 0, 'posy': 225}));

    useEffect(() => {
        init()
    }, [canvasRef, canvasHeight, canvasWidth]);

    useEffect(() => {
        loadCorpus();
    }, []);

    useEffect(() => {
        const socket = io(document.domain+':8080');
        socket.on('connect', () => {
            console.log('connected!!');
        });
        socket.on('data', onData);
        return function closeSocket() {
            socket.close();
        }
    }, [corpusSize]);

    let onData = (data) => {
        let lines = data.split('\n');
            lines.forEach(element => {
                let items = element.split(' ');
                onEvent(parseInt(items[0]), {x: parseFloat(items[1]), y: parseFloat(items[2])}, true);
            });

    }

    

    useEffect(() => {
        layout.current = new Layout({
            width: keyboardWidth,
            height: keyboardHeight,
            posx: keyboardPosX,
            posy: keyboardPosY
        });
        updateCanvas();
    }, [keyboardHeight, keyboardWidth, keyboardPosX, keyboardPosY]);

    useEffect(() => {
        updateCanvas();
    }, [userPath]);
    

    


    let init = () => {
        let canvas = canvasRef.current
        // let context = canvas.getContext('2d');
        setKeyboardWidth(canvas.width);
        setKeyboardHeight(canvas.height / 2);
        setKeyboardPosX(0);
        setKeyboardPosY(canvas.height / 2);
        layout.current = new Layout({
            width: keyboardWidth,
            height: keyboardHeight,
            posx: keyboardPosX,
            posy: keyboardPosY
        });
        updateCanvas();
    }

    

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
        if (!useMouse) {return;}
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
                tempDict.push([word, freq]);
            }
            // setWordDict(tempDict);
            wordDict.current = tempDict;
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

    let clearCanvas = () => {
        let canvas = canvasRef.current;
        let context = canvas.getContext('2d');
        if (context == null) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (layout.current != null) {
            layout.current.render(context);
        }
        setCandidates([]);
        userPath.current = [];
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

    let logGaussian = (x, mu, sigma) => {
        let ret = -(x-mu)*(x-mu)/2/sigma/sigma-Math.log(Math.sqrt(2*Math.PI))-Math.log(sigma);
        return ret;
    }

    let calculateLocationProbability = (p1, p2, word) => {
        let ret = 0;
        let alpha = 1 / sampleSize;
        for (let i = 0; i< sampleSize; i++) {
            if (i == 0 || i == sampleSize - 1) {
                alpha = 0.2;
            } else {
                alpha = 0.6 / (sampleSize - 2);
            }
            ret += alpha*logGaussian(p1[i].x - p2[i].x, 0, layout.current.keyWidth*0.7);
            ret += alpha*logGaussian(p1[i].y - p2[i].y, 0, layout.current.keyHeight*0.7);
        }
        ret *= sampleSize;
        // ret = ret / sampleSize * word.length;
        return ret;
    }

    let calculateProbability = (p1, p2, word, freq) => {
        let ret = 0;
        ret += calculateShapeProbability(p1, p2, word);
        ret += calculateLocationProbability(p1, p2, word);
        ret += Math.log(freq);
        return ret;
    }

    let normalizePath = (p) => {
        let minx = Number.MAX_VALUE;
        let maxx = Number.MIN_VALUE;
        let miny = Number.MAX_VALUE;
        let maxy = Number.MIN_VALUE;
        let ret = []
        let sumx = 0;
        let sumy = 0;
        for (let i = 0; i < p.length; i++) {
            if (p[i].x < minx) minx = p[i].x;
            if (p[i].x > maxx) maxx = p[i].x;
            if (p[i].y < miny) miny = p[i].y;
            if (p[i].y > maxy) maxy = p[i].y;
            sumx += p[i].x;
            sumy += p[i].y;
        }
        let scale = 1;
        if (Math.max(maxx - minx, maxy - miny) > 0) {
            scale = 1 / Math.max(maxx - minx, maxy - miny);
        }
        let center = { x: sumx / p.length, y: sumy / p.length};
        for (let i = 0; i < p.length; i++) {
            ret.push({
                x: (p[i].x - center.x) * scale,
                y: (p[i].y - center.y) * scale
            });
        }
        return ret;
    }
    
    let calculateShapeProbability = (p1, p2, word) => {
        let ret = 0;
        let np1 = normalizePath(p1);
        let np2 = normalizePath(p2);
        for (let i = 0; i< sampleSize; i++) {
            ret += logGaussian(np1[i].x - np2[i].x, 0, 0.3);
            ret += logGaussian(np1[i].y - np2[i].y, 0, 0.3);
        }
        // ret = ret / sampleSize * word.length;
        return ret;
    }

    
    let calculateCandidate = () => {
        let userP = resamplePath(userPath.current);
        let ans = [];
        for (let i=0; i < corpusSize; i++) {
            let ele = wordDict.current[i];
            // console.log(ele);
            let word = ele[0];
            let freq = ele[1];
            let path = getPath(word);
            // let dis = similarity(userP, path);
            let locationScore = calculateLocationProbability(userP, path, word);
            let shapeScore = calculateShapeProbability(userP, path, word);
            let pro = locationScore;
            if (useLanguageModel) {
                pro += Math.log(freq);
            }
            if (useRelativeModel) {
                pro += shapeScore;
            } 
            ans.push([word, pro, locationScore, shapeScore, Math.log(freq)]);
        }
        ans.sort((a, b) => {return b[1] - a[1]});
        // console.log(ans);
        setCandidates(ans.slice(0, 5));
    };

    let settingsExtra = () => (
        <Space>
        <SettingOutlined onClick={event=>setShowSettings(true)}/>
        <ClearOutlined onClick={event => clearCanvas()}/>
        {fullScreenHandle.active
          ? <FullscreenExitOutlined onClick={fullScreenHandle.exit}/>
          : <FullscreenOutlined onClick={fullScreenHandle.enter}/>
        }
        </Space>
    );

    let settingsClosed = () => {
        setShowSettings(false);
    }

    const formLayout = {
        labelCol: {
          span: 8,
        },
        wrapperCol: {
          span: 16,
        },
        labelAlign: 'left'
    };

    return (
        <div>
        <FullScreen handle={fullScreenHandle}>
        <Card title="Gesture Keyboard" extra={settingsExtra()} style={{height: '100%'}} bodyStyle={{height: '100%'}}>
            <Row style={{textAlign: 'center', height: '100%'}} justify="center" align="middle">
                <Col flex={2} sm={24}>
                    <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} onMouseDown={e=>mouseControl(START, e)} onMouseMove={e=>mouseControl(MOVE, e)} onMouseUp={e=>mouseControl(END, e)}/>
                    {/* <canvas ref={canvasRef} width="450" height="450"/> */}
                </Col>
                <Col flex={1}>
                    <List header={<div>候选词列表</div>} bordered dataSource={candidates}
                        renderItem={item => (
                            <List.Item>
                            <div>{showScore?(''+item):item[0]}</div>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>

            <Drawer 
              visible={showSettings} 
              onClose={settingsClosed}
              width={720}
              title='键盘设置'>
                <Form layout='horizontal' {...formLayout}>
                    <Form.Item label="词库大小(1000-30000)">
                        <InputNumber style={{'width': '100%'}} min={1000} max={30000} step={1000} onChange={v=>setCorpusSize(v)} value={corpusSize} />
                    </Form.Item>
                    <Form.Item label="绑定鼠标事件">
                        <Switch checked={useMouse} onChange={v=>setUseMouse(v)} />
                    </Form.Item>
                    <Form.Item label="使用相对位置信息">
                        <Switch checked={useRelativeModel} onChange={v=>setUseRelativeModel(v)} />
                    </Form.Item>
                    <Form.Item label="使用语言模型">
                        <Switch checked={useLanguageModel} onChange={v=>setUseLanguageModel(v)} />
                    </Form.Item>
                    <Form.Item label="显示匹配结果">
                        <Switch checked={showScore} onChange={v=>setShowScore(v)} />
                    </Form.Item>
                    <Divider>键盘参数</Divider>
                    <Form.Item label="输入区域大小">
                        <Row gutter={16}>
                            <Col flex={1}>
                                <Form.Item label="宽(0-1000)" layout='horizontal'>
                                    <InputNumber min={0} max={1000} onChange={v=>setCanvasWidth(v)} value={canvasWidth} />
                                </Form.Item>
                            </Col>
                            
                            <Col flex={1}>
                                <Form.Item label="高(0-1000)" layout='horizontal'>
                                    <InputNumber min={0} max={1000} onChange={v=>setCanvasHeight(v)} value={canvasHeight} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>

                    <Form.Item label="键盘大小">
                        <Row gutter={16}>
                            <Col flex={1}>
                                <Form.Item label="宽" layout='horizontal'>
                                    <InputNumber style={{'width': '100%'}} min={0} max={canvasRef.current.width} onChange={v=>setKeyboardWidth(v)} value={keyboardWidth} />
                                </Form.Item>
                            </Col>
                            
                            <Col flex={1}>
                                <Form.Item label="高" layout='horizontal'>
                                    <InputNumber style={{'width': '100%'}} min={0} max={canvasRef.current.height} onChange={v=>setKeyboardHeight(v)} value={keyboardHeight} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item label="键盘位置（左上角）">
                        <Row gutter={16}>
                            <Col flex={1}>
                                <Form.Item label="X" layout='horizontal'>
                                    <InputNumber style={{'width': '100%'}} min={0} max={canvasRef.current.width - keyboardWidth} onChange={v=>setKeyboardPosX(v)} value={keyboardPosX} />
                                </Form.Item>
                            </Col>
                            
                            <Col flex={1}>
                                <Form.Item label="Y" layout='horizontal'>
                                    <InputNumber style={{'width': '100%'}} min={0} max={canvasRef.current.height - keyboardHeight} onChange={v=>setKeyboardPosY(v)} value={keyboardPosY} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                </Form>
            </Drawer>
        </Card>
        </FullScreen>
        </div>
    );
}

export default Keyboard;