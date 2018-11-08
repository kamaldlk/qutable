import React from 'react';
import PropTypes from 'prop-types';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';
class ActionMenu extends React.Component {
  render() {
    return (
      <div className={`${styles.kfrowIndex}`} >
        Filter
      </div>
    );
  }
}

export default ActionMenu;
