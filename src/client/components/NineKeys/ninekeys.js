/* eslint-disable no-shadow */
import {
    Avatar, Button, Card, Col, Divider, Row, Space, Drawer, Form, InputNumber, Switch
} from 'antd';
import { FullscreenExitOutlined, FullscreenOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useEffect, useReducer, useState } from 'react';
import './ninekeys.css';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import io from 'socket.io-client';

// let config = {
//     row: 3,
//     col: 3,
//     labels: ['主风机', '主泵', '主通信机', '照明', '+', '摄像', '副风机', '副泵', '备通信机'],
//     initPos: [1, 1],
//     duration: 2000,
//     t2: 10000,
//     taskNum: 10,
//     tasks: null
// };
const initialState = {
    pos: [0, 0],
    currTask: -1,
    click: false
};

let corpusText = 'the of and to in that it is for you was with on as have but be they are at by he not this we or do from a an so were know like all there his about if has what just yeah my had would more when can who out which said their no she up been think well than some will because other did new me time her them also people get right these now then could only really into how see your most good after even much our here where over him may go any first years way those too very many going should such got year work make say back last little still between something mean both each lot before being same through thing want use while times down things take cells made off day kind data us never since might world another different using around why house need though long during number part home state life big come york found american under information president however own percent every probably high study always story better thought few look less against government show end find actually great family put point old sure news money clinton states week least school genes real figure case yes pretty today place system without next best city children course analysis am pm expression cell group set again public small gene let ever went whether must maybe results company once guess although days anything either second several women book national control doing enough fact having love human until far man patients service important among united care bad name help away done read feel getting program yet white give business report stuff country example whole problem seen early within makes ago came often left federal general protein almost water rather night washington keep large change war true call major hard site tell known studies health someone law movie possible question already making table post area able play legal took similar else office kids bush sequence saying everything market shown center along later bit sort angel test become buffy idea pay person order run bill power type past security level age paper job levels car words try john support according believe nothing street together nice start others live side word effect death recent likely top men remember talk means reported black hours significant sense services quite political cost guy months especially single present half available history companies young room changes model season head sometimes research local america cases air department talking rate reason town instead process issue evidence free role members across plan watch interesting open seem further additional saw proteins activity increase current problems described reports thus form close low usually follow everyone hand development provide music response south risk deal groups university former couple higher minutes anyone court comes goes buy page financial perhaps english act late whose specific texas value full lead team recently north heard taken mother taking front wrong above thinking interest stock child class result sequences party food include parents matter programs whatever gets involved standard spike himself game morning gonna growth month tax drug officials lost weeks common addition woman west associated clear future social function hope turn coming compared questions outside certain fun management friends art century average region itself effects summer blood individual final tv college third language disease difference friend understand anyway issues short stop cancer culture cut observed move computer congress list review administration special exactly behind except expected july interview required ones potential methods face community military god living particular international body identified film values normal policy finally economic campaign due themselves quality performance therefore books personal rule period population wall heart building terms lower related main private father slate added director points became action subject answer position medical amount hear happy red wife church longer article students piece technology size media leave press ask view performed near central agency inside east industry gone americans stories senate costs section approach space worth cause hit board binding began complex previously british experience sites sex french strong series rest soon nearly poor husband ways note web budget light expressed david cannot force lines journal despite design nation agree internet independent fine various monday cover committee toward education capital executive bring easy wrote myself middle stay star park reading difficult earlier tuesday decision one alone hour miles differences range television everybody original conditions chief provided island dead visit museum attention please fall presence greater certainly species products built particularly sunday guys address plus price term running rates complete trade police sounds dollars road record product simply file field method association consider factors structure hot california brought son boy funny generally samples organization numbers benefits character moment foreign happen meet drive watching girl economy somebody writing evil rights papers spent mail determine friday events share meeting phone mice popular supposed george upon sound ability access families justice chance discussion written staff previous significantly corporate production wednesday angeles spend domain republican patient entire received primary daily episode completely rules relationship positive training suggest china version key situation thursday sample drugs containing green march project factor modern unless obtained published multiple schools lack michael cool return tissue vote favorite mostly collection brain below credit indeed fire society places huge beyond energy died sorry defense hair source enjoy base highly decided click ok loss changed hold countries older thanks check developed background june experiments trial clearly basis allowed offer effective eat natural apparently directly stage wait paid race remains nuclear account kept necessary distribution official continue choice reaction door write wonder volume none cold step kill land serious weight intelligence magazine picture bought starting allow acid western ground baby software concentration king mine bank beginning rock network appears clinical genome send simple practice proposed speech beach efforts learn member nature attack overall pressure release blue appropriate unit limited walk clients dear chinese eyes effort insurance direct comment box contrast income reason commission appear relative hospital initial player equal target employee knowledge create pick critics win hello fish consistent measure senior';
let corpus = corpusText.split(' ');

const Ninekeys = () => {
    const [config, setConfig] = useState({
        row: 3,
        col: 3,
        labels: ['主风机', '主泵', '主通信机', '照明', '+', '摄像', '副风机', '副泵', '备通信机'],
        initPos: [1, 1],
        duration: 2000,
        t2: 10000,
        taskNum: 10,
        tasks: null
    });
    const [showSettings, setShowSettings] = useState(false);
    const fullScreenHandle = useFullScreenHandle();
    const formLayout = {
        labelCol: {
          span: 8,
        },
        wrapperCol: {
          span: 16,
        },
        labelAlign: 'left'
    };
   
    const keychars = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
    const getCandidates = (codes) => {
        let ret = [];
        for (let w=0; w<corpus.length; w+=1) {
            let word = corpus[w];
            if (word.length < codes.length) {continue};
            let ok = true;
            for (let i=0; i<codes.length; i+=1) {
                if (keychars[codes[i]].indexOf(word[i]) === -1) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                ret.push(word);
            }
        }
        return ret;
    }
    const reducer = (state, action) => {
        console.log('in reducer:'+ (new Date()).getTime());
        console.log(state.code.toString(), state.candidates.toString());
        switch (action.type) {
            case 0: //move
                const dirs = [5, 2, 1, 0, 3, 6, 7, 8];
                const xdelta = [0, -1, -1, -1, 0, 1, 1, 1];
                const ydelta = [1, 1, 0, -1, -1, -1, 0, 1];
                let angle = Math.atan2(action.posy, action.posx);
                let dirindex = (8+ Math.floor((angle + Math.PI / 8)*4 /Math.PI)) % 8;
                return {
                    ...state,
                    pos: [state.pos[0] + xdelta[dirindex], state.pos[1] + ydelta[dirindex]]
                }
            case 1: //click
                let newInput = state.userInput;
                if (state.candidates.length > 0 && state.candidates.length <= 9) {
                    newInput = newInput + state.candidates[state.pos[0] * 3 + state.pos[1]] + " ";
                    return {
                        ...state,
                        code: [],
                        pos: config.initPos,
                        labels: keychars,
                        candidates: [],
                        userInput: newInput
                    }
                } else {
                    let newcodes = state.code;
                    newcodes.push(state.pos[0] * 3 + state.pos[1]);
                    let cands = getCandidates(newcodes);
                    let newLabels = state.labels;
                    if (cands.length > 0 && cands.length < 9) {
                        newLabels = cands;
                    } else if (cands.length == 0) {
                        newcodes = [],
                        newLabels = keychars;
                    }
                    return {
                        ...state,
                        code: newcodes,
                        pos: config.initPos,
                        labels: newLabels,
                        candidates: cands
                    }
                }
            default:
                throw new Error();
        }
    };
    const [state, dispatch] = useReducer(reducer, {pos: config.initPos, code: [], labels: keychars, userInput: '', candidates: []});


    useEffect(() => {
        window.addEventListener('keydown', (event) => {
            console.log("in key down|" + event.code+"|");
            switch (event.code) {
                case 'ArrowLeft':
                    event.preventDefault();
                    dispatch({type: 0, posx: -1, posy: 0});
                    return;
                case 'ArrowRight':
                    event.preventDefault();
                    dispatch({type: 0, posx: 1, posy: 0});
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    dispatch({type: 0, posx: 0, posy: 1});
                    return;
                case 'ArrowDown':
                    event.preventDefault();
                    dispatch({type: 0, posx: 0, posy: -1});
                    return;
                case 'KeyA':
                    event.preventDefault();
                    dispatch({type: 1, posx: 0, posy: 0});
                    return;
                default:
                    return;
            }
        });
        console.log("trying to connect to "+ document.domain+':8080');
        const socket = io(document.domain+':8080');
        socket.on('connect', () => {
            console.log(document.domain+':8080'+' connected!!');
        });
        socket.on('data', function(data) {
            let lines = data.split('\n');
            lines.forEach((element) => {
                const items = element.split(' ');
                dispatch({type: parseInt(items[0]), posx: parseFloat(items[1]), posy: parseFloat(items[2])});
            });
        });
    }, []);


    // eslint-disable-next-line prefer-const
    let buttons = [];
    for (let i = 0; i < config.row * config.col; i += 1) {
        let status = 'normal';
        if (state.pos[0] * config.col + state.pos[1] === i) {
            status = 'selected';
        }
        buttons.push(
          <Col key={i.toString()} span={24 / config.col}>
            <Avatar size={128} className={status}>{state.labels[i]}</Avatar>
          </Col>,
        );
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


    return (
      <FullScreen handle={fullScreenHandle}>
        <Card title="Gloves" extra={settingsExtra()} style={{ height: '100%' }} bodyStyle={{ height: '100%' }}>
            <div style={{textAlign: 'center'}}>
                <Button onClick={() => dispatch({type: 1, posx:0, posy:1})} disabled={state.currTask >= 0 && state.currTask < config.taskNum}>开始</Button>
                <Button onClick={() => dispatch('next')} disabled={state.currTask < 0 || state.currTask >= config.taskNum}>下一个</Button>
                <Button onClick={() => dispatch('end')} disabled={state.currTask < 0 || state.currTask >= config.taskNum}>结束</Button>
                {state.code.join(' ')} <br/>
                Input: {state.userInput}_<br/>
                {state.candidates.join(' ')}
            </div>
            <div className="task">
            {state.currTask < 0 && '未开始'}
            {state.currTask >= 0 && state.currTask < config.taskNum
                && `${state.currTask + 1}/${config.taskNum}:点击 ${state.tasks[state.currTask]} 按钮`}
            {state.currTask >= config.taskNum && '已结束'}
            </div>
            <Divider />
            <Row justify="center" style={{ textAlign: 'center' }} gutter={[10, 40]}>
            {buttons}
            </Row>
            <Drawer 
                visible={showSettings} 
                onClose={settingsClosed}
                width={720}
                title='设置'>
                    <Form layout='horizontal' {...formLayout}>
                        {/* <Form.Item label="绑定鼠标事件">
                            <Switch checked={useMouse} onChange={v=>setUseMouse(v)} />
                        </Form.Item> */}
                        <Divider>参数</Divider>
                        <Form.Item label="时间阈值大小">
                            <Row gutter={16}>
                                <Col flex={1}>
                                    <Form.Item label="点击持续时间(ms)" layout='horizontal'>
                                        <InputNumber min={0} max={10000} onChange={v=>setConfig({...config, duration: v})} value={config.duration} step={1000}/>
                                    </Form.Item>
                                </Col>
                                
                                <Col flex={1}>
                                    <Form.Item label="任务持续时间(ms)" layout='horizontal'>
                                        <InputNumber min={0} max={100000} onChange={v=>setConfig({...config, t2: v})} value={config.t2} step={1000} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>
                </Drawer>
        </Card>
      </FullScreen>
    );
};

export default Ninekeys;
