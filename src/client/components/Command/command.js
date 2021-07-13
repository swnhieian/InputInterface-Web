import { FullscreenExitOutlined, FullscreenOutlined, SettingOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Drawer, Form, InputNumber, Row, Space, Switch } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useRef, useState, useReducer } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import io from 'socket.io-client';
import pinyinIME from './../ChineseIME/pinyinIME';
import Selector from './../ChineseIME/Selector';

const cmdStart = 1;
const cmdEnd = 51;

const Command = (props) => {

    const [showSettings, setShowSettings] = useState(false);
    const fullScreenHandle = useFullScreenHandle();


    const actionToIndex = (action) => {
        const actionData = ['click', 'up', 'right', 'down', 'left'];
        let idx = actionData.indexOf(action);
        if (idx < 0) idx = 0;
        return idx;
    }

    const getCmdMsg = (start, end, split, prefix) => {
        let ret = [];
        let number = split;
        if (prefix.length > 0) {
            ret.push(prefix);
            number = split - 1;
        }
        let step = Math.floor((end - start + number)/ number);
        let itemSt = start;
        for (let i = 0; i < number; i++) {
            let itemEn = Math.min(end, itemSt + step - 1);
            if (itemSt <= itemEn) {
                ret.push({start: itemSt, end: itemEn});
            } else {
                ret.push('')
            }
            itemSt += step;
        }
        return ret;
    }
    const reducer = (state, action) => {
        const data = {start: cmdStart, end:cmdEnd};
        // const data = ['命令1-10', '命令11-20', '命令21-30', '命令31-40', '命令41-50'];
        let op = actionToIndex(action);
        let cmd = state.message[op];
        if (cmd === '返回') {
            let lastItem = state.prefix[state.level - 2];
            return {
                ...state,
                level: state.level - 1,
                prefix: state.prefix.slice(0, state.level - 1),
                message: getCmdMsg(lastItem.start, lastItem.end, 5, state.level===2?'':'返回')
            }
        } else if (cmd.length === 0) {
            return state;
        } else {
            if (cmd.start === cmd.end) {
                return {
                    ...state,
                    input: '命令' + cmd.start,
                    level: 1,
                    message: getCmdMsg(data.start, data.end, 5, ''),
                    prefix: [data]
                };
            } else {
                return {
                    ...state,
                    level: state.level + 1,
                    prefix: [...state.prefix, state.message[op]],
                    message: getCmdMsg(state.message[op].start, state.message[op].end, 5, '返回')
                }
            }

        }  
    }

    const [state, dispatch] = useReducer(reducer, {level: 1, message: getCmdMsg(cmdStart,cmdEnd, 5, ''), prefix: [{start:cmdStart, end:cmdEnd}], input: '无'});



    useEffect(() => {
        console.log("trying to connect to "+ document.domain+':8080');
        const socket = io(document.domain+':8080');
        socket.on('connect', () => {
            console.log(document.domain+':8080'+'connected!!');
        });
        socket.on('data', function(data) {
            let lines = data.split('\n');
            lines.forEach(element => {
                if (element.length > 0) {
                    console.log('[socket] dispatch : ' + element);
                    dispatch(element);
                }
            });
        });
        return function closeSocket() {
            socket.close();
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', (event) => {
            console.log("in key down|" + event.code+"|");
            switch (event.code) {
                case 'ArrowLeft':
                    event.preventDefault();
                    dispatch('left');
                    return;
                case 'ArrowRight':
                    event.preventDefault();
                    dispatch('right');
                    return;
                case 'Space':
                    event.preventDefault();
                    dispatch('click');
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    dispatch('up');
                    return;
                case 'ArrowDown':
                    event.preventDefault();
                    dispatch('down');
                    return;
                default:
                    return;
            }
        });
    }, []);

    

    

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

    const msgToText = (message) => {
        let ret = [];
        message.map((item) => {
            if (typeof(item) !== 'object') {
                ret.push(item);
            } else {
                let txt = '命令' + item.start;
                if (item.end > item.start) {
                    txt = txt + '-' + item.end;
                }
                ret.push(txt);
            }
        });
        return ret;
    }


    return (
      <FullScreen handle={fullScreenHandle}>
      <Card title="命令输入" extra={settingsExtra()} style={{height: '100%', textAlign:'center'}} bodyStyle={{height: '100%'}}>
          <h3>当前命令：{state.input}</h3>
          <Selector data={msgToText(state.message)} radius={200} hasCenter={true}/>
          <Divider>键盘绑定</Divider>
          方向键+空格键
        <Drawer 
              visible={showSettings} 
              onClose={settingsClosed}
              width={720}
              title='设置'>
            </Drawer>
      </Card>   
      </FullScreen> 
    );
}

export default Command;