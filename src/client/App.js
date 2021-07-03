import { createFromIconfontCN, HomeOutlined, RocketOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router, Link, Route, Switch
} from 'react-router-dom';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import './app.css';
import Gloves from './components/Gloves/gloves';
import Grid from './components/Grid/Grid';
import ChineseIME from './components/ChineseIME/ChineseIME';
import Keyboard from './components/Keyboard/keyboard';
import Ninekeys from './components/NineKeys/ninekeys';
import logo from './logo.png';


const {
    Header, Content, Footer, Sider,
} = Layout;
const { SubMenu } = Menu;
const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2182600_242a9qfnekj.js',
});

const Pagelayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [ip, setIp] = useState('');
    useEffect(() => {
        fetch('/api/ip')
            .then(res => res.json())
            .then(data => setIp(data.ip));
    }, []);
    return (
      <Layout style={{ minHeight: '100vh' }}>
          <Sider
              theme="light" collapsible collapsed={collapsed} onCollapse={(state, type) => setCollapsed(state)}
              style={{ background: 'white' }}
            >
              <div className="logo" style={{ height: '32px', margin: '16px', background: 'white' }}>
                  <img src={logo} style={{ width: '100%' }} />
                </div>
              <Menu defaultSelectedKeys={[useLocation().pathname]} mode="inline">
                  <Menu.Item key="/" icon={<HomeOutlined />}>
                      <Link to="/">Home</Link>
                    </Menu.Item>
                  <Menu.Item key="/keyboard" icon={<IconFont type="iconkeyboard" />}>
                      <Link to="/keyboard">Keyboard</Link>
                    </Menu.Item>
                  <Menu.Item key="/grid" icon={<IconFont type="iconcursor" />}>
                      <Link to="/grid">Grid</Link>
                    </Menu.Item>
                  <Menu.Item key="/gloves" icon={<RocketOutlined />}>
                      <Link to="/gloves">Gloves</Link>
                    </Menu.Item>
                    <Menu.Item key="/chinese" icon={<IconFont type="iconfuhao-zhongwen" />}>
                      <Link to="/chinese">Chinese</Link>
                    </Menu.Item>

                    <Menu.Item key="/ninekeys" icon={<IconFont type="iconkeyboard" />}>
                      <Link to="/ninekeys">Ninekeys</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
          <Layout className="site-layout">
              <Header theme="light" className="site-layout-background" style={{ padding: 0, background: '#fff' }} />
              <Content style={{ margin: '0 16px' }}>
                  <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                      <Switch>
                          <Route path="/keyboard"><Keyboard /></Route>
                          <Route path="/grid"><Grid /></Route>
                          <Route path="/gloves"><Gloves /></Route>
                          <Route path="/chinese"><ChineseIME /></Route>


                          <Route path="/ninekeys"><Ninekeys /></Route>
                          <Route path="/">
                              Socket 发送数据地址：
{ip}
                              :8081
</Route>
                        </Switch>
                    </div>
                </Content>
              <Footer style={{ textAlign: 'center' }}>Weinan Shi ©2021</Footer>
            </Layout>
        </Layout>
    );
};

const App = () => (
    <Router>
    <Pagelayout />
  </Router>
);
export default App;
// export default class App extends Component {
//   state = { username: null };

//   componentDidMount() {
//     fetch('/api/getUsername')
//       .then(res => res.json())
//       .then(user => this.setState({ username: user.username }));
//   }

//   render() {
//     const { username } = this.state;
//     return (
//       <div>
//         {/* {username ? <h1>{`Hello ${username}`}</h1> : <h1>Loading.. please wait!</h1>}
//         <img src={ReactImage} alt="react" /> */}
//         <Keyboard />
//       </div>
//     );
//   }
// }
