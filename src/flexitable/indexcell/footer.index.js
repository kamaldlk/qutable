import React from 'react';
import PropTypes from 'prop-types';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';
class FooterRowIndex extends React.Component {
  render() {
    const { getStyle, selectedFactor, ...props } = this.props;
    const className = classSet({
      [styles.rowSelected]: this.props.selected
    });
    return (
      <div
        {...props}
        className={`${styles.rowIndex} ${className}`}>
        <div className={`${styles.rowindexValues} pointer`}>
          +
        </div>
      </div>
    );
  }
}

FooterRowIndex.propTypes = {
  index: PropTypes.number,
  selected: PropTypes.bool,
  errors: PropTypes.object,
  getStyle: PropTypes.func,
  selectedFactor: PropTypes.number
};

FooterRowIndex.defaultProps = {
  selectedFactor: 12
};

export default FooterRowIndex;
