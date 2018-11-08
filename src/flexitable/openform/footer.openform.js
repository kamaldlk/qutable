import React from 'react';
import PropTypes from 'prop-types';
import styles from '../css/flexi.table.css';
class FooterOpenForm extends React.Component {
  render() {
    const { getStyle, selectedFactor, ...props } = this.props;
    return (
      <div
        {...props}
        className={`${styles.rowIndex}`}>
        <div className={`${styles.rowIndexCheckBox}`}>
          &nbsp;
        </div>
      </div>
    );
  }
}

FooterOpenForm.propTypes = {
  index: PropTypes.number,
  getStyle: PropTypes.func,
  selectedFactor: PropTypes.number
};

FooterOpenForm.defaultProps = {
  selectedFactor: 12
};

export default FooterOpenForm;
