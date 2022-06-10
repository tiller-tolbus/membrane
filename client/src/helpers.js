import { ROW_COUNT, COLUMN_NAMES } from "./constants";
/* GRID HELPERS */
const charRange = (start, stop) => {
  var result = [];

  // get all chars from starting char
  // to ending char
  var i = start.charCodeAt(0),
    last = stop.charCodeAt(0) + 1;
  for (i; i < last; i++) {
    result.push(String.fromCharCode(i));
  }

  return result;
};
const toString26 = (num) => {
  var alpha = charRange("a", "z");
  var result = "";

  // no letters for 0 or less
  if (num < 1) {
    return result;
  }

  var quotient = num,
    remainder;

  // until we have a 0 quotient
  while (quotient !== 0) {
    // compensate for 0 based array
    var decremented = quotient - 1;

    // divide by 26
    quotient = Math.floor(decremented / 26);

    // get remainder
    remainder = decremented % 26;

    // prepend the letter at index of remainder
    result = alpha[remainder] + result;
  }

  return result;
};

const getFirstRow = (length = 27) => {
  /*
  this is our first row
  */
  const columns = getColumns(length);
  return {
    rowId: "header",
    cells: columns.map((col) => {
      return { type: "header", text: col.columnName };
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

const getColumns = (length = 27) => {
  /**
   * given a length generate the columns react-grid needs and we need to display stuff
   * note this is different from first row in our rows
   *
   * decides metadata like width and height of columns
   * retuns columns
   **/
  let columns = [];
  for (let i = 0; i < length; i++) {
    //make first COLUMN smaller
    let width = 100;
    if (i === 0) {
      width = 60;
    }

    columns.push({
      columnId: i,
      columnName: toString26(i).toUpperCase(),
      width: width,
      resizable: true,
    });
  }
  return columns;
};

const updateCell = (changes, prevRows) => {
  //use the changes object to directly access the correct cell and update it using the new text!
  const { rowId, columnId, newCell } = changes[0];
  let newRows = [...prevRows];
  newRows[rowId].cells[columnId].text = newCell.text;
  const { updateFormulaFoo, formulaLocation } = newRows[rowId].cells[columnId];
  //F1
  if (formulaLocation) {
    updateFormulaFoo(
      newCell.text,
      formulaLocation,
      { columnId, rowId },
      newRows
    );
  }
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

const reiszeColumns = (columns, ci, width) => {
  /* 
    Updates columns after resize action
    returns array of new columns 
  */
  const prevColumns = [...columns];
  const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
  const resizedColumn = prevColumns[columnIndex];
  const updatedColumn = { ...resizedColumn, width };
  prevColumns[columnIndex] = updatedColumn;
  return [...prevColumns];
};
/* JSON HELPERS */
const jsonToData = (json) => {
  /*
    take parsed json from the server and turn it into something client can use
    returns rows
 */
  //todo: add a check?
  //if (!json || json.length === 0)return false;
  let columnLength = json[0].length + 1; // +1 because the first column is the row count one
  //our first row (columns)
  const firstRow = [getFirstRow(columnLength)];

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
/*ENV HELPERS*/
const isDev = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export {
  getColumns,
  getRows,
  updateCell,
  generateRows,
  dataToJson,
  jsonToData,
  reiszeColumns,
  isDev,
};
