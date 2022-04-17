import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "./global.scss"
// import 'react-animated-router/animate.css'; //导入样式文件
import { HashRouter } from 'react-router-dom';
// Redux
import store from './redux/store'
import { Provider } from 'react-redux'

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

window._AMapSecurityConfig = {
  securityJsCode: 'bdd3497d027f90e7ec2e6c9b43fad5c4',
}