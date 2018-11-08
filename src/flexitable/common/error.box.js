import React from 'react';
import PropTypes from 'prop-types';
import styles from '../css/flexi.table.css';

class ErrorBox extends React.Component {
  getErrors() {
    const errors = this.props.errors;
    return Object.keys(errors).map((key, i) => {
      return (
        <p key={i}>
          { errors[key] }
        </p>
      );
    });
  }
  render() {
    return (
      <div className={`${styles.errorboxBase}`}>
        { this.getErrors() }
      </div>
    );
  }
}

ErrorBox.propTypes = {
  errors: PropTypes.array.isRequired,
  getStyle: PropTypes.func
};

export default ErrorBox;
