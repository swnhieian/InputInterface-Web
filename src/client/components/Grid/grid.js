import { FullscreenExitOutlined, FullscreenOutlined, SettingOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Drawer, Form, InputNumber, Row, Space, Switch } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useRef, useState } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import io from 'socket.io-client';



const Grid = (props) => {
    const canvasRef = useRef({'width':450,'height':450});
    const cursorPos = useRef(null);
    const [showSettings, setShowSettings] = useState(false);
    const [useMouse, setUseMouse] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(450);
    const [canvasHeight, setCanvasHeight] = useState(450);
    const [row, setRow] = useState(10);
    const [col, setCol] = useState(10);
    const fullScreenHandle = useFullScreenHandle();



    let updateCanvas = () => {
        let canvas = canvasRef.current;
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        for (let i = 0; i < row - 1; i++) {
            context.moveTo(0, (i+1)*canvas.height / row);
            context.lineTo(canvas.width, (i+1)*canvas.height / row);
        }
        for (let i = 0; i < col - 1; i++) {
            context.moveTo((i+1)*canvas.width / col, 0);
            context.lineTo((i+1)*canvas.width / col, canvas.height);
        }
        context.stroke();
        if (cursorPos.current != null) {
            let pos = cursorPos.current;
            let xindex = Math.floor(pos.x / canvas.width * col);
            let yindex = Math.floor(pos.y / canvas.height * row);
            context.fillRect(xindex*canvas.width / col, yindex*canvas.height/row, canvas.width/col, canvas.height/row);
        }        
    }

    useEffect(() => {
        console.log("trying to connect to "+ document.domain+':8080');
        const socket = io(document.domain+':8080');
        socket.on('connect', () => {
            console.log(document.domain+':8080'+'connected!!');
        });
        socket.on('data', function(data) {
            let lines = data.split('\n');
            lines.forEach(element => {
                let items = element.split(' ');
                if (items.length > 1) {     
                    cursorPos.current = {x: parseFloat(items[1])*canvasRef.current.width, y: parseFloat(items[2])*canvasRef.current.height};
                    updateCanvas();
                }
            });
        });
        updateCanvas();
    }, []);

    useEffect(() => {
        updateCanvas();
    }, [canvasRef, cursorPos, canvasHeight, canvasWidth, row, col]);

    let mouseMove = (e) => {
        if (useMouse) {
            let position = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
            cursorPos.current = position;
            updateCanvas();
        }
    }

    let windowToCanvas = (c, x, y) => {
        let rect = c.getBoundingClientRect()
        let xpos = x - rect.left * (c.width / rect.width);
        let ypos = y - rect.top * (c.height/ rect.height);
        return {x: xpos, y: ypos};
    }

    let settingsExtra = () => (
        <Space>
        <SettingOutlined onClick={event=>setShowSettings(true)}/>
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
      <FullScreen handle={fullScreenHandle}>
      <Card title="Cursor Pad" extra={settingsExtra()} style={{height: '100%'}} bodyStyle={{height: '100%'}}>
        <Row style={{textAlign: 'center', height: '100%'}} justify="center" align="middle">
            <Col flex="1">
                <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} onMouseMove={mouseMove}/>
            </Col>
        </Row>
        <Drawer 
              visible={showSettings} 
              onClose={settingsClosed}
              width={720}
              title='设置'>
                <Form layout='horizontal' {...formLayout}>
                    <Form.Item label="绑定鼠标事件">
                        <Switch checked={useMouse} onChange={v=>setUseMouse(v)} />
                    </Form.Item>
                    <Divider>参数</Divider>
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

                    <Form.Item label="行列数">
                        <Row gutter={16}>
                            <Col flex={1}>
                                <Form.Item label="行" layout='horizontal'>
                                    <InputNumber style={{'width': '100%'}} min={0} max={canvasRef.current.height} onChange={v=>setRow(v)} value={row} />
                                </Form.Item>
                            </Col>
                            
                            <Col flex={1}>
                                <Form.Item label="列" layout='horizontal'>
                                    <InputNumber style={{'width': '100%'}} min={0} max={canvasRef.current.width} onChange={v=>setCol(v)} value={col} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                </Form>
            </Drawer>
      </Card>   
      </FullScreen> 
    );
}

export default Grid;