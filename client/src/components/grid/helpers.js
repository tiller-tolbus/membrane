const ROW_COUNT = 1000;
const columns = [
  "",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const getFirstRow = () => {
  /*
  this is our first row (column, generated using data from initialRow)
  */
  return {
    rowId: "header",
    cells: columns.map((col) => {
      return { type: "header", text: col };
    }),
  };
};
const getFirstCell = (text) => {
  /* returns what the first cell of each row should contain and what mete data it should have */
  return { type: "text", text, nonEditable: true };
};
const getRows = () => {
  /*
  main grid data is returned here
  */
  // return jsonToData(jsonSpec);
  return generateRows(ROW_COUNT, [getFirstRow()]);
};

const getColumns = () => {
  /* 
    decides metadata like width and height of columns 
    retuns columns
  */
  return columns.map((text, index) => {
    //make first COLUMN smaller
    let width = 100;
    if (index === 0) {
      width = 60;
    }
    return { columnId: index, columnName: text, width, resizable: true };
  });
};

const updateCell = (changes, prevRows) => {
  //use the changes object to directly access the correct cell and update it using the new text!
  const { rowId, columnId, newCell } = changes[0];
  let newRows = [...prevRows];
  newRows[rowId].cells[columnId].text = newCell.text;
  return newRows;
};

const generateRows = (rowCount, oldRows) => {
  /* 
    generate X more rows 
    returns all new grid rows 
  */
  //make a copy of the old rows
  const newRows = [...oldRows];
  //establish the number of columns
  const colCount = newRows[0].cells.length;
  //add x rows (rowCount)
  for (let i = 0; i < rowCount; i++) {
    let cells = [];
    //make the cells using colCount
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      //if it's a first cell, insert the row count and add nonEditable => true to make it not editable
      // else just have an empty string and nonEditable => false (by default)
      let extraParams = {};
      if (colIndex === 0) {
        extraParams = getFirstCell(newRows.length.toString());
      }

      cells.push({ type: "text", text: "", ...extraParams });
    }
    //insert the id of the new row and insert the row
    newRows.push({
      rowId: newRows.length,
      cells,
    });
  }
  return newRows;
};

const dataToJson = (data) => {
  /*
    takes grid data(rows) and transform it into what the back-end expects
    excluding first cell of each row and the first entierly(meta data)
    returns back end ready data
  */
  //exclude first row (a,b,c...) (coulmns)
  let newData = [...data];
  newData.shift();

  const specData = newData.map((item) => {
    let newCells = [...item.cells];
    //exclude the first cell (1,2,3...) (row count cell)
    newCells.shift();
    return newCells.map((item) => {
      return item.text;
    });
  });

  return specData;
};
const jsonToData = (json) => {
  /*
    take parsed json from the server and turn it into something client can use
    returns rows
 */
  //our first row (columns)
  const firstRow = [getFirstRow()];

  const rows = json.map((row, index) => {
    //since we're inserting a first row after this, we offset our index by 1
    let offsetIndex = index + 1;
    const cells = [];
    //include our first meta data cell at the start of each row (cells[0])
    cells.push(getFirstCell(offsetIndex.toString()));
    //add the rest of the data from the json
    row.map((item) => {
      cells.push({ type: "text", text: item });
    });
    return {
      rowId: offsetIndex,
      cells,
    };
  });
  //combine first row(meta data) with the rest of the rows (data from backend)
  return [...firstRow, ...rows];
};
export {
  getColumns,
  getRows,
  updateCell,
  generateRows,
  dataToJson,
  jsonToData,
};
