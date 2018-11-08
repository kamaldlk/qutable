import React from 'react';
import PropTypes from 'prop-types';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';

class FooterCell extends React.Component {
  render() {
    const { getStyle, selectedFactor, ...props } = this.props;
    const className = classSet({
      [styles.headerCellSelect]: this.props.selected
    });
    return (
      <div
        { ...props }
        className={`${styles.footerCell} ${className}`} >
        {(this.props.column.Type === 'Number' ||
        this.props.column.Type === 'Date') &&
        <div><span className={`${styles.avgMax} left`}>&nbsp;</span>
          <span className={`${styles.avgMax} right`}>&nbsp;</span></div>}
      </div>
    );
  }
}

FooterCell.propTypes = {
  column: PropTypes.object,
  selected: PropTypes.bool,
  getStyle: PropTypes.func,

  selectedFactor: PropTypes.number
};

FooterCell.defaultProps = {
  selectedFactor: 12
};

export default FooterCell;
