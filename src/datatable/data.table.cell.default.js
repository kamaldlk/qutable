import React from 'react';
import PropTypes from 'prop-types';
import {cx} from './vendor/core/cx';
import {joinClasses} from './vendor/core/joinclasses';

class FixedDataTableCellDefault extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    columnKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    rowIndex: PropTypes.number
  };

  render() {
    var {height, width, style, className, children, columnKey, rowIndex, ...props} = this.props;

    var innerStyle = {
      height,
      width,
      ...style,
    };

    return (
      <div
        {...props}
        className={joinClasses(
          cx('fixedDataTableCellLayoutWrap1'),
          cx('publicFixedDataTableCellWrap1'),
          className,
        )}
        style={innerStyle}>
        <div
          className={joinClasses(
            cx('fixedDataTableCellLayoutWrap2'),
            cx('publicFixedDataTableCellWrap2'),
          )}>
          <div
            className={joinClasses(
              cx('fixedDataTableCellLayoutWrap3'),
              cx('publicFixedDataTableCellWrap3'),
            )}>
            <div className={cx('publicFixedDataTableCellCellContent')}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FixedDataTableCellDefault;
