import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import CellShape from './cell.shape';
import styles from '../css/datasheet.css';
export default class ValueViewer extends PureComponent {
  render() {
    const { value } = this.props;
    return (
      <span className={`${styles.valueViewer}`}>
        {value}
      </span>
    );
  }
}

ValueViewer.propTypes = {
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  cell: PropTypes.shape(CellShape),
  value: PropTypes.node.isRequired
};
