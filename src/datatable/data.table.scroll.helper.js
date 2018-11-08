import {PrefixIntervalTree} from './vendor/struct/prefixintervaltree';
import {clamp} from './vendor/core/clamp';

var BUFFER_ROWS = 5;
var NO_ROWS_SCROLL_RESULT = {
  index: 0,
  offset: 0,
  position: 0,
  contentHeight: 0,
};

class FixedDataTableScrollHelper {
  constructor(
    rowCount,
    defaultRowHeight,
    viewportHeight,
    rowHeightGetter,
    defaultSubRowHeight = 0,
    subRowHeightGetter,
  ) {
    const defaultFullRowHeight = defaultRowHeight + defaultSubRowHeight;
    this.rowOffsets = PrefixIntervalTree.uniform(rowCount, defaultFullRowHeight);
    this.storedHeights = new Array(rowCount);
    for (var i = 0; i < rowCount; ++i) {
      this.storedHeights[i] = defaultFullRowHeight;
    }
    this.rowCount = rowCount;
    this.position = 0;
    this.contentHeight = rowCount * defaultFullRowHeight;

    this.rowHeightGetter = rowHeightGetter;
    this.subRowHeightGetter = subRowHeightGetter;
    this.fullRowHeightGetter = (rowIdx) => {
      const rowHeight = this.rowHeightGetter ? this.rowHeightGetter(rowIdx) :
        defaultRowHeight;
      const subRowHeight = this.subRowHeightGetter ? this.subRowHeightGetter(rowIdx) :
        defaultSubRowHeight;
      return rowHeight + subRowHeight;
    };
    this._viewportHeight = viewportHeight;
    this.scrollRowIntoView = this.scrollRowIntoView.bind(this);
    this.setViewportHeight = this.setViewportHeight.bind(this);
    this.scrollBy = this.scrollBy.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.scrollToRow = this.scrollToRow.bind(this);
    this.setRowHeightGetter = this.setRowHeightGetter.bind(this);
    this.setSubRowHeightGetter = this.setSubRowHeightGetter.bind(this);
    this.getContentHeight = this.getContentHeight.bind(this);
    this.getRowPosition = this.getRowPosition.bind(this);

    this.updateHeightsInViewport(0, 0);
  }

  setRowHeightGetter(/*function*/ rowHeightGetter) {
    this.rowHeightGetter = rowHeightGetter;
  }

  setSubRowHeightGetter(/*function*/ subRowHeightGetter) {
    this.subRowHeightGetter = subRowHeightGetter;
  }

  setViewportHeight(viewportHeight) {
    this._viewportHeight = viewportHeight;
  }

  getContentHeight() {
    return this.contentHeight;
  }

  updateHeightsInViewport(
    firstRowIndex,
    firstRowOffset
  ) {
    var top = firstRowOffset;
    var index = firstRowIndex;
    while (top <= this._viewportHeight && index < this.rowCount) {
      this.updateRowHeight(index);
      top += this.storedHeights[index];
      index++;
    }
  }

  updateHeightsAboveViewport(firstRowIndex) {
    var index = firstRowIndex - 1;
    while (index >= 0 && index >= firstRowIndex - BUFFER_ROWS) {
      var delta = this.updateRowHeight(index);
      this.position += delta;
      index--;
    }
  }

  updateRowHeight(rowIndex) {
    if (rowIndex < 0 || rowIndex >= this.rowCount) {
      return 0;
    }
    var newHeight = this.fullRowHeightGetter(rowIndex);
    if (newHeight !== this.storedHeights[rowIndex]) {
      var change = newHeight - this.storedHeights[rowIndex];
      this.rowOffsets.set(rowIndex, newHeight);
      this.storedHeights[rowIndex] = newHeight;
      this.contentHeight += change;
      return change;
    }
    return 0;
  }

  getRowPosition(rowIndex) {
    this.updateRowHeight(rowIndex);
    return this.rowOffsets.sumUntil(rowIndex);
  }

  scrollBy(delta) {
    if (this.rowCount === 0) {
      return NO_ROWS_SCROLL_RESULT;
    }
    var firstRow = this.rowOffsets.greatestLowerBound(this.position);
    firstRow = clamp(firstRow, 0, Math.max(this.rowCount - 1, 0));
    var firstRowPosition = this.rowOffsets.sumUntil(firstRow);
    var rowIndex = firstRow;
    var position = this.position;

    var rowHeightChange = this.updateRowHeight(rowIndex);
    if (firstRowPosition !== 0) {
      position += rowHeightChange;
    }
    var visibleRowHeight = this.storedHeights[rowIndex] -
      (position - firstRowPosition);

    if (delta >= 0) {

      while (delta > 0 && rowIndex < this.rowCount) {
        if (delta < visibleRowHeight) {
          position += delta;
          delta = 0;
        } else {
          delta -= visibleRowHeight;
          position += visibleRowHeight;
          rowIndex++;
        }
        if (rowIndex < this.rowCount) {
          this.updateRowHeight(rowIndex);
          visibleRowHeight = this.storedHeights[rowIndex];
        }
      }
    } else if (delta < 0) {
      delta = -delta;
      var invisibleRowHeight = this.storedHeights[rowIndex] - visibleRowHeight;

      while (delta > 0 && rowIndex >= 0) {
        if (delta < invisibleRowHeight) {
          position -= delta;
          delta = 0;
        } else {
          position -= invisibleRowHeight;
          delta -= invisibleRowHeight;
          rowIndex--;
        }
        if (rowIndex >= 0) {
          var change = this.updateRowHeight(rowIndex);
          invisibleRowHeight = this.storedHeights[rowIndex];
          position += change;
        }
      }
    }

    var maxPosition = this.contentHeight - this._viewportHeight;
    position = clamp(position, 0, maxPosition);
    this.position = position;
    var firstRowIndex = this.rowOffsets.greatestLowerBound(position);
    firstRowIndex = clamp(firstRowIndex, 0, Math.max(this.rowCount - 1, 0));
    firstRowPosition = this.rowOffsets.sumUntil(firstRowIndex);
    var firstRowOffset = firstRowPosition - position;

    this.updateHeightsInViewport(firstRowIndex, firstRowOffset);
    this.updateHeightsAboveViewport(firstRowIndex);

    return {
      index: firstRowIndex,
      offset: firstRowOffset,
      position: this.position,
      contentHeight: this.contentHeight,
    };
  }

  _getRowAtEndPosition(rowIndex) {
    this.updateRowHeight(rowIndex);
    var currentRowIndex = rowIndex;
    var top = this.storedHeights[currentRowIndex];
    while (top < this._viewportHeight && currentRowIndex >= 0) {
      currentRowIndex--;
      if (currentRowIndex >= 0) {
        this.updateRowHeight(currentRowIndex);
        top += this.storedHeights[currentRowIndex];
      }
    }
    var position = this.rowOffsets.sumTo(rowIndex) - this._viewportHeight;
    if (position < 0) {
      position = 0;
    }
    return position;
  }

  scrollTo(position) {
    if (this.rowCount === 0) {
      return NO_ROWS_SCROLL_RESULT;
    }
    if (position <= 0) {
      // If position less than or equal to 0 first row should be fully visible
      // on top
      this.position = 0;
      this.updateHeightsInViewport(0, 0);

      return {
        index: 0,
        offset: 0,
        position: this.position,
        contentHeight: this.contentHeight,
      };
    } else if (position >= this.contentHeight - this._viewportHeight) {
      var rowIndex = this.rowCount - 1;
      position = this._getRowAtEndPosition(rowIndex);
    }
    this.position = position;

    var firstRowIndex = this.rowOffsets.greatestLowerBound(position);
    firstRowIndex = clamp(firstRowIndex, 0, Math.max(this.rowCount - 1, 0));
    var firstRowPosition = this.rowOffsets.sumUntil(firstRowIndex);
    var firstRowOffset = firstRowPosition - position;

    this.updateHeightsInViewport(firstRowIndex, firstRowOffset);
    this.updateHeightsAboveViewport(firstRowIndex);

    return {
      index: firstRowIndex,
      offset: firstRowOffset,
      position: this.position,
      contentHeight: this.contentHeight,
    };
  }
  scrollToRow(rowIndex, offset) {
    rowIndex = clamp(rowIndex, 0, Math.max(this.rowCount - 1, 0));
    offset = clamp(offset, -this.storedHeights[rowIndex], 0);
    var firstRow = this.rowOffsets.sumUntil(rowIndex);
    return this.scrollTo(firstRow - offset);
  }
  scrollRowIntoView(rowIndex) {
    rowIndex = clamp(rowIndex, 0, Math.max(this.rowCount - 1, 0));
    this.updateRowHeight(rowIndex);
    var rowBegin = this.rowOffsets.sumUntil(rowIndex);
    var rowEnd = rowBegin + this.storedHeights[rowIndex];
    if (rowBegin < this.position) {
      return this.scrollTo(rowBegin);
    } else if (this.position + this._viewportHeight < rowEnd) {
      var position = this._getRowAtEndPosition(rowIndex);
      return this.scrollTo(position);
    }
    return this.scrollTo(this.position);
  }
}

export {FixedDataTableScrollHelper};
