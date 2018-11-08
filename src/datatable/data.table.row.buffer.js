import {IntegerBufferSet} from './vendor/struct/integer.buffer.set';

import {clamp} from './vendor/core/clamp';
import {invariant} from './vendor/core/invariant';
var MIN_BUFFER_ROWS = 3;
var MAX_BUFFER_ROWS = 6;

class FixedDataTableRowBuffer {
  constructor(
    rowsCount,
     defaultRowHeight,
    viewportHeight,
    rowHeightGetter,
    bufferRowCount
  ) {
    invariant(
      defaultRowHeight !== 0,
      "defaultRowHeight musn't be equal 0 in FixedDataTableRowBuffer"
    );

    this.bufferSet = new IntegerBufferSet();
    this.defaultRowHeight = defaultRowHeight;
    this.viewportRowsBegin = 0;
    this.viewportRowsEnd = 0;
    this.maxVisibleRowCount = Math.ceil(viewportHeight / defaultRowHeight) + 1;
    this.bufferRowsCount = bufferRowCount != null
      ? bufferRowCount
      : clamp(
        Math.floor(this.maxVisibleRowCount/2),
        MIN_BUFFER_ROWS,
        MAX_BUFFER_ROWS
      );
    this.rowsCount = rowsCount;
    this.rowHeightGetter = rowHeightGetter;
    this.rows = [];
    this.viewportHeight = viewportHeight;

    this.getRows = this.getRows.bind(this);
    this.getRowsWithUpdatedBuffer = this.getRowsWithUpdatedBuffer.bind(this);
  }

  getRowsWithUpdatedBuffer() {
    var remainingBufferRows = 2 * this.bufferRowsCount;
    var bufferRowIndex =
      Math.max(this.viewportRowsBegin - this.bufferRowsCount, 0);
    while (bufferRowIndex < this.viewportRowsBegin) {
      this.addRowToBuffer(
        bufferRowIndex,
        this.viewportRowsBegin,
        this.viewportRowsEnd - 1
      );
      bufferRowIndex++;
      remainingBufferRows--;
    }
    bufferRowIndex = this.viewportRowsEnd;
    while (bufferRowIndex < this.rowsCount && remainingBufferRows > 0) {
      this.addRowToBuffer(
        bufferRowIndex,
        this.viewportRowsBegin,
        this.viewportRowsEnd - 1
      );
      bufferRowIndex++;
      remainingBufferRows--;
    }
    return this.rows;
  }

  getRows(
    firstRowIndex,
    firstRowOffset
  ) {
    var top = firstRowOffset;
    var totalHeight = top;
    var rowIndex = firstRowIndex;
    var endIndex =
      Math.min(firstRowIndex + this.maxVisibleRowCount, this.rowsCount);

    this.viewportRowsBegin = firstRowIndex;
    while (rowIndex < endIndex ||
        (totalHeight < this.viewportHeight && rowIndex < this.rowsCount)) {
      this.addRowToBuffer(
        rowIndex,
        firstRowIndex,
        endIndex - 1
      );
      totalHeight += this.rowHeightGetter(rowIndex);
      ++rowIndex;
      this.viewportRowsEnd = rowIndex;
    }

    return this.rows;
  }

  addRowToBuffer(
    rowIndex,
    firstViewportRowIndex,
    lastViewportRowIndex
  ) {
      var rowPosition = this.bufferSet.getValuePosition(rowIndex);
      var viewportRowsCount = lastViewportRowIndex - firstViewportRowIndex + 1;
      var allowedRowsCount = viewportRowsCount + this.bufferRowsCount * 2;
      if (rowPosition === null &&
          this.bufferSet.getSize() >= allowedRowsCount) {
        rowPosition =
          this.bufferSet.replaceFurthestValuePosition(
            firstViewportRowIndex,
            lastViewportRowIndex,
            rowIndex
          );
      }
      if (rowPosition === null) {
        rowPosition = this.bufferSet.getNewPositionForValue(rowIndex);
        this.rows[rowPosition] = rowIndex;
      } else {
        this.rows[rowPosition] = rowIndex;
      }
  }
}

export {FixedDataTableRowBuffer};
