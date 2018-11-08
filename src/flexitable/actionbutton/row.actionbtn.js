import React from 'react';
import PropTypes from 'prop-types';
import { Route, NavLink, Switch } from 'react-router-dom';
import Isvg from 'react-inlinesvg';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';
import { Button } from '../../widgets/index';
class RowActionBtn extends React.Component {
  handleDeleteRecord = (row) => {
    this.props.handleDeleteRecord(row.getValue("Id"));
  }
  getStyle() {
    const styles = {};
    styles['height'] = this.props.rowHeight + 'px';
    styles['lineHeight'] = this.props.rowHeight + 'px';
    return styles;
  }

  render() {
    const { getStyle, selectedFactor, handleDeleteRecord, rowSelection, selectedIds, modelId, rowHeight, ...props } = this.props;
    let isSelected = this.props.selectedIds.indexOf(this.props.row.id) > -1;
    const className = classSet({
      [styles.rowSelectedHover]: isSelected
    });
    return(
      <div
        {...props}
        className={`${styles.rowIndex} ${styles.actionBtnIndex} ${className} pointer`}>
        <div className={`${styles.deleteBtn}`}> <Button type="action" size="small" onClick={() => this.handleDeleteRecord(this.props.row)}>Delete</Button> </div>
      </div>
    );
  }
}

RowActionBtn.propTypes = {
  index: PropTypes.number,
  selected: PropTypes.bool,
  getStyle: PropTypes.func,
  row: PropTypes.object,
  selectedIds: PropTypes.array,
  modelId: PropTypes.string,
  selectedFactor: PropTypes.number,
  history: PropTypes.object,
  rowSelection: PropTypes.string,
  rowHeight: PropTypes.number,
  handleDeleteRecord: PropTypes.func
};

RowActionBtn.defaultProps = {
  selectedFactor: 12

};

export default RowActionBtn;
