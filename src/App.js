import React from 'react';
import FlexiTable from './flexitable/flexitable';
import { FormDataWrapper } from './form.model';
import PropTypes from 'prop-types';
import {data} from './rows';
class App extends React.Component {

  constructor(props) {
    super(props);
    let columns = data.Columns;
    let modelWrapper = FormDataWrapper(data);
    this.state = {
       columns,
       modelWrapper
    };
  }


  saveData() {

  }

  render() {
    if(this.state.columns) {
      return (
          <FlexiTable columns={this.state.columns} model={this.state.modelWrapper}
            appName={'list'} onSave={() => this.saveData()} history={this.props.history}/>
      );
    } else {
      return <div>Loading</div>;
    }
  }
}


export default App;
