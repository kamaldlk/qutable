import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './reset.css';
import './datasheet/css/datasheet.css';
import DataSheetRoot from './datasheet/data.sheet.root';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<DataSheetRoot />, document.getElementById('root'));
registerServiceWorker();
