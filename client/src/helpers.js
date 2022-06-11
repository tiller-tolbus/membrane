import { ROW_COUNT, COLUMN_NAMES } from "./constants";
import availableFormulas from "./components/grid/formulajs";

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
const fetchCellValue = (cellName, rows) => {
  /*
   * Given a celll name
   * (pattern =>  alphabet char followed by a numeric string) (for now)
   * assumes grid is in Alphanumerical order (x and y)
   * it will output the current content of that cell along with it's coordinates in rows (columnId, rowId)
   * todo: should also eventually do arrays
   * and eventually cells should have identifiers for ease of use...
   *
   */

  //no cellName nothing to do
  if (!cellName) return false;

  //split string into alphabet / numeral
  let splitName = cellName.match(/[a-zA-Z]+|[0-9]+/g);

  let columnName = splitName[0];
  let row = splitName[1];
  //either value doesn't exist, return false
  if (!columnName || !row) return false;

  let column;
  //find column in the header list, and the index will be the position in row
  rows[0].cells.forEach((cell, index) => {
    if (cell.text === columnName) {
      //found our column here, save the index
      column = index;
    }
  });
  //nothing found return false
  if (!column) return false;
  //if we have both row and column value, try to access the cell, and return it's content
  let cellValue = rows[row].cells[column];
  //for some reason, no cellValue can be found, return false
  if (!cellValue) return;
  //found the value we need, construct an object we can use elsewhere
  return { value: cellValue.text, columnId: column, rowId: row };
};
const fetchFormulaData = (cellValue, rows) => {
  if (!cellValue) return false;
  //if our cellValue starts with "=" than we have a formula on our hands
  if (cellValue[0] !== "=") {
    return false;
  }
  //try to get at the formula
  const foundFormula = cellValue.slice(
    cellValue.indexOf("=") + 1,
    cellValue.indexOf("(")
  );
  //no formula bye bye
  if (!foundFormula) return false;

  //todo: add feedback in above case
  const currentFormula = availableFormulas.filter(
    (formula) => formula.name === foundFormula
  );
  //formula function not found in our availableFormulas list, nothing to evaluate, return false
  if (currentFormula && currentFormula.length === 0) return false;
  //get all our params here
  //our params are in between "(" ")", seprated by ","
  const betweenBrackets = cellValue.slice(
    cellValue.indexOf("(") + 1,
    cellValue.indexOf(")")
  );
  const paramList = betweenBrackets.split(",");
  //convert paramsInto values we can pass to our Formula
  //todo: remove space around characeters? help user out
  const valueList = paramList.map((item) => fetchCellValue(item, rows));
  let allValuesExist = true;
  valueList.forEach((item) => {
    if (item === false) {
      allValuesExist = false;
    }
  });
  //some of the cells did not evulate, can't proceed, return false
  //todo: feedback
  if (!allValuesExist) return false;
  //before we can actually excute we need to transform the list into [1,2,3,4,5]
  const executableList = valueList.map((item) => item.value);
  //add onChange
  const formulaData = {
    ...currentFormula[0],
    valueList,
    nonEvaledText: cellValue,
  };
  return formulaData;
};
const formulateFormula = (cellValue, columnId, rowId, rows) => {
  /**
   * todo: comment better
   * check to find our avlbl forumla between "=" and the first "("
   */
  const formulaData = fetchFormulaData(cellValue, rows);

  if (formulaData === false) return false;
  //update formula cell withe formula data using row and column id
  let newRows = [...rows];

  newRows[rowId].cells[columnId] = {
    ...newRows[rowId].cells[columnId],
    formulaData,
    //update the formula cell value too using our value list and execute foo
    text: formulaData
      .execute(formulaData.valueList.map((item) => item.value))
      .toString(),
  };
  //update each param cell to have formulaLocation and update function too trigger on change
  formulaData.valueList.forEach((item) => {
    let cellRowId = item.rowId;
    let cellColumnId = item.columnId;
    //TODO: handle having multiple of these
    //ie one data structure containing all the formula cells depending on this one's value

    //add on change function that updates the value in formula cells
    newRows[cellRowId].cells[cellColumnId] = {
      ...newRows[cellRowId].cells[cellColumnId],
      formulaLocation: { columnId, rowId },
      updateFormulaFoo(
        updatedValue,
        formulaLocation,
        currentCellLocation,
        rows
      ) {
        /**
         * this runs on cell change
         * this goes to formula cell and updates it depending on the updatedValue
         * todo:clean it up
         * todo: validate input (display error state in formula cell if no logic value can be derived here)
         */
        const formulaColId = formulaLocation.columnId;
        const formulaRowId = formulaLocation.rowId;
        const { columnId, rowId } = currentCellLocation;

        let newFormulaCell = { ...rows[formulaRowId].cells[formulaColId] };
        let newFormulaData = {
          ...rows[formulaRowId].cells[formulaColId].formulaData,
        };
        //update valueList with the current cellValue
        //TODO: optmise if no changes cancel the rest of this

        let newValueList = newFormulaData.valueList.map((item) => {
          //todo: make all the values (ids) numbers not stringed numbers
          if (columnId == item.columnId && rowId == item.rowId) {
            //found the value to update
            return { ...item, value: updatedValue };
          }
          return item;
        });
        newFormulaData.valueList = newValueList;
        //we have change in our param cells, that means update formula cell
        const executableList = newFormulaData.valueList.map(
          (item) => item.value
        );

        //update the value
        newFormulaCell.formulaData = newFormulaData;
        newFormulaCell.text = newFormulaData.execute(executableList).toString();
        //update the formula cell with our values
        rows[formulaRowId].cells[formulaColId] = newFormulaCell;
      },
    };
  });
  //update the cell with the new formula data and update the param cells with their data
  //setRows(newRows);
  return newRows;
};
const updateCell = (changes, prevRows) => {
  //use the changes object to directly access the correct cell and update it using the new text!
  const { rowId, columnId, newCell } = changes[0];
  let newRows = [...prevRows];
  newRows[rowId].cells[columnId].text = newCell.text;
  const { updateFormulaFoo, formulaLocation } = newRows[rowId].cells[columnId];
  //F1
  //todo: multiple of these [...]
  //todo: handle if this is a formula
  if (formulaLocation) {
    updateFormulaFoo(
      newCell.text,
      formulaLocation,
      { columnId, rowId },
      newRows
    );
  }
  /*
  let potentiallyNewerRows = formulateFormula(
    newCell.text,
    columnId,
    rowId,
    newRows
  );
  console.log("potentiallyNewerRows", potentiallyNewerRows);
  if (potentiallyNewerRows && potentiallyNewerRows.length > 0)
    newRows = potentiallyNewerRows;
    */
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
      //handle formula cell values (don't send formula results, send formula)
      if (item.formulaData && item.formulaData.nonEvaledText) {
        return item.formulaData.nonEvaledText;
      }
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
  toString26,
  formulateFormula,
};
