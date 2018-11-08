import React from 'react';
import PropTypes from 'prop-types';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';
import { Button } from '../../widgets/index';
class HeaderActionBtn extends React.Component {
  handleSaveRecord = () => {
    this.props.handleSaveRecord();
  }
  render() {
    const { getStyle, selectedFactor, rowSelection, rowCount,
      handleCheckBoxChanges, selectedIds, handleSaveRecord, viewForm, ...props } = this.props;
    const className = classSet({
      [styles.rowSelected]: this.props.selected
    });
    let viewFormSet = { gridTemplateColumns: '1fr ', borderTop: '1px solid transparent' };
    return (
      <div
        {...props}
        className={`${styles.rowIndex} ${styles.actionBtnIndex} ${className}`} style={viewFormSet}>
        <div className={`${styles.deleteBtn}`}> <Button type="action" size="small" onClick={() => this.handleSaveRecord()}>Save</Button> </div>
      </div>
    );
  }
}

HeaderActionBtn.propTypes = {
  index: PropTypes.number,
  selected: PropTypes.bool,
  errors: PropTypes.object,
  getStyle: PropTypes.func,
  row: PropTypes.object,
  selectedFactor: PropTypes.number,
  history: PropTypes.object,
  viewForm: PropTypes.bool,
  column: PropTypes.object,
  rowSelection: PropTypes.string,
  selectedIds: PropTypes.array,
  rowCount: PropTypes.number,
  handleCheckBoxChanges: PropTypes.func,
  handleSaveRecord: PropTypes.func
};

HeaderActionBtn.defaultProps = {
  selectedFactor: 12
};

export default HeaderActionBtn;
