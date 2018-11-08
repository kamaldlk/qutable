import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
class Autosize extends React.Component {
  constructor() {
    super();
    this.state = {
      width: 0,
      height: 0
    };
  }

  componentDidMount() {
    this.autosize();
    this.handleWindowResize = this.handleWindowResize.bind(this);
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize() {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this.autosize();
    }, 300);
  }

  autosize() {
    const node = ReactDOM.findDOMNode(this);
    const box = node.parentNode.getBoundingClientRect();
    this.setState({
      width: box.width,
      height: box.height
    });
  }

  render() {
    if (React.Children.count(this.props.children) > 1) {
      console.warn('AutoSize only works with a single child element.');
    }

    const { width, height } = this.state;
    const child = this.props.children;
    const newChild = React.cloneElement(child, { width, height });
    return newChild;
  }
}
Autosize.propTypes = {
  children: PropTypes.node
};

export default Autosize;
