import React from 'react';
import PropTypes from 'prop-types';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';

class HeaderOpenForm extends React.Component {
  render() {
    const { getStyle, selectedFactor, rowSelection, rowCount,
      handleCheckBoxChanges, selectedIds, viewForm, ...props } = this.props;
    const className = classSet({
      [styles.rowSelected]: this.props.selected
    });
    let viewFormSet = { gridTemplateColumns: '1fr ', borderTop: '1px solid transparent' };
    return (
      <div
        {...props}
        className={`${styles.rowIndex} ${className}`} style={viewFormSet}>
       &nbsp;
      </div>
    );
  }
}

HeaderOpenForm.propTypes = {
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
  handleCheckBoxChanges: PropTypes.func
};

HeaderOpenForm.defaultProps = {
  selectedFactor: 12
};

export default HeaderOpenForm;
