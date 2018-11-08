import React from 'react';
import PropTypes from 'prop-types';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';
import { CheckBox } from '../../widgets/index';

class HeaderIndex extends React.Component {
  render() {
    const { getStyle, selectedFactor, rowSelection, rowCount,
      handleCheckBoxChanges, selectedIds, viewForm, ...props } = this.props;
    const className = classSet({
      [styles.rowSelected]: this.props.selected
    });
    let isSelected = this.props.rowCount !== 0 && (this.props.selectedIds.length === this.props.rowCount);
    let viewFormSet = { gridTemplateColumns: '1fr ', borderTop: '1px solid transparent' };
    return (
      <div
        { ...props }
        className={`${styles.rowIndex} ${className}`} style={viewFormSet}>
        <div className={`${styles.rowIndexCheckBox}`}>
          <CheckBox value={isSelected} name={'grid' + this.props.index}
            onChange={() => this.props.handleCheckBoxChanges()} />
        </div>
      </div>
    );
  }
}

HeaderIndex.propTypes = {
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

HeaderIndex.defaultProps = {
  selectedFactor: 12
};

export default HeaderIndex;
