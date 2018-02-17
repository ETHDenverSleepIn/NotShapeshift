import { App } from 'app/app';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import './index.scss';

try {
  localStorage.setItem('inherited', 'false');
  localStorage.setItem('only-exported', 'true');
} catch {
  // tslint:disable-next-line:no-console
  console.log('error with local storage');
}

ReactDOM.render((
  <HashRouter>
    <App />
  </HashRouter>
), document.getElementById('app'));
