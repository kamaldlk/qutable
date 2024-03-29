
function defaultComparator(a, b) {
  return a < b;
}

export class Heap {
  constructor(items, comparator) {
    this._items = items || [];
    this._size = this._items.length;
    this._comparator = comparator || defaultComparator;
    this._heapify();
  }

  empty() {
    return this._size === 0;
  }


  pop() {
    if (this._size === 0){
      return;
    }

    var elt = this._items[0];

    var lastElt = this._items.pop();
    this._size--;

    if (this._size > 0) {
      this._items[0] = lastElt;
      this._sinkDown(0);
    }

    return elt;
  }


  push(item) {
    this._items[this._size++] = item;
    this._bubbleUp(this._size - 1);
  }


  size() {
    return this._size;
  }


  peek() {
    if (this._size === 0) {
      return;
    }

    return this._items[0];
  }

  _heapify() {
    for (var index = Math.floor((this._size + 1)/ 2); index >= 0; index--) {
      this._sinkDown(index);
    }
  }

  _bubbleUp(index) {
    var elt = this._items[index];
    while (index > 0) {
      var parentIndex = Math.floor((index + 1) / 2) - 1;
      var parentElt = this._items[parentIndex];

      // if parentElt < elt, stop
      if (this._comparator(parentElt, elt)) {
        return;
      }

      // swap
      this._items[parentIndex] = elt;
      this._items[index] = parentElt;
      index = parentIndex;
    }
  }


  _sinkDown(index) {
    var elt = this._items[index];

    while (true) {
      var leftChildIndex = 2 * (index + 1) - 1;
      var rightChildIndex = 2 * (index + 1);
      var swapIndex = -1;

      if (leftChildIndex < this._size) {
        var leftChild = this._items[leftChildIndex];
        if (this._comparator(leftChild, elt)) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < this._size) {
        var rightChild = this._items[rightChildIndex];
        if (this._comparator(rightChild, elt)) {
          if (swapIndex === -1 ||
              this._comparator(rightChild, this._items[swapIndex])) {
            swapIndex = rightChildIndex;
          }
        }
      }

      // if we don't have a swap, stop
      if (swapIndex === -1) {
        return;
      }

      this._items[index] = this._items[swapIndex];
      this._items[swapIndex] = elt;
      index = swapIndex;
    }
  }
}
