import React from 'react';
import PropTypes from 'prop-types';
import styles from '../css/flexi.table.css';
class FooterActionBtn extends React.Component {
  render() {
    const { getStyle, selectedFactor, ...props } = this.props;
    return (
      <div
        {...props}
        className={`${styles.rowIndex} ${styles.actionBtnIndex}`}>
        <div className={`${styles.rowIndexCheckBox}`}>
          &nbsp;
        </div>
      </div>
    );
  }
}

FooterActionBtn.propTypes = {
  index: PropTypes.number,
  getStyle: PropTypes.func,
  selectedFactor: PropTypes.number
};

FooterActionBtn.defaultProps = {
  selectedFactor: 12
};

export default FooterActionBtn;
