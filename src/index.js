import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './reset.css';
import DataSheetRoot from './datasheet/data.sheet.root';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<DataSheetRoot />, document.getElementById('root'));
registerServiceWorker();
