import React from 'react';
import PropTypes from 'prop-types';
import classSet from 'react-classset';
import Isvg from 'react-inlinesvg';
import styles from '../css/flexi.table.css';
import { getsortedColumns } from '../common/utils';
class HeaderCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  handleSort = (col, sort) => {
    this.props.handleSort(col, sort);
  }
  render() {
    const { getStyle, selectedFactor, handleSort, ...props } = this.props;
    const className = classSet({
      [styles.headerCellSelect]: this.props.selected
    });
    const { show } = this.state;
    return (
      <div
        { ...props }
        className={`${styles.headerCell} ${className}`}>
        <div className={`left`}>
          <ul className={`left`}>
            {this.props.column.Fixed && <li className={`left`}>
              <Isvg className={`${styles.icons} left margin-r5`} src={require('../images/lock.svg')}
                cacheGetRequests={true} />
            </li>}
            {this.props.column.Type === 'Date' && <li className={`left`}>
              <Isvg className={`${styles.icons} left margin-r5`} src={require('../images/' + this.props.column.Type + '.svg')}
                cacheGetRequests={true} />
            </li>}
          </ul>
          <h5 className={`left`}>{this.props.column.Label || this.props.column.Name} {this.props.column['Required'] && <span className={`mandatory`}>*</span>}</h5>
          {this.props.column.Hint && <div className={`left`}>
            s
          </div>}
        </div>
        <div className={`right`}>
          <ul className={`left`}>
            {getsortedColumns(this.props.sort, this.props.column.Id, 'ASC') > -1 &&
            <li className={`left`} onClick={() => this.handleSort(this.props.column, this.props.sort)}>
              <Isvg className={`${styles.icons} pointer margin-l5 margin-nr5 right`} src={require('../images/ascending-sorting.svg')}
                cacheGetRequests={true} />
            </li>}
            {getsortedColumns(this.props.sort, this.props.column.Id, 'DSC') > -1 &&
              <li className={`left`} onClick={() => this.handleSort(this.props.column, this.props.sort)}>
                <Isvg className={`${styles.icons} pointer margin-l5 margin-nr5 right`} src={require('../images/descending-sorting.svg')}
                  cacheGetRequests={true} />
              </li>}
            {(getsortedColumns(this.props.sort, this.props.column.Id, 'DSC') === -1) &&
            (getsortedColumns(this.props.sort, this.props.column.Id, 'ASC') === -1) &&
              <li className={`left`} onClick={() => this.handleSort(this.props.column, this.props.sort)}>
                <Isvg className={`${styles.icons} pointer margin-l5 margin-nr5 right`} src={require('../images/sort-icon.svg')}
                  cacheGetRequests={true} />
              </li>}
          </ul>
        </div>
      </div>
    );
  }
}
HeaderCell.propTypes = {
  column: PropTypes.object,
  selected: PropTypes.bool,
  getStyle: PropTypes.func,
  selectedFactor: PropTypes.number,
  onContextMenu: PropTypes.func,
  handleSort: PropTypes.func,
  sort: PropTypes.array
};

HeaderCell.defaultProps = {
  selectedFactor: 12
};

export default HeaderCell;
