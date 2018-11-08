import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './checkbox.css';
class CheckBox extends Component {
  static propTypes = {
    value: PropTypes.bool,
    rowIdx: PropTypes.number,
    handleCheckBoxChanges: PropTypes.func,
    column: PropTypes.shape({
      key: PropTypes.string,
      onCellChange: PropTypes.func
    }),
    dependentValues: PropTypes.object
  };
  render() {
    let checked = this.props.value != null ? this.props.value : false || false;
    let checkboxName = 'checkbox' + this.props.rowIdx;
    return (
      <div className={`${styles.rowIndexCheckBox}`} >
        <label className={`${styles.checkBoxContainer}`}>
          <input type="checkbox" name={checkboxName} checked={checked} onChange={() => this.props.handleCheckBoxChanges()}/>
          <span className={`${styles.checkmark}`}/>
        </label>
      </div>

    );
  }
}
export { CheckBox };
