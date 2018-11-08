import React from 'react';
import PropTypes from 'prop-types';
import styles from '../css/flexi.table.css';
import Isvg from 'react-inlinesvg';
import classSet from 'react-classset';
class RowOpenForm extends React.Component {
  handleviewForm = (row) => {
    if (row) {
      this.props.history.push(`/process/${this.props.modelId}/form/${row.getValue("_ResourceId")}/${row.getValue("Id")}`);
    }
  }
  getStyle() {
    const styles = {};
    styles['height'] = this.props.rowHeight + 'px';
    styles['lineHeight'] = this.props.rowHeight + 'px';
    return styles;
  }

  render() {
    const { getStyle, selectedFactor, rowSelection, selectedIds, modelId, rowHeight, ...props } = this.props;
    let isSelected = this.props.selectedIds.indexOf(this.props.row.id) > -1;
    const className = classSet({
      [styles.rowSelectedHover]: isSelected
    });
    return(
      <div
        {...props}
        className={`${styles.rowIndex} ${className} pointer`} onClick={() => this.handleviewForm(this.props.row)}>
        <Isvg className={`${styles.rowindexValues} `} src={require('../images/viewform.svg')} cacheGetRequests={true} />
      </div>
    );
  }
}

RowOpenForm.propTypes = {
  index: PropTypes.number,
  selected: PropTypes.bool,
  getStyle: PropTypes.func,
  row: PropTypes.object,
  selectedIds: PropTypes.array,
  modelId: PropTypes.string,
  selectedFactor: PropTypes.number,
  history: PropTypes.object,
  rowSelection: PropTypes.string,
  rowHeight: PropTypes.number
};

RowOpenForm.defaultProps = {
  selectedFactor: 12

};

export default RowOpenForm;
