import React, { Component, Fragment, PureComponent } from 'react';
import './App.css';
import DataSheet from './spreadsheet/DataSheet';
import './spreadsheet/react-datasheet.css';
import './reset.css';
import 'react-select/dist/react-select.css';
import Select from 'react-select'
import { ENTER_KEY, TAB_KEY } from './spreadsheet/keys';
import { DragDropContextProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import rows from './rows.json'

const SheetRenderer = props => {
  const { as: Tag, headerAs: Header, bodyAs: Body, rowAs: Row, cellAs: Cell,
    className, columns, selections, onSelectAllChanged } = props
  return (
    <Tag className={className}>
      <Header className='data-header'>
        <Row>
          <Cell className='action-cell cell'>
            <input
              type='checkbox'
              checked={selections.every(s => s)}
              onChange={e => onSelectAllChanged(e.target.checked)}
            />
          </Cell>
          {columns.map(column => <Cell className='cell' style={{ width: column.Width + 'px' }} key={column.Name}>{column.Name}</Cell>)}
        </Row>
      </Header>
      <Body className='data-body'>
        {props.children}
      </Body>
    </Tag>
  )
}

const RowRenderer = props => {
  const { as: Tag, cellAs: Cell, className, row, selected, onSelectChanged, rowHeight, cells } = props
  console.log('cells: ', cells);

  console.log('rowHeight: ', rowHeight);
  console.log('row: ', row);
  console.log('rowHeight*row: ', rowHeight*row);
  return (
    <Tag className={className} style={{position: 'absolute', top: rowHeight*cells[0].value}}>
      <Cell className='action-cell cell'>
        <input
          type='checkbox'
          checked={selected}
          onChange={e => onSelectChanged(row, e.target.checked)}
        />
      </Cell>
      {props.children}
    </Tag>
  )
}

const CellRenderer = props => {
  const {
    as: Tag, cell, row, col, columns, attributesRenderer,
    selected, editing, updated, style,
    ...rest
  } = props

  // hey, how about some custom attributes on our cell?
  const attributes = cell.attributes || {}
  // ignore default style handed to us by the component and roll our own
  attributes.style = { width: columns[col].Width + 'px' }
  if (col === 0) {
    attributes.title = cell.label
  }

  return (
    <Tag {...rest} {...attributes}>
      {props.children}
    </Tag>
  )
}


class SelectEditor extends PureComponent {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.state = {}
  }

  handleChange(opt) {
    const { onCommit, onRevert } = this.props
    if (!opt) {
      return onRevert()
    }
    const { e } = this.state
    onCommit(opt.value, e)
    console.log('COMMITTED', opt.value)
  }

  handleKeyDown(e) {
    // record last key pressed so we can handle enter
    if (e.which === ENTER_KEY || e.which === TAB_KEY) {
      e.persist()
      this.setState({ e })
    } else {
      this.setState({ e: null })
    }
  }

  render() {
    return (
      <Select
        autoFocus
        openOnFocus
        closeOnSelect
        value={this.props.value}
        onChange={this.handleChange}
        onInputKeyDown={this.handleKeyDown}
        options={[
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 }
        ]}
      />
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleSelectAllChanged = this.handleSelectAllChanged.bind(this)
    this.handleSelectChanged = this.handleSelectChanged.bind(this)
    this.handleCellsChanged = this.handleCellsChanged.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.rowHeight = this.rowHeight.bind(this)

    this.sheetRenderer = this.sheetRenderer.bind(this)
    this.rowRenderer = this.rowRenderer.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)
    this.data = {
      "Id": "GridData",
      "Columns": [
        {
          "Key": "Id",
          "Name": "Id",
          "Width": 40,
          "Fixed": true,
          "readOnly": true
        },
        {
          "Key": "task",
          "Name": "Title",
          "Width": 400,
          "Fixed": true
        },
        {
          "Key": "priority",
          "Name": "Priority",
          "Width": 200
        },
        {
          "Key": "issueType",
          "Name": "Issue Type",
          "Width": 200,
          "readOnly": true,
          "dataEditor": SelectEditor
        },
        {
          "Key": "taskInfo",
          "Name": "Task info",
          "Width": 200
        },
        {
          "Key": "complete",
          "Name": "% Complete",
          "Width": 200
        },
        {
          "Key": "startDate",
          "Name": "Start Date",
          "Width": 300
        }
      ],
      "Table::Employee": rows
    }
    const tableName = 'Table::Employee';
    const grid = [
      ...this.data[tableName].map(row => {
        let rowData = []
        let index = 0;
        for (let key in row) {
          rowData.push({
            value: row[key] || '',
            width: this.data.Columns[index].Width,
            Name: this.data.Columns[index].Name,
            // readOnly: this.data.Columns[index].readOnly,
            dataEditor: this.data.Columns[index].dataEditor
          })
          ++index;
        }
        return rowData;
      })
    ];
    console.log(grid);
    this.state = {
      as: 'table',
      columns: this.data.Columns,
      grid: grid,
      visiblegrid: grid.slice(0, 20),
      selections: [false, false, false, false, false, false, false]
    }
  }

  componentDidMount() {
    this.container.addEventListener('scroll', this.debounce(this.onScroll, 32));
  }
  
  componentWillUnmount() {
    this.container.removeEventListener('scroll', this.onScroll);
  }

  debounce = (func, wait) => {
    let timeout

    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  // onScroll(args) {
  //   console.log('args: ', args);

  // }

  onScroll() {
    console.log('kbt now ', new Date())
    console.log('rowHeightValue', this.rowHeightValue);
    let scrollTop = this.container.scrollTop
    console.log('scrollTop: ', scrollTop);
    let height = this.container.offsetHeight
    let r = Math.round;
    let startSplice = r(scrollTop / this.rowHeightValue);
    startSplice -= 5;
    startSplice = startSplice < 0 ? 0 : startSplice;
    console.log('startSplice: ', startSplice);
    var noOfRowsInView = r(height/this.rowHeightValue);
    console.log('noOfRowsInView: ', noOfRowsInView);

    this.setState(prevState => {
      let visiblegrid = prevState.grid.slice(startSplice, startSplice + noOfRowsInView + 10);
      console.log('visiblegrid: ', visiblegrid);
      return { visiblegrid }
  });
  }

  rowHeight(height) {
    console.log('height: ', height);
    this.rowHeightValue = height;
  }

  handleSelect(e) {
    this.setState({ as: e.target.value })
  }

  handleSelectAllChanged(selected) {
    const selections = this.state.selections.map(s => selected)
    this.setState({ selections })
  }

  handleSelectChanged(index, selected) {
    const selections = [...this.state.selections]
    selections[index] = selected
    this.setState({ selections })
  }

  handleCellsChanged(changes, additions) {
    const grid = this.state.grid.map(row => [...row])
    changes.forEach(({ cell, row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value }
    })
    // paste extended beyond end, so add a new row
    if (additions) {
      additions.forEach(({ cell, row, col, value }) => {
        if (!grid[row]) {
          let emptyData = [];
          for (let i = 0; i < this.state.columns.length; i++) {
            emptyData.push({
              value: ''
            })
          }
          grid[row] = emptyData
        }
        if (grid[row][col]) {
          grid[row][col] = { ...grid[row][col], value }
        }
      })
    }

    this.setState({ grid })
  }
  sheetRenderer(props) {
    const { columns, selections } = this.state
    switch (this.state.as) {
      case 'list':
        return <SheetRenderer columns={columns} selections={selections} onSelectAllChanged={this.handleSelectAllChanged} as='segment' headerAs='div' bodyAs='ul' rowAs='div' cellAs='div' {...props} />
      case 'div':
        return <SheetRenderer columns={columns} selections={selections} onSelectAllChanged={this.handleSelectAllChanged} as='div' headerAs='div' bodyAs='div' rowAs='div' cellAs='div' {...props} />
      default:
        return <SheetRenderer columns={columns} selections={selections} onSelectAllChanged={this.handleSelectAllChanged} as='table' headerAs='thead' bodyAs='tbody' rowAs='tr' cellAs='th' {...props} />
    }
  }

  rowRenderer(props) {
    const { selections } = this.state
    switch (this.state.as) {
      case 'list':
        return <RowRenderer as='li' cellAs='div' selected={selections[props.row]} onSelectChanged={this.handleSelectChanged} className='data-row' {...props} />
      case 'div':
        return <RowRenderer as='div' cellAs='div' selected={selections[props.row]} onSelectChanged={this.handleSelectChanged} className='data-row' {...props} />
      default:
        return <RowRenderer as='tr' cellAs='td' selected={selections[props.row]} onSelectChanged={this.handleSelectChanged} className='data-row' {...props} />
    }
  }

  cellRenderer(props) {
    switch (this.state.as) {
      case 'list':
        return <CellRenderer as='div' columns={this.state.columns} {...props} />
      case 'div':
        return <CellRenderer as='div' columns={this.state.columns} {...props} />
      default:
        return <CellRenderer as='td' columns={this.state.columns} {...props} />
    }
  }

  render() {

    return (
      <div>
        <Fragment>
          <label>
            Render with:&nbsp;
            <select value={this.state.as} onChange={this.handleSelect}>
              <option value='table'>Table</option>
              <option value='list'>List</option>
              <option value='div'>Div</option>
            </select>
          </label>
        </Fragment>
        <div className="container" ref={input => { this.container = input }}>
          <div className="wrapper" style={{height: this.rowHeightValue ? (this.state.grid.length * this.rowHeightValue) : '300px'}}>
            <DataSheet
              data={this.state.visiblegrid}
              className='custom-sheet'
              sheetRenderer={this.sheetRenderer}
              headerRenderer={this.headerRenderer}
              bodyRenderer={this.bodyRenderer}
              rowRenderer={this.rowRenderer}
              cellRenderer={this.cellRenderer}
              onCellsChanged={this.handleCellsChanged}
              valueRenderer={(cell) => cell.value}
              rowHeight = {this.rowHeight}
            />
          </div>
        </div>

        <Fragment>
          <label>
            Render with:&nbsp;
            <select value={this.state.as} onChange={this.handleSelect}>
              <option value='table'>Table</option>
              <option value='list'>List</option>
              <option value='div'>Div</option>
            </select>
          </label>
        </Fragment>
      </div>
    )
  }
}

export default App;
