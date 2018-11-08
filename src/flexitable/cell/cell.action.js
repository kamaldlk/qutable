import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import classSet from 'react-classset';
import styles from '../css/flexi.table.css';
import { isEqualObject } from '../common/helper';
import { CONSTANTS } from '../constants/constants';
class CellAction extends React.Component {
  /*
    Lifecycle
   */
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      idx: props.selectedIds,
      show: false
    };
    this.setReference = this.setReference.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const startingEdit = (!this.props.editing && nextProps.editing);
    if (startingEdit) {
      this.setState({
        data: nextProps.data
      }, () => {
        this.focusInput();
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    //return true;
    const ignoreKeys = { selection: true };
    if (!isEqualObject(this.props, nextProps, ignoreKeys) ||
        !isEqualObject(this.state, nextState)) {
      return true;
    }
    return false;
  }
  /**
   * Internal Methods
   */
  focusInput = () => {
    const node = ReactDOM.findDOMNode(this.input);
    console.log("node", node);
    if (node) {
      node.focus();
      if (node["value"]) {
        node.setSelectionRange(0, node.value.length);
      }
    }
  }

  commitEdit = () => {
    this.props.onUpdate(this.state.data);
  }

  revert = () => {
    this.setState({ data: this.props.data });
  }

  getEdges(sel, selected, focused) {
    return {
      left: (selected && this.props.isLeft) || focused,
      right: (selected && this.props.isRight) || focused,
      top: (selected && this.props.isTop) || focused,
      bottom: (selected && this.props.isBottom) || focused
    };
  }

  /**
   * Handlers
   */
  handleKeyDown = (e) => {
    if (e.keyCode === CONSTANTS.ENTER_KEY || e.keyCode === CONSTANTS.TAb_KEY ||
      e.keyCode === CONSTANTS.UP_ARROW_KEY ||
      e.keyCode === CONSTANTS.DOWN_ARROW_KEY) {
      this.commitEdit();
    } else if (e.keyCode === CONSTANTS.ESC_KEY) {
      this.revert();
    }
  }

  handleChange = (e, values) => {
    if (this.props.column.Type === 'StarRating') {
      this.setState({ data: values });
      this.props.onUpdate(values);
    } else if (this.props.column.Type === 'Boolean') {
      this.setState({ data: e });
      this.props.onUpdate(e);
    }else{
      this.setState({ data: e });
    }
  }

  preventDefault = (e) => {
    e.preventDefault();
  }

  stopPropagation = (e) => {
    e.stopPropagation();
  }

  handleBlur = (e) => {
    if (this.props.editing) {
      this.commitEdit();
    }
  }

  /*
    Render
   */

  getStyle() {
    const sel = this.props.selection;
    const editing = this.props.editing;
    const focused = this.props.focused;
    const selected = this.props.selected;
    const idx = this.state.idx;
    const hasPrevRow = this.props.hasPrevRow;
    const hasPrevColumn = this.props.hasPrevColumn;
    const error = this.props.error;
    let isSelected = idx.indexOf(this.props.row.id) > -1;
    let danger = '#F54402';
    let primary = '#00B93C';
    let white = '#FFFFFF';
    let bgColor = '#F0FBFF';
    const styles = {};
    if (!editing) {
      styles["outline"] = 'none';
      styles["userSelect"] = 'none';
      styles["cursor"] = 'default';
      styles["pointerEvents"] = 'none';
    }
    styles['textAlign'] = this.props.column.align;
    if (this.props.column.Type === "Boolean") {
      styles["gridTemplateColumns"] = "auto 20px";
    }else{
      styles["gridTemplateColumns"] = "auto";
    }
    let reduce = this.props.selected ? 10 : 10;
    styles['lineHeight'] = this.props.rowHeight - reduce + 'px';
    //  Background color
    let background;
    if (selected && error) {
      background = '#000';
      styles['background'] = background;
    } else if (error) {
      background = tinycolor(danger);
      styles['background'] = background;
    } else if (selected) {
      background = tinycolor(primary);
      styles['background'] = background;
    }
    if (editing && background) {
      background = tinycolor(white);
      styles['background'] = background;
    }

    if ((this.props.selected && (sel.startRow !== sel.endRow)) || isSelected ||
    this.props.selected && ((sel.startRow === sel.endRow) && sel.startCol !== sel.endCol)) {
      styles['background'] = bgColor;
    } else{
      styles['background'] = '#FFF';
    }
    //  Copy Edges
    const copyColor = '#00B93C';
    if (this.props.isCopyLeft) {
      styles['paddingLeft'] = (10 + 1 - 1) + 'px';
      styles['borderLeftWidth'] = '1px';
      styles['borderLeftColor'] = copyColor;
      styles['borderLeftStyle'] = 'dashed';
    }
    if (this.props.isCopyRight) {
      styles['paddingRight'] = (10 + 1 - 1) + 'px';
      styles['borderRightWidth'] = '1px';
      styles['borderRightColor'] = copyColor;
      styles['borderRightStyle'] = 'dashed';
    }
    if (this.props.isCopyTop) {
      styles['paddingTop'] = (4 + 1 - 1) + 'px';
      styles['borderTopWidth'] = '1px';
      styles['borderTopColor'] = copyColor;
      styles['borderTopStyle'] = 'dashed';
    }
    if (this.props.isCopyBottom) {
      styles['paddingBottom'] = (4 - 1) + 'px';
      styles['borderBottomWidth'] = '1px';
      styles['borderBottomColor'] = copyColor;
      styles['borderBottomStyle'] = 'dashed';
    }

    //  Selection Edges
    const edges = this.getEdges(sel, selected, focused);
    const px = focused ? 2 : 1;
    let color = '#00B93C';
    if (error) {
      color = danger;
    }
    if (edges.left) {
      styles['paddingLeft'] = (10 + 1 - px) + 'px';
      styles['borderLeftWidth'] = px + 'px';
      styles['borderLeftColor'] = color;
    }
    if (edges.right) {
      styles['paddingRight'] = (10 + 1 - px) + 'px';
      styles['borderRightWidth'] = px + 'px';
      styles['borderRightColor'] = color;
    }
    if (edges.top) {
      styles['paddingTop'] = (4 + 1 - px) + 'px';
      styles['borderTopWidth'] = px + 'px';
      styles['borderTopColor'] = color;
    }
    if (edges.bottom) {
      styles['paddingBottom'] = (4 - px) + 'px';
      styles['borderBottomWidth'] = px + 'px';
      styles['borderBottomColor'] = color;
    }
    styles['fontSize'] = 13 + 'px';
    //  Previous edges
    if (hasPrevRow) {
      styles['paddingTop'] = (4 + 1) + 'px';
      styles['borderTopWidth'] = 0 + 'px';
    }
    if (hasPrevColumn) {
      styles['paddingLeft'] = (6 + 1) + 'px';
      styles['borderLeftWidth'] = 0 + 'px';
    }
    if (this.props.column.Type === 'StarRating' || this.props.column.Type === 'Boolean') {
      Reflect.deleteProperty(styles, 'pointerEvents');
    }
    return styles;
  }

  /**
   * Rendering
   */
  setReference(node) {
    this.input = node;
  }

  render() {
    const { show } = this.state;
    const className = classSet({
      [styles.cellError]: this.props.error
    });
    let editorOpen = '';
    if (this.props.column.Type === 'Text' || this.props.column.Type === 'Number') {
      editorOpen = (<input
        style={this.getStyle()}
        className={`${styles.flexiinput}`}
        reference={this.setReference}
        value={this.props.editing ? this.state.data : this.props.data}
        handleChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        onChange={this.handleChange}
        handleBlur={this.handleBlur} />
      );
    } else{
      editorOpen = (<span style={this.getStyle()} className={`${styles.flexiinput}`}>
        { this.props.editing ? this.state.data : this.props.data }
      </span>);
    }
    return (
      <div
        className={`${styles.stretch}`}
        onDrag={ this.preventDefault }
        onMouseDown={ this.props.onMouseDown }
        onMouseOver={ this.props.onMouseOver }
        onMouseEnter = { this.props.onMouseEnter }
        onMouseLeave = { this.props.onMouseLeave }
        onDoubleClick={ this.props.onDoubleClick }
        onContextMenu={ this.props.onContextMenu }>
        {editorOpen}
      </div>
    );
  }
}

CellAction.propTypes = {
  data: PropTypes.any,
  selected: PropTypes.bool,
  focused: PropTypes.bool,
  hasPrevRow: PropTypes.bool,
  hasPrevColumn: PropTypes.bool,
  isLeft: PropTypes.bool,
  isRight: PropTypes.bool,
  isTop: PropTypes.bool,
  isBottom: PropTypes.bool,
  editing: PropTypes.bool,
  error: PropTypes.string,

  isCopyLeft: PropTypes.bool,
  isCopyRight: PropTypes.bool,
  isCopyTop: PropTypes.bool,
  isCopyBottom: PropTypes.bool,

  column: PropTypes.shape({
    options: PropTypes.array,
    align: PropTypes.string,
    Type: PropTypes.string
  }),
  rowHeight: PropTypes.number,
  selection: PropTypes.shape({
    startRow: PropTypes.number,
    endRow: PropTypes.number,
    startCol: PropTypes.number,
    endCol: PropTypes.number
  }),
  rowIndex: PropTypes.number,
  columnIndex: PropTypes.number,

  getStyle: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,

  onMouseDown: PropTypes.func,
  onMouseOver: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onContextMenu: PropTypes.func,
  selectedIds: PropTypes.array,
  row: PropTypes.object
};

export default CellAction;
