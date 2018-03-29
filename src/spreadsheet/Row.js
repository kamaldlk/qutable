import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import CellShape from './CellShape';

class Row extends PureComponent {
  render() {
    console.log('this.props.children', this.props.children);
    return (
      <tr>
        {this.props.children}
      </tr>
    );
  }
}

Row.propTypes = {
  row: PropTypes.number.isRequired,
  cells: PropTypes.arrayOf(PropTypes.shape(CellShape)).isRequired,
  children: PropTypes.element.isRequired
};

export default Row;
