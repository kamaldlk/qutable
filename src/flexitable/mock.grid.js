import layout from '../../../studio/mock.model';

const draftList = [];

const mockGrid = {
  Columns: () => getInitialColumns(),
  Rows: () => createRows(6),
  Sort: () => getSortColumns()
};

function getInitialColumns() {
  return layout[layout.Root]["Model::Field"].map((field) => {
    return {
      Label: layout[field].Label,
      Name: layout[field].Name,
      Type: layout[field].Type,
      Fixed: layout[field].Fixed,
      Id: layout[field].Id,
      Hidden: layout[field].Hidden,
      Hint: layout[field].Hint,
      Width: layout[field].Width,
      Required: layout[field].Required,
      ReadOnly: layout[field].ReadOnly
    };
  });
}

function getSortColumns() {
  return [
    {
      Name: "Name",
      Id: "Field001",
      SortType: "DSC"
    }
  ];
}

function createRows(numberOfRows) {
  let rows = [];
  for (let i = 1; i < numberOfRows; i++) {
    let data = { _id: i.toString(), _ResourceId: "ac_" + i };
    layout[layout.Root]["Model::Field"].map((field) => {
      let val = layout[field].Name + ' ' + i;
      if(layout[field].Type === 'Number') {
        val = Math.min(10000, Math.round(Math.random() * 11000));
      } else if(layout[field].Type === 'Date') {
        val = new Date().toLocaleDateString();
      } else if(layout[field].Type === 'Datetime') {
        val = new Date().toLocaleString();
      } else if (layout[field].Type === 'StarRating') {
        val = 3;
      } else if (layout[field].Type === 'Boolean') {
        val = true;
      }

      data[layout[field].Name] = val;
    });
    rows.push(data);
  }
  rows.push(...draftList);
  return rows;
}

export { draftList, mockGrid };
