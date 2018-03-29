import React, { Component, Fragment } from 'react';
import DataSheet from './core/data.sheet';
import SheetRenderer from './renderer/sheetrenderer';
import RowRenderer from './renderer/rowrenderer';
import CellRenderer from './renderer/cellrenderer';
class DataSheetRoot extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSelectAllChanged = this.handleSelectAllChanged.bind(this);
    this.handleSelectChanged = this.handleSelectChanged.bind(this);
    this.handleCellsChanged = this.handleCellsChanged.bind(this);

    this.sheetRenderer = this.sheetRenderer.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.data = {
      "Id": "GridData",
      "Columns": [
        {
          Key: "Id",
          Name: "Id",
          Width: 40,
          Fixed: true,
          readOnly: true
        },
        {
          Key: "task",
          Name: "Title",
          Width: 400,
          Fixed: true
        },
        {
          Key: "priority",
          Name: "Priority",
          Width: 200
        },
        {
          Key: "issueType",
          Name: "Issue Type",
          Width: 200,
          readOnly: true
        },
        {
          Key: "taskInfo",
          Name: "Task info",
          Width: 200
        },
        {
          Key: "complete",
          Name: "% Complete",
          Width: 200
        },
        {
          Key: "startDate",
          Name: "Start Date",
          Width: 300
        }
      ],
      "Table::Employee": [
        {
          Id: 1,
          priority: "OrangeRed",
          issueType: "Major",
          task: "Task 1",
          complete: 100,
          taskInfo: "Test",
          startDate: "Sun May 08 2016 13:59:24 GMT+0530 (IST)"
        },
        {
          Id: 2,
          priority: "OrangeRed",
          issueType: "Major",
          task: "Task 1",
          complete: 100,
          taskInfo: "Test",
          startDate: "Sun May 08 2016 13:59:24 GMT+0530 (IST)"
        },
        {
          Id: 3,
          priority: "OrangeRed",
          issueType: "Major",
          task: "Task 1",
          complete: 100,
          taskInfo: "Test",
          startDate: "Sun May 08 2016 13:59:24 GMT+0530 (IST)"
        },
        {
          Id: 4,
          priority: "OrangeRed",
          issueType: "Major",
          task: "Task 1",
          complete: 100,
          taskInfo: "Test",
          startDate: "Sun May 08 2016 13:59:24 GMT+0530 (IST)"
        },
        {
          Id: 5,
          priority: "OrangeRed",
          issueType: "Major",
          task: "Task 1",
          complete: 100,
          taskInfo: "Test",
          startDate: "Sun May 08 2016 13:59:24 GMT+0530 (IST)"
        },
        {
          Id: 6,
          priority: "OrangeRed",
          issueType: "Major",
          task: "Task 1",
          complete: 100,
          taskInfo: "Test",
          startDate: "Sun May 08 2016 13:59:24 GMT+0530 (IST)"
        },
        {
          Id: 7,
          priority: "OrangeRed",
          issueType: "Major",
          task: "Task 1",
          complete: 100,
          taskInfo: "Test",
          startDate: "Sun May 08 2016 13:59:24 GMT+0530 (IST)"
        }
      ]
    };
    const tableName = 'Table::Employee';
    const grid = [
      ...this.data[tableName].map(row => {
        let rowData = [];
        let index = 0;
        for(let key in row) {
          rowData.push({
            value: row[key] || '',
            width: this.data.Columns[index].Width,
            Name: this.data.Columns[index].Name,
            readOnly: this.data.Columns[index].readOnly,
            dataEditor: this.data.Columns[index].dataEditor
          });
          ++index;
        }
        return rowData;
      })
    ];
    this.state = {
      as: 'table',
      columns: this.data.Columns,
      grid: grid,
      selections: [false, false, false, false, false, false, false]
    };
  }

  handleSelect(e) {
    this.setState({ as: e.target.value });
  }

  handleSelectAllChanged(selected) {
    const selections = this.state.selections.map(s => selected);
    this.setState({ selections });
  }

  handleSelectChanged(index, selected) {
    const selections = [...this.state.selections];
    selections[index] = selected;
    this.setState({ selections });
  }

  handleCellsChanged(changes, additions) {
    const grid = this.state.grid.map(row => [...row]);
    changes.forEach(({ cell, row, col, value }) => {
      grid[row][col] = { ...grid[row][col], value };
    });
    // paste extended beyond end, so add a new row
    if (additions) {
      additions.forEach(({ cell, row, col, value }) => {
        if (!grid[row]) {
          let emptyData = [];
          for (let i = 0; i < this.state.columns.length; i++) {
            emptyData.push({
              value: ''
            });
          }
          grid[row] = emptyData;
        }
        if (grid[row][col]) {
          grid[row][col] = { ...grid[row][col], value };
        }
      });
    }

    this.setState({ grid });
  }
  sheetRenderer(props) {
    const { columns, selections } = this.state;
    switch (this.state.as) {
    case 'list':
      return (<SheetRenderer columns={columns} selections={selections}
        onSelectAllChanged={this.handleSelectAllChanged} as="segment"
        headerAs="div" bodyAs="ul" rowAs="div" cellAs="div" {...props} />);
    case 'div':
      return (<SheetRenderer columns={columns} selections={selections}
        onSelectAllChanged={this.handleSelectAllChanged} as="div"
        headerAs="div" bodyAs="div" rowAs="div" cellAs="div" {...props} />);
    default:
      return (<SheetRenderer columns={columns} selections={selections}
        onSelectAllChanged={this.handleSelectAllChanged} as="table"
        headerAs="thead" bodyAs="tbody" rowAs="tr" cellAs="th" {...props} />);
    }
  }

  rowRenderer(props) {
    const { selections } = this.state;
    switch (this.state.as) {
    case 'list':
      return (<RowRenderer as="li" cellAs="div" selected={selections[props.row]}
        onSelectChanged={this.handleSelectChanged} className="dataRow" {...props} />);
    case 'div':
      return (<RowRenderer as="div" cellAs="div" selected={selections[props.row]}
        onSelectChanged={this.handleSelectChanged} className="dataRow" {...props} />);
    default:
      return (<RowRenderer as="tr" cellAs="td" selected={selections[props.row]}
        onSelectChanged={this.handleSelectChanged} className="dataRow" {...props} />);
    }
  }

  cellRenderer(props) {
    switch (this.state.as) {
    case 'list':
      return <CellRenderer as="div" columns={this.state.columns} {...props} />;
    case 'div':
      return <CellRenderer as="div" columns={this.state.columns} {...props} />;
    default:
      return <CellRenderer as="td" columns={this.state.columns} {...props} />;
    }
  }

  render() {
    return (
      <div>
        <Fragment>
          <label>
            Render with:&nbsp;
            <select value={this.state.as} onChange={this.handleSelect}>
              <option value="table">Table</option>
              <option value="list">List</option>
              <option value="div">Div</option>
            </select>
          </label>
        </Fragment>

        <DataSheet
          data={this.state.grid}
          sheetRenderer={this.sheetRenderer}
          headerRenderer={this.headerRenderer}
          bodyRenderer={this.bodyRenderer}
          rowRenderer={this.rowRenderer}
          cellRenderer={this.cellRenderer}
          onCellsChanged={this.handleCellsChanged}
          valueRenderer={(cell) => cell.value}
        />

        <Fragment>
          <label>
            Render with:&nbsp;
            <select value={this.state.as} onChange={this.handleSelect}>
              <option value="table">Table</option>
              <option value="list">List</option>
              <option value="div">Div</option>
            </select>
          </label>
        </Fragment>
      </div>
    );
  }
}

export default DataSheetRoot;
