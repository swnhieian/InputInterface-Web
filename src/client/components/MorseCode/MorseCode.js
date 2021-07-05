import { FullscreenExitOutlined, FullscreenOutlined, SettingOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Drawer, Form, Row, Space, List } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState, useReducer } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import io from 'socket.io-client';



const MorseCode = (props) => {
    let diAudio = new Audio('/di.mp3');
    let daAudio = new Audio('/da.mp3');
    let spaceAudio = new Audio('/space.mp3');
    let resetAudio = new Audio('/reset.mp3');
    let letterAudios = [];
    let mappings = {};
    for (let i = 0; i < 26; i++) {
        let a = new Audio('/ios11_50_' + String.fromCharCode('a'.charCodeAt(0) + i) + '.wav');
        letterAudios.push(a);
    }
    const mappingstr = ['A	·-', 'B	-···', 'C	-·-·', 'D	-··', 'E	·', 'F	··-·', 'G	--·', 'H	····', 'I	··', 'J	·---', 'K	-·-', 'L	·-··', 'M	--', 'N	-·', 'O	---', 'P	·--·', 'Q	--·-', 'R	·-·', 'S	···', 'T	-', 'U	··-', 'V	···-', 'W	·--', 'X	-··-', 'Y	-·--', 'Z	--··'];
    for (let i = 0; i < mappingstr.length; i++) {
        let s = mappingstr[i].split('\t');
        mappings[s[1]] = s[0].toLowerCase();
    }

    const playChar = (ch) => {
        letterAudios[ch.charCodeAt(0) - 'a'.charCodeAt(0)].play();
    };

    useEffect(() => {
        window.addEventListener('keydown', (event) => {
            console.log("in key down|" + event.code+"|");
            switch (event.code) {
                case 'ArrowLeft':
                    event.preventDefault();
                    dispatch('di');
                    return;
                case 'ArrowRight':
                    event.preventDefault();
                    dispatch('da');
                    return;
                case 'Space':
                    event.preventDefault();
                    dispatch('space');
                    return;
                case 'Escape':
                    event.preventDefault();
                    dispatch('reset');
                    return;
                default:
                    return;
            }
        });
    }, []);

    const reducer = (state, action) => {
        switch (action) {
            case 'di':
                diAudio.play();
                return {
                    ...state,
                    code: state.code + '·'
                };
            case 'da':
                daAudio.play();
                return {
                    ...state,
                    code: state.code + '-'
                };
            case 'space':
                if (state.code === '') {
                    spaceAudio.play();
                    return {
                        input: state.input + ' ',
                        code: ''
                    };
                }
                let letter = mappings[state.code]
                playChar(letter);
                return {
                    input: state.input + letter,
                    code: ''
                };
            case 'reset':
                resetAudio.play();
                if (state.code === '') {
                    return {
                        input: '',
                        code: ''
                    }
                }
                return {
                    ...state,
                    code: ''
                };
            default:
                return state;
        }
    };
    const [state, dispatch] = useReducer(reducer, {code: '', input: ''});

    useEffect(() => {
        console.log("trying to connect to "+ document.domain+':8080');
        const socket = io(document.domain+':8080');
        socket.on('connect', () => {
            console.log(document.domain+':8080'+'connected!!');
        });
        socket.on('data', function(data) {
            let lines = data.split('\n');
            lines.forEach(element => {
                dispatch(element.trim());
            });
        });
        return function closeSocket() {
            socket.close();
        }
    }, []);


    

    const [showSettings, setShowSettings] = useState(false);
    const fullScreenHandle = useFullScreenHandle();




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

    const bindingsData = [
        {
          key: '←',
          function: 'Di/·'
        },
        {
          key: '→',
          function: 'Da/-'
        },
        {
          key: 'Space',
          function: 'Confirm/Space'
        },
        {
          key: 'ESC',
          function: 'Cancel/Clear'
        }
      ];
  

    return (
      <FullScreen handle={fullScreenHandle}>
      <Card title="Morse Code" extra={settingsExtra()} style={{height: '100%'}} bodyStyle={{height: '100%'}}>
      <Divider>Current Code</Divider>
      <Row>
        <Col>{state.code+"_"}</Col>
      </Row>
      <Divider>Current Input</Divider>
      <Row>
        <Col>{state.input+"_"}</Col>
      </Row>
      <Divider plain>Key Bindings</Divider>
      <Row ><Col span={24}>
        <List
            grid={{ gutter: 10, column: 4}}
            dataSource={bindingsData}
            renderItem={item => (
            <List.Item>
                <Card title={item.key}>{item.function}</Card>
            </List.Item>
            )}
        /></Col>
      </Row>
      <Divider plain>Codes</Divider>
      <Row>
          <div className="ant-table ant-table-bordered" style={{width: '100%'}}>
              <div className="ant-table-container">
                  <div className="ant-table-content">
          <table>
              <thead className="ant-table-thead">
              <tr>
                <th className="ant-table-cell">Character</th>
                <th className="ant-table-cell">Code</th>
                <th className="ant-table-cell">Character</th>
                <th className="ant-table-cell">Code</th>
                <th className="ant-table-cell">Character</th>
                <th className="ant-table-cell">Code</th>
                <th className="ant-table-cell">Character</th>
                <th className="ant-table-cell">Code</th>
                <th className="ant-table-cell">Character</th>
                <th className="ant-table-cell">Code</th>
                <th className="ant-table-cell">Character</th>
                <th className="ant-table-cell">Code</th>
                <th className="ant-table-cell">Character</th>
                <th className="ant-table-cell">Code</th>
              </tr></thead>
              <tbody className="ant-table-tbody">
                <tr className="ant-table-row ant-table-row-level-0">
                  <td className="ant-table-cell">A</td>
                  <td className="ant-table-cell">·-</td>
                  <td className="ant-table-cell">B</td>
                  <td className="ant-table-cell">-···</td>
                  <td className="ant-table-cell">C</td>
                  <td className="ant-table-cell">-·-·</td>
                  <td className="ant-table-cell">D</td>
                  <td className="ant-table-cell">-··</td>
                  <td className="ant-table-cell">E</td>
                  <td className="ant-table-cell">·</td>
                  <td className="ant-table-cell">F</td>
                  <td className="ant-table-cell">··-·</td>
                  <td className="ant-table-cell">G</td>
                  <td className="ant-table-cell">--·</td>
                </tr>
                <tr className="ant-table-row ant-table-row-level-0">
                  <td className="ant-table-cell">H</td>
                  <td className="ant-table-cell">····</td>
                  <td className="ant-table-cell">I</td>
                  <td className="ant-table-cell">··</td>
                  <td className="ant-table-cell">J</td>
                  <td className="ant-table-cell">·---</td>
                  <td className="ant-table-cell">K</td>
                  <td className="ant-table-cell">-·-</td>
                  <td className="ant-table-cell">L</td>
                  <td className="ant-table-cell">·-··</td>
                  <td className="ant-table-cell">M</td>
                  <td className="ant-table-cell">--</td>
                  <td className="ant-table-cell">N</td>
                  <td className="ant-table-cell">-·</td>
                </tr>
                <tr className="ant-table-row ant-table-row-level-0">
                  <td className="ant-table-cell">O</td>
                  <td className="ant-table-cell">---</td>
                  <td className="ant-table-cell">P</td>
                  <td className="ant-table-cell">·--·</td>
                  <td className="ant-table-cell">Q</td>
                  <td className="ant-table-cell">--·-</td>
                  <td className="ant-table-cell"></td>
                  <td className="ant-table-cell"></td>
                  <td className="ant-table-cell">R</td>
                  <td className="ant-table-cell">·-·</td>
                  <td className="ant-table-cell">S</td>
                  <td className="ant-table-cell">···</td>
                  <td className="ant-table-cell">T</td>
                  <td className="ant-table-cell">-</td>
                </tr>
                <tr className="ant-table-row ant-table-row-level-0">
                  <td className="ant-table-cell">U</td>
                  <td className="ant-table-cell">··-</td>
                  <td className="ant-table-cell">V</td>
                  <td className="ant-table-cell">···-</td>
                  <td className="ant-table-cell">W</td>
                  <td className="ant-table-cell">·--</td>
                  <td className="ant-table-cell"></td>
                  <td className="ant-table-cell"></td>
                  <td className="ant-table-cell">X</td>
                  <td className="ant-table-cell">-··-</td>
                  <td className="ant-table-cell">Y</td>
                  <td className="ant-table-cell">-·--</td>
                  <td className="ant-table-cell">Z</td>
                  <td className="ant-table-cell">--··</td>
                </tr>
              </tbody>
          </table></div></div>
          </div>
      </Row>
        
        <Drawer 
              visible={showSettings} 
              onClose={settingsClosed}
              width={720}
              title='设置'>
                <Form layout='horizontal' {...formLayout}>

                </Form>
            </Drawer>
      </Card>   
      </FullScreen> 
    );
}

export default MorseCode;
