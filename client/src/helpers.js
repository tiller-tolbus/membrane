import { ROW_COUNT, CELL_CAP, COLUMN_WIDTH } from "./constants";
import availableFormulas from "./components/grid/formulajs";
import cloneDeep from "lodash/cloneDeep";
import Papa from "papaparse";
import useStore from "./store";
import Graph from "./Graph";

import FormulaParser, {
  FormulaHelpers,
  Types,
  FormulaError,
  MAX_ROW,
  MAX_COLUMN,
} from "fast-formula-parser";

//CONSIDERATION: should this be part of our store?
let formulatedList = new Map();
const checkFormulaGraph = () => {
  /**
   * Generate a graph based on  formulatedList
   * and check it for cycles (deadlock)
   * and return "there is a cycle" or "no cycle!" appropriately
   */
  let graphy = new Graph();
  for (const [key, value] of formulatedList.entries()) {
    graphy.addVertex(key);
    if (value.dependantFormulas && value.dependantFormulas.length > 0) {
      value.dependantFormulas.forEach((dep) => {
        graphy.addEdge(key, `${dep.columnId},${dep.rowId}`);
      });
    }
  }
  //graphy.printGraphe();
  return graphy.detectCycle();
};
const arrayInsertItemAtIndex = (index, item, array) => {
  array.splice(index, 0, item);
};
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
const getColumnCell = (text, customStyles) => {
  const cell = {
    type: "text",
    text,
    input: "", //we have this for display purposes in CellOptions (input bar)
    nonEditable: true,
    style: {
      background: "#e8eaed",
      border: {
        left: { color: "#c0c0c0" },
        top: { color: "#c0c0c0" },
        right: { color: "#c0c0c0" },
        bottom: { color: "#c0c0c0" },
      },
    },
  };
  if (customStyles) {
    cell.customStyles = customStyles;
  }
  return cell;
};
const getFirstRow = (length = 27) => {
  /*
  this is our first row
  */
  const columns = getColumns(length);
  return {
    rowId: 0,
    cells: columns.map((col) => {
      return getColumnCell(col.columnName);
    }),
  };
};

const getFirstCell = (text) => {
  /* returns what the first cell of each row should contain and what mete data it should have */
  return {
    type: "text",
    text,
    input: "", //we have this for display purposes in CellOptions (input bar)
    nonEditable: true,
    style: {
      background: "#e8eaed",
      border: {
        left: { color: "#c0c0c0" },
        top: { color: "#c0c0c0" },
        right: { color: "#c0c0c0" },
        bottom: { color: "#c0c0c0" },
      },
    },
  };
};
const getRows = (
  columnCount = 27,
  rowCount = ROW_COUNT,
  columnStyles,
  rowStyles
) => {
  /*
  main grid data is returned here
  */
  return generateRows(
    rowCount,
    [getFirstRow(columnCount)],
    columnStyles,
    rowStyles
  );
};

const getColumns = (length = 27, columnStyles = []) => {
  /**
   * given a length generate the columns we need
   * also inserts columnStyles (width) if any are provided
   * note this is different from first row in our rows
   * retuns columns
   **/
  let columns = [];
  //we have to account for our meta column
  let newLength = length + 1;
  for (let i = 0; i < newLength; i++) {
    //make first COLUMN smaller
    let width = COLUMN_WIDTH;
    if (i === 0) {
      width = 60;
    }
    //if we have width in our columnStyles we override the value
    columnStyles.forEach((item) => {
      if (item[0] === i - 1) {
        if (item[1].width) {
          width = item[1].width;
        }
      }
    });
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
   * (pattern =>  alphabet char followed by a numeric string)
   * assumes grid is in Alphanumerical order (x and y)
   * it will either output the current content of that cell along with it's coordinates in rows (columnId, rowId)
   * or just a value (passed cellName) if no such cell can be found (direct input)
   * todo: eventually cells should have identifiers for ease of use... (data structure)
   */

  //no cellName nothing to do
  if (!cellName) return false;

  //split string into alphabet / numeral
  let splitName = cellName.match(/[a-zA-Z]+|[0-9]+/g);
  //TODO:check if these are out of bounds
  let columnName = splitName[0];
  let row = splitName[1];
  // either value doesn't exist, we treat this as a direct input since it doesn't conform to the cell name pattern
  if (!columnName || !row) {
    return { value: cellName };
  }
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
  try {
    //we try to access said row and said column, if it's out of bounds it'll go to catch where we return false, indicting no value found
    let cellValue = rows[row].cells[column];
    //for some reason, no cellValue can be found, return false
    if (!cellValue) return false;
    //found the value we need, construct an object we can use elsewhere
    return { value: cellValue.text, columnId: column, rowId: row };
  } catch (e) {
    console.log("We can't get you a value for these coordinates", e);
    return false;
  }
};
const fetchFormulaData = (cellValue, rows) => {
  //no feedback here this is just not a formula
  if (!cellValue) return { error: true };
  //if our cellValue starts with "=" than we have a formula on our hands
  if (cellValue[0] !== "=") {
    //no feedback here this is just not a formula
    return { error: true };
  }
  //try to get at the formula
  const foundFormula = cellValue.slice(
    cellValue.indexOf("=") + 1,
    cellValue.indexOf("(")
  );
  //no formula bye bye
  //FEEDBACK: no formula function passed?
  if (!foundFormula) {
    return { error: true, feedback: "#ERR: no function name" };
  }
  //todo: add feedback in above case
  const currentFormula = availableFormulas.filter(
    (formula) => formula.name === foundFormula
  );
  //formula function not found in our availableFormulas list, nothing to evaluate, return false
  if (currentFormula && currentFormula.length === 0) {
    //FEEDBACK: this function doesn't exist
    return { error: true, feedback: "#ERR: function doesn't exist" };
  }
  //get all our params here
  //our params are in between "(" ")", seprated by ","
  var betweenBracketsRegEx = /\(([^)]+)\)/; //pattern for "(A1,A2...)"
  var betweenBracketsRegExMatches = betweenBracketsRegEx.exec(cellValue);

  if (!betweenBracketsRegExMatches) {
    //doesn't match our patterns, return error with feedback
    return { error: true, feedback: "#ERR: could not eval param list" };
  }
  const paramList = betweenBracketsRegExMatches[1].split(",");
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

  if (!allValuesExist) {
    //FEEDBACK: Could not eval some of the cells you passed?
    return {
      error: true,
      feedback: "#ERR: One or more of the cells do not exist",
    };
  }
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
const parseStringToType = (value) => {
  //Attempting to correctly parse the types
  if (!value) return NaN;

  //we need to convert the stringed types into their respective types
  //we try to make a number first
  const num = Number(value);

  if (!isNaN(num) && typeof num === "number") {
    //got a number, we can return right away
    return num;
  }
  //can we make this into a boolean?
  //we just look for strings "true" and "false"
  const bool = value.toLowerCase();
  if (bool === "true" || bool === "false") {
    return bool === "true";
  }
  return value;
};
const FoPar = (cellValue, data, position) => {
  const formulaToEval = cellValue.substring(1);
  let paramList = []; //list of all the cells this formula uses as a param(value )
  //CONSIDERATION: do we need a new parser each time?
  const parser = new FormulaParser({
    // External functions, this will override internal functions with same name
    functions: {
      CHAR: (number) => {
        number = FormulaHelpers.accept(number, Types.NUMBER);
        if (number > 255 || number < 1) throw FormulaError.VALUE;
        return String.fromCharCode(number);
      },
      HELLO: (param) => {
        console.log("param", param);
        return "example of a custom function";
      },
    },

    // retrieve cell value
    onCell: ({ sheet, row, col }) => {
      //return the cell value
      const value = data[row].cells[col].text;
      paramList.push({ rowId: row, columnId: col });
      return parseStringToType(value);
    },

    // retrieve range values
    onRange: (ref) => {
      // using 1-based index
      // Be careful when ref.to.col is MAX_COLUMN or ref.to.row is MAX_ROW, this will result in
      // unnecessary loops in this approach.
      const arr = [];
      for (let row = ref.from.row; row <= ref.to.row; row++) {
        const innerArr = [];
        const currRow = data[row];
        if (currRow) {
          for (let col = ref.from.col; col <= ref.to.col; col++) {
            innerArr.push(parseStringToType(currRow.cells[col]?.text));
            //update our refrence array
            paramList.push({ rowId: row, columnId: col });
          }
        }
        arr.push(innerArr);
      }
      return arr;
    },
  });

  // position is required for evaluating certain formulas, e.g. ROW()

  // parse the formula, the position of where the formula is located is required
  // for some functions.
  try {
    const result = parser.parse(formulaToEval, position);
    return { result: result.toString(), paramList, nonEvaledText: cellValue };
  } catch (e) {
    return {
      error: true,
      paramList,
      result: "#ERR: " + e.details.name,
      nonEvaledText: cellValue,
    };
  }
};
const formulateFormula = (cellValue, columnId, rowId, rows) => {
  //is this a formula?
  if (cellValue[0] !== "=") {
    return false;
  }
  const position = { row: rowId, col: columnId, sheet: "main" };
  const formulaData = FoPar(cellValue, rows, position);
  let newRows = cloneDeep(rows);

  //update formula cell withe formula data using row and column id

  const formulaOutput = formulaData.result;
  newRows[rowId].cells[columnId] = {
    ...newRows[rowId].cells[columnId],
    formulaData,
    //update text(output) with formula result
    text: formulaOutput,
    output: formulaOutput,
    //placeholder is synced to input (we use it for copy/pasting formulas )
    input: formulaData.nonEvaledText,
    placeholder: formulaData.nonEvaledText,
    isFormula: true,
  };
  //add depandantFormula(current one) to all the param cells
  formulaData.paramList?.forEach((item) => {
    //add current formula to the list of deps in this param cell
    let cellRowId = item.rowId;
    let cellColumnId = item.columnId;
    //if this value doesn't have row/column Id, this direct input, return right away
    if (!cellRowId) return;
    const currentCell = { ...newRows[cellRowId].cells[cellColumnId] };
    //this cell already has a formula, concat the new one on top of these
    if (
      currentCell.dependantFormulas &&
      currentCell.dependantFormulas.length > 0
    ) {
      newRows[cellRowId].cells[cellColumnId] = {
        ...currentCell,
        //CONSIDERATION: do we always concat?
        //CONSIDERATION: is there possible duplication here?
        dependantFormulas: [
          ...currentCell.dependantFormulas,
          { columnId, rowId },
        ],
      };
    }
    //this is the first formula here
    else {
      newRows[cellRowId].cells[cellColumnId] = {
        ...currentCell,
        //CONSIDERATION: do we always concat?
        //CONSIDERATION: is there possible duplication here?
        dependantFormulas: [{ columnId, rowId }],
      };
    }
    //if this cell is a formula and we just updated it's dependant formulas, we keep track of that
    if (newRows[cellRowId].cells[cellColumnId].formulaData) {
      formulatedList.set(
        `${cellColumnId},${cellRowId}`,
        newRows[cellRowId].cells[cellColumnId]
      );
    }
  });
  const updatedFormula = newRows[rowId].cells[columnId];
  //update our formula map and check for recursion
  formulatedList.set(`${columnId},${rowId}`, updatedFormula);
  //Remove the formula and add an error msg
  if (checkFormulaGraph() === "there is a cycle") {
    newRows = unHookFormula(
      updatedFormula.formulaData,
      columnId,
      rowId,
      newRows
    );
    //TODO:make a variable for these (like updateCell)
    newRows[rowId].cells[columnId].text = "#ERR infinite loop";
    newRows[rowId].cells[columnId].output = "#ERR infinite loop";
    newRows[rowId].cells[columnId].input = updatedFormula.input;
    newRows[rowId].cells[columnId].placeholder = updatedFormula.placeholder;
    newRows[rowId].cells[columnId].isFormula = true;

    return newRows;
  }
  if (
    updatedFormula.dependantFormulas &&
    updatedFormula.dependantFormulas.length > 0
  ) {
    //since this cell has other cells depndant on it and it's a formula we have to update their valueLists because this one just changed
    updatedFormula.dependantFormulas.forEach((item) => {
      const formulaLocation = item;
      newRows = updateFormulaFoo(
        updatedFormula.text,
        formulaLocation,
        { columnId, rowId },
        newRows
      );
    });
  }

  return newRows;
};
const unHookFormula = (formulaData, columnId, rowId, rows) => {
  /**
   * unlike param cells
   * i.e deleting the ref to the formula cell in dependantFormulas array in param cells
   * and remove formulaData from given formula cell and make it editable again
   * also update formulatedList Map refrence to it (remove it)
   **/
  if (formulaData === false) return false;
  //update formula cell removing the formulaData obj
  let newRows = cloneDeep(rows);
  //update formula cell, deleting formulaData
  let formulaCell = newRows[rowId].cells[columnId];
  delete formulaCell.formulaData;
  delete formulaCell.placeholder;
  //mark cell as a none formula
  delete formulaCell.isFormula;
  //we make sure to update formulatedList (formula refrence Map) by removing this formula
  formulatedList.delete(`${columnId},${rowId}`);
  //update each param cell, removing the link between it and the formula cell
  formulaData.paramList?.forEach((item) => {
    let cellRowId = item.rowId;
    let cellColumnId = item.columnId;
    //if this value doesn't have row/column Id, this is direct input, we return
    if (!cellRowId) return;
    const currentCell = { ...newRows[cellRowId].cells[cellColumnId] };

    if (
      currentCell.dependantFormulas &&
      currentCell.dependantFormulas.length > 0
    ) {
      //make a new dependantFormulas array, removing the current formula
      let newDependantFormulas = currentCell.dependantFormulas.filter(
        (item) => {
          return item.columnId !== columnId || rowId !== item.rowId;
        }
      );
      //if newDependantFormulas are empty ie length == 0, remove them entirely
      newRows[cellRowId].cells[cellColumnId] = {
        ...currentCell,
        dependantFormulas: newDependantFormulas,
      };
      if (newDependantFormulas.length === 0) {
        delete newRows[cellRowId].cells[cellColumnId].dependantFormulas;
      }
      if (currentCell.formulaData) {
        //if this cell is a formula
        //since we just updated dependantFormulas list we have to update the referencing too
        formulatedList.set(
          `${cellColumnId},${cellRowId}`,
          newRows[cellRowId].cells[cellColumnId]
        );
      }
    }
  });
  //return the new udpate rows
  return newRows;
};
const formulateRows = (rows) => {
  /**
   * remvoe all depandant formulas and formulaData
   * and re-eval all of them again
   * returns updated rows
   */
  let newRows = cloneDeep(rows).map((item, rowId) => {
    return {
      rowId: rowId,
      cells: item.cells.map((item) => {
        let newCell = { ...item };
        delete newCell.dependantFormulas;
        //if we have formulaData extract the non-evaled text and make it the text here
        if (newCell.formulaData || newCell.isFormula) {
          newCell.text = newCell.placeholder; //set input(placeholder) to text so we can re-eval this
          delete newCell.formulaData;
          delete newCell.placeholder;
          //mark cell as a none formula
          delete newCell.isFormula;
        }
        return newCell;
      }),
    };
  });
  //reset formulatedList
  formulatedList = new Map();
  //eval formulas again
  let newRowsFormulas = newRows;
  newRows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, cellIndex) => {
      let potentiallyNewerRows = formulateFormula(
        cell.text,
        cellIndex,
        rowIndex,
        newRowsFormulas
      );
      if (potentiallyNewerRows) newRowsFormulas = potentiallyNewerRows;
    });
  });
  return newRowsFormulas;
};
const updateCell = (changes, prevRows) => {
  /**
   * given incoming changes we update our cell and affect other cells if need be
   */
  const { rowId, columnId, newCell, previousCell } = changes;
  let newRows = cloneDeep(prevRows);
  let newText = "";
  if (newCell.placeholder && previousCell.placeholder) {
    //formula cell => formula cell
    //both newCell and previous cell has placeholder
    newText = newCell.placeholder;
    //if both placeholders are equal this is direct input
    if (newCell.placeholder === previousCell.placeholder) {
      newText = newCell.text;
    }
  } else if (!newCell.placeholder && previousCell.placeholder) {
    //text cell => formula cell
    //newCell has no placeholder => previousCell has placeholder
    newText = newCell.text;
  } else if (newCell.placeholder && !previousCell.placeholder) {
    //formula cell => text cell
    //newCell has placeholder => previous text has no placerholder
    newText = newCell.placeholder;
  } else if (!newCell.placeholder && !previousCell.placeholder) {
    //text cell => text cell
    //both have no placeholder
    newText = newCell.text;
  }

  const updatedCell = {
    ...newRows[rowId].cells[columnId],
    text: newText,
    output: newText,
    input: newText,
    //we reset this in case we're going from formula to text cell
    placeholder: "",
  };
  //we remove this in case we go from formula( or formula feedback) => text cell
  delete updatedCell.isFormula;

  newRows[rowId].cells[columnId] = updatedCell;
  if (updatedCell.formulaData) {
    //we have a formula here, we have to treat it
    newRows = unHookFormula(updatedCell.formulaData, columnId, rowId, newRows);
  }
  const { dependantFormulas } = newRows[rowId].cells[columnId];
  //this cell has one or more depandant formulas,
  //we run updateFormulaFoo
  if (dependantFormulas && dependantFormulas.length > 0) {
    dependantFormulas.forEach((item) => {
      const formulaLocation = item;
      newRows = updateFormulaFoo(
        newText,
        formulaLocation,
        { columnId, rowId },
        newRows
      );
    });
  }
  //check if user entered a formula
  let potentiallyNewerRows = formulateFormula(
    newText,
    columnId,
    rowId,
    newRows
  );
  if (potentiallyNewerRows) newRows = potentiallyNewerRows;
  return newRows;
};
const updateFormulaFoo = (
  updatedValue,
  formulaLocation,
  currentCellLocation, // gets me the value I will inject into value list
  rows
) => {
  /**
   * this runs on cell change
   * this goes to formula cell and updates it depending on the updatedValue
   * todo:clean it up
   * todo: validate input (display error state in formula cell if no logic value can be derived here)
   */
  //TODO: mass deletion causes issue here (paramlist undefined)
  let newRows = cloneDeep(rows);
  const formulaColId = formulaLocation.columnId;
  const formulaRowId = formulaLocation.rowId;
  const { columnId, rowId } = currentCellLocation;

  let newFormulaCell = { ...newRows[formulaRowId].cells[formulaColId] };
  let newFormulaData = {
    ...newRows[formulaRowId].cells[formulaColId].formulaData,
  };
  //update valueList with the current cellValue
  //TODO: optmise if no changes cancel the rest of this
  //TODO: sometimes, for some reason, no newFormulaData, just return the unchanged rows
  if (!newFormulaData) return newRows;
  const position = { row: formulaRowId, col: formulaColId, sheet: "main" };
  const formulaData = FoPar(newFormulaData.nonEvaledText, rows, position);

  newFormulaCell.formulaData = formulaData;
  newFormulaCell.text = formulaData.result;
  newFormulaCell.output = formulaData.result;

  //update the formula cell with our values
  newRows[formulaRowId].cells[formulaColId] = newFormulaCell;
  //TODO: on changing the formula cell, that cell can also have depandant cells
  //does the formula cell have dependant cells?
  const dependantFormulas = newFormulaCell.dependantFormulas;
  //add the updated formula to our formula(ted) list
  formulatedList.set(`${formulaColId},${formulaRowId}`, newFormulaCell);
  if (checkFormulaGraph() === "there is a cycle") {
    //Remove the formula and add an error msg
    newRows = unHookFormula(
      newFormulaCell.formulaData,
      columnId,
      rowId,
      newRows
    );
    //TODO:make a variable for these (like updateCell)
    newRows[rowId].cells[columnId].text = "#ERR infinite loop";
    newRows[rowId].cells[columnId].output = "#ERR infinite loop";
    newRows[rowId].cells[columnId].input = newFormulaCell.input;
    newRows[rowId].cells[columnId].placeholder = newFormulaCell.placeholder;
    newRows[rowId].cells[columnId].isFormula = true;

    return newRows;
  }
  //go through dependantFormulas if any and update them
  if (dependantFormulas && dependantFormulas.length > 0) {
    dependantFormulas.forEach((item) => {
      const formulaLocation = item;

      newRows = updateFormulaFoo(
        newFormulaCell.text,
        formulaLocation,
        { formulaColId, formulaRowId }, //curent cell passed to updateFormulaFoo should be the formula cell not the param one (current)
        newRows
      );
    });
  }

  return newRows;
};
const generateRows = (rowCount, oldRows, columnStyles = [], rowStyles = []) => {
  //++cellcount
  /* 
    generate X more rows 
    returns all new grid rows 
  */
  //make a copy of the old rows
  const newRows = cloneDeep(oldRows);
  //establish the number of columns
  const colCount = newRows[0].cells.length;

  //add x rows (rowCount)
  for (let i = 0; i < rowCount; i++) {
    let cells = [];
    //make the cells using colCount
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      //if it's a first cell, insert the row count and add nonEditable => true to make it not editable
      // else just have an empty string and nonEditable => false (by default)
      if (colIndex === 0) {
        cells.push(getFirstCell(newRows.length.toString()));
      } else {
        cells.push({
          type: "extendedText",
          text: "",
          output: "",
          input: "",
        });
      }
    }
    //insert the id of the new row and insert the row
    newRows.push({
      rowId: newRows.length,
      cells,
    });
  }
  //attach column styles if any
  //TODO: when saving remove false values to save space
  columnStyles.forEach((item) => {
    const colIndex = item[0] + 1; //offset we have an extra (just for display) column
    const customStyles = item[1];

    newRows[0].cells[colIndex] = {
      ...newRows[0].cells[colIndex],
      customStyles,
    };
  });
  //attach the row styles if any
  rowStyles.forEach((item) => {
    const rowIndex = item[0] + 1; //offset we have an extra (just for display) column
    const customStyles = item[1];

    newRows[rowIndex].cells[0] = {
      ...newRows[rowIndex].cells[0],
      customStyles,
    };
  });
  return newRows;
};
const verifyCellCount = (columns, rows, offset) => {
  //returns true/false appropriately
  //we're interested in the cells that end up being saved to the backend here
  //deduct none useable columns and rows (from offset too)

  const futureCount = (rows.length - 1) * (columns.length - 1) + (offset - 1);
  if (futureCount > CELL_CAP) {
    //return false
    return false;
  }
  return true;
};
const inCell = (cellArray, rows) => {
  /***
   * given cells array
   * example: [[1,1],{"meta":{ "bold":true },"data":{"input":"ID","output":"ID"}}]
   * put them in their place!
   * and return an updated rows array
   */
  //we make sure to reset formulatedList and I think this is a good place for doing that
  formulatedList = new Map();

  let newRows = cloneDeep(rows);

  cellArray.forEach((item) => {
    //offset by one to
    let rowId = item[0][0] + 1;
    let columnId = item[0][1] + 1;
    let cellData = item[1];

    const cellToUpdate = newRows[rowId].cells[columnId];
    cellToUpdate.text = cellData.data.input;
    //for now input is the same as output
    cellToUpdate.input = cellData.data.input;
    cellToUpdate.output = cellData.data.output;
    //make our customStyles obj from this data
    //array of objs to a shallow obj that we can use
    const metaObj = cellData.meta.reduce((a, b) => Object.assign(a, b), {});
    //generic meta obj used in the frontend
    let customStyles = {
      bold: metaObj.bold,
      italic: metaObj.italic,
      color: metaObj.foreground,
      backgroundColor: metaObj.background,
      strikethrough: metaObj.strikethrough,
      underline: metaObj.underline,
      fontSize: metaObj.size,
    };
    //remove all the fields that evaled to undefined (don't exist)
    Object.keys(customStyles).forEach(
      (key) => customStyles[key] === undefined && delete customStyles[key]
    );
    //update the customStyles obj only if we end up with any defined properties
    if (Object.keys(customStyles).length > 0) {
      cellToUpdate.customStyles = customStyles;
    }
  });
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
const addColumn = (selectedColumnId, direction, columns, rows) => {
  //++cellcount
  /**
   * given a columnId and direction
   * insert a whole column
   * i.e add a cell in each row at the given columnId(cells[x])
   * offset either to the left or right
   * updates state (rows and columns)
   **/

  //make a copy of current rows and columns
  let newRows = cloneDeep(rows);
  let newColumns = cloneDeep(columns);
  //cell index is offset by direction from columnId
  let cellIndex =
    direction === "left" ? selectedColumnId : selectedColumnId + 1;

  //update our columns here
  //split into two arrays, before and after cellIndex
  //todo: interact with a copy of columns.... not columns itself
  let newColumnsBefore = newColumns.slice(0, cellIndex);
  let newColumnsAfter = newColumns.slice(cellIndex);
  //add our new column in the before array
  newColumnsBefore.push({
    //todo: make a function that spits out this data in our helper
    columnId: newColumnsBefore.length,
    //todo: use base26string on this and on the rest of the columnNames
    columnName: toString26(newColumnsBefore.length).toUpperCase(),
    width: COLUMN_WIDTH,
    resizable: true,
  });
  //adjust the after array's indecies
  let startIndex = newColumnsBefore.length;
  newColumnsAfter = newColumnsAfter.map((item, index) => {
    let newIndex = startIndex + index;

    return {
      ...item,
      columnId: newIndex,
      columnName: toString26(newIndex).toUpperCase(),
    };
  });
  //merge the two parts
  const finalColumns = [...newColumnsBefore, ...newColumnsAfter];
  //update our rows here
  newRows.forEach((item, index) => {
    let newCell;
    if (index === 0) {
      //header cells
      //use the generated columns above here
      //update the title of the first row (columns)
      //we make sure to reinsert column styles
      let newCells = finalColumns.map((item, columnIndex) => {
        let customStyles;
        //try catch since there is always an cell difference between columns and rows(one we add here)
        try {
          //we don't look for styles in new cell position
          if (columnIndex < cellIndex) {
            //before insert position
            customStyles = newRows[0].cells[columnIndex].customStyles;
          } else if (columnIndex > cellIndex) {
            //after insert position
            customStyles = newRows[0].cells[columnIndex - 1].customStyles;
          }
        } catch (e) {}
        return getColumnCell(item.columnName, customStyles);
      });
      newRows[0].cells = newCells;
    } else {
      //regular cells
      //add a new empty cell in this row at the index we have
      newCell = {
        type: "extendedText",
        text: "",
        output: "",
        input: "",
      };
      //insert newCells at the current index
      arrayInsertItemAtIndex(cellIndex, newCell, item.cells);
    }
  });

  let updatedFormulasRows = formulateRows(newRows);
  return { newColumns: finalColumns, newRows: updatedFormulasRows };
};
const addRow = (selectedRowId, direction, rows) => {
  //++cellcount
  /**
   * given a row id and direction
   * insert a whole row
   * offset either to be above or below currently selected row
   * updates state (rows )
   **/
  //make a copy of current rows
  let newRows = cloneDeep(rows);
  formulateRows(rows);
  //cell index is offset by direction from columnId
  let rowIndex = direction === "above" ? selectedRowId : selectedRowId + 1;
  //split into tow arrays, before rowIndex and afterRowIndex
  //split into two arrays, before and after cellIndex
  let newRowsBefore = newRows.slice(0, rowIndex);
  let newRowsAfter = newRows.slice(rowIndex);

  //add our new row in the before array

  newRowsBefore.push({
    rowId: newRowsBefore.length,
    //only really using this for the length value
    cells: newRowsBefore[0].cells.map((item, index) => {
      if (index === 0) {
        return getFirstCell(newRowsBefore.length.toString());
      }
      return {
        type: "extendedText",
        text: "",
        output: "",
        input: "",
      };
    }),
  });
  let startIndex = newRowsBefore.length;

  //increment the row ids and the first cell  text(count cell ) of each of these rows
  newRowsAfter = newRowsAfter.map((item, index) => {
    let newCells = [...item.cells];
    newCells[0].text = (startIndex + index).toString();
    return {
      rowId: startIndex + index,
      cells: newCells,
    };
  });
  //merge the two arrays
  let finalRows = [...newRowsBefore, ...newRowsAfter];
  let updatedFormulasRows = formulateRows(finalRows);
  return { newRows: updatedFormulasRows };
};
const deleteColumn = (selectedColumnId, columns, rows) => {
  /**
   * Given columnId, delete a whole column
   * i.e delete from each row the cell at selectedColumnId (cells[x])
   * updates row and column state
   * todo: in the future should just return new rows/columns
   *  */
  //make a copy of current rows and columns
  let newRows = cloneDeep(rows);
  let newColumns = cloneDeep(columns);

  //update our columns here
  //split into two arrays, before and after cellIndex
  let newColumnsBefore = newColumns.slice(0, selectedColumnId);
  let newColumnsAfter = newColumns.slice(selectedColumnId);
  //the column to remove is here in the front of the after array, shift it
  newColumnsAfter.shift();
  //adjust the after array's indecies and names
  let startIndex = selectedColumnId;
  newColumnsAfter = newColumnsAfter.map((item, index) => {
    return {
      ...item,
      columnId: startIndex + index,
      columnName: toString26(startIndex + index).toUpperCase(),
    };
  });

  //merge the two parts
  const finalColumns = [...newColumnsBefore, ...newColumnsAfter];
  //update our rows, deleteing the cells that need to be
  const finalRows = newRows.map((item, index) => {
    if (index === 0) {
      //header cells
      //use the generated columns above here
      //update the title of the first row (columns)
      //we make sure to reinsert column styles
      let newCells = finalColumns.map((item, columnIndex) => {
        //we want to reinsert styles if we have any
        let customStyles;
        //try catch since there is always an cell difference between columns and rows(one we add here)
        try {
          if (columnIndex < selectedColumnId) {
            //before delete position
            customStyles = newRows[0].cells[columnIndex].customStyles;
          } else if (columnIndex > selectedColumnId) {
            //after delete position
            customStyles = newRows[0].cells[columnIndex + 1].customStyles;
          } else if (columnIndex === selectedColumnId) {
            //at delete position
            customStyles = newRows[0].cells[columnIndex + 1].customStyles;
          }
        } catch (e) {}
        return getColumnCell(item.columnName, customStyles);
      });
      return { ...item, cells: newCells };
    } else {
      //regular cells
      let newCells = cloneDeep(item.cells);
      //remove the cell we want to get rid of
      newCells.splice(selectedColumnId, 1);
      return { ...item, cells: newCells };
    }
  });

  let updatedFormulasRows = formulateRows(finalRows);
  return { newColumns: finalColumns, newRows: updatedFormulasRows };
};
const deleteRow = (selectedRowId, rows) => {
  /**
   * Given rowId, delete a whole row
   * i.e delete a whole entry from rows array, offseting the count
   * updates rows state
   * todo: in the future should just return new rows
   *  */

  //split into tow arrays, before rowIndex and afterRowIndex
  //split into two arrays, before and after cellIndex
  let newRows = cloneDeep(rows);
  let newRowsBefore = newRows.slice(0, selectedRowId);
  let newRowsAfter = newRows.slice(selectedRowId);

  //the row we want to delete is in the after array (at 0 index), we shift it off
  newRowsAfter.shift();

  let startIndex = selectedRowId;

  //increment the row ids and the first cell  text(count cell ) of each of these rows
  newRowsAfter = newRowsAfter.map((item, index) => {
    let newCells = [...item.cells];
    newCells[0].text = (startIndex + index).toString();
    return {
      rowId: startIndex + index,
      cells: newCells,
    };
  });
  //merge the two arrays
  let finalRows = [...newRowsBefore, ...newRowsAfter];
  let updatedFormulasRows = formulateRows(finalRows);

  return { newRows: updatedFormulasRows };
};
/* JSON HELPERS */
const jsonToData = (json) => {
  /**
   *  given an array of arrays turn them into into rows and return them
   */

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
      cells.push({
        type: "extendedText",
        text: item,
        output: item,
        input: item,
      });
    });
    return {
      rowId: offsetIndex,
      cells,
    };
  });
  //combine first row(meta data) with the rest of the rows (data from backend)
  return [...firstRow, ...rows];
};
const rowsToArrays = (rows) => {
  /*
    giving rows returns and array of arrays of just text data(includes empty rows) (csv like) 
  */
  //exclude first row (a,b,c...) (coulmns)
  let newData = cloneDeep(rows);
  newData.shift();

  const parsedRows = newData.map((item) => {
    let newCells = [...item.cells];
    //exclude the first cell (1,2,3...) (row count cell)
    newCells.shift();
    return newCells.map((item) => {
      return item.output;
    });
  });

  return parsedRows;
};
const metaArrayToStyleArray = (metaArray) => {
  /**
   * Given array of meta data(styles) from server turn it into something we can use in the frontend
   */
  const styleArray = metaArray.map((meta, index) => {
    const metaObj = meta[1].reduce((a, b) => Object.assign(a, b), {});
    //generic meta obj used in the frontend
    let customStyles = {
      bold: metaObj.bold,
      italic: metaObj.italic,
      color: metaObj.foreground,
      backgroundColor: metaObj.background,
      strikethrough: metaObj.strikethrough,
      underline: metaObj.underline,
      fontSize: metaObj.size,
      width: metaObj.width,
    };
    //remove all the fields that evaled to undefined (don't exist)
    Object.keys(customStyles).forEach(
      (key) => customStyles[key] === undefined && delete customStyles[key]
    );
    return [meta[0], customStyles];
  });
  return styleArray;
};
const styleObjectToMetaArray = (customStyles) => {
  /**
   * Given a style object from the frontend turn it into something the backend can use
   */
  let metaArray = [];
  if (customStyles) {
    //make our customStyles obj from this data
    let metaObj = {
      bold: customStyles.bold,
      italic: customStyles.italic,
      foreground: customStyles.color,
      background: customStyles.backgroundColor,
      strikethrough: customStyles.strikethrough,
      underline: customStyles.underline,
      size: customStyles.fontSize,
    };
    Object.keys(metaObj).forEach((key) => {
      //if field is defined add it to our list
      if (metaObj[key] !== undefined) {
        metaArray.push({ [key]: metaObj[key] });
      }
    });
  }
  return metaArray;
};
const dataToJson2 = (data, columns, meta) => {
  /*
    takes grid data(rows) and columns and transform it into what the back-end expects
    excluding first cell of each row and the first row entierly
    returns back end ready data
  */
  //exclude first row (a,b,c...) (coulmns)
  let newData = cloneDeep(data);
  //remove from newData and assign the result to columnRow, we use it to get column meta
  const columnRow = newData.shift();
  //generate column meta
  const columnMeta = [];
  columnRow.cells.forEach((col, index) => {
    //always exclude first column
    if (index === 0) return;
    //if this column either has a custom width or customStlyes, we save it
    if (
      columns[index].width !== COLUMN_WIDTH ||
      (col.customStyles && Object.keys(col.customStyles).length > 0)
    ) {
      const columnMetaArray = styleObjectToMetaArray(col.customStyles);
      //check for width in corresponding column (coulmn array)
      if (columns[index].width !== COLUMN_WIDTH) {
        //we have a width that differs from app default
        //we add this to the metaArray
        columnMetaArray.push({ width: parseInt(columns[index].width) }); //only accepts ints not floats
      }
      if (columnMetaArray && columnMetaArray.length > 0) {
        columnMeta.push([index - 1, columnMetaArray]); //make sure to offset first column
      }
    }
  });
  //update row/column count and last-modified
  const rowCount = data.length - 1;
  const columnCount = data[0].cells.length - 1;
  const timeNow = new Date().getTime();
  //get the data we save and meta data
  const jsonData = [];
  const rowMeta = [];
  newData.forEach((item, rowIndex) => {
    let newCells = [...item.cells];
    //exclude the first cell (1,2,3...) (row count cell)
    //check the first cell we just removed for row styles
    const rowCell = newCells.shift();
    if (rowCell.customStyles) {
      //we have styles, update row meta array
      const rowMetaArray = styleObjectToMetaArray(rowCell.customStyles);
      if (rowMetaArray && rowMetaArray.length > 0) {
        rowMeta.push([rowIndex, rowMetaArray]); //we already offset :)
      }
    }
    return newCells.forEach((item, columnIndex) => {
      //we save either cells that have a text value or customStyles value
      if (item.text.length > 0 || item.customStyles) {
        //we have a value, this gets included into the data we send

        let textData = { input: item.input, output: item.output };
        let metaArray = styleObjectToMetaArray(item.customStyles);
        //rowId =>  rowIndex
        //columnId => cellIndex
        let jsonDataItem = [
          [rowIndex, columnIndex],
          { meta: metaArray, data: textData },
        ];
        //add this item to our main jsonData
        jsonData.push(jsonDataItem);
      }
    });
  });
  const sheetMeta = {
    ...meta,
    "column-count": columnCount,
    "column-meta": columnMeta,

    "row-count": rowCount,
    "row-meta": rowMeta,
    "last-modified": timeNow,
  };
  return { meta: sheetMeta, data: jsonData };
};

/*ENV HELPERS*/
const isDev = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";
/* TIME HELPERS */
//TODO: should be it's own file
const formatDate = (dateNumber) => {
  /**
   * Converts a given date number into something we can show the user
   * example: Aug 4, 2022, 8:01 PM
   */
  if (!dateNumber) return "no date given";

  var options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const dateObj = new Date(dateNumber);
  return dateObj.toLocaleDateString("en-US", options);
};
/* CSV HELPERS */
function downloadBlob(content, filename, contentType) {
  // Create a blob
  var blob = new Blob([content], { type: contentType });
  var url = URL.createObjectURL(blob);
  // Create a link and trigger it programmatically to to download it
  var pom = document.createElement("a");
  pom.href = url;
  pom.setAttribute("download", filename);
  pom.click();
}
const exportRowsCSV = () => {
  /**
   * Given rows turns them into CSV data and promptly downloads the data as a file
   */
  const rows = useStore.getState().rows;
  const parsedRows = rowsToArrays(rows);
  const results = Papa.unparse(parsedRows);

  downloadBlob(results, "export.csv", "text/csv;charset=utf-8;");
  return true;
};

const importCSV = (csv) => {
  /**
   * Given a CSV text returns a javascript array of arrays
   */
  const result = Papa.parse(csv);
  return result.data;
};
function structureJson(data) {
  //TODO: refractor this and structureJson1
  /**
   * converts json recieved into sommething that works for the front-end
   **/

  let meta = data.meta;
  let rowsData = data.data;
  let newItem = {
    id: meta.id,
    title: meta.title,
    lastEdited: meta["last-modified"],
    lastEditedFromatedDate: formatDate(meta["last-modified"]), //improving performence by adding this
    owner: meta.owner,
    tags: meta.tags.map((item, index) => {
      return { label: item, key: index };
    }),
    path: meta.path,
    sheetMeta: {
      columnCount: meta["column-count"],
      rowCount: meta["row-count"],
      rowMeta: meta["row-meta"],
      columnMeta: meta["column-meta"],
    },
    sheetData: rowsData,
    uneditedSheetMeta: meta,
  };
  return newItem;
}
function structureJson1(data) {
  /**
   * converts json recieved into sommething that works for the front-end
   **/
  let newData = data.map((item, index) => {
    let meta = item[1];
    let newItem = {
      id: meta.id,
      title: meta.title,
      lastEdited: meta["last-modified"],
      lastEditedFromatedDate: formatDate(meta["last-modified"]), //improving performence by adding this

      owner: meta.owner,
      tags: meta.tags.map((item, index) => {
        return { label: item, key: index };
      }),
      path: meta.path,
      sheetMeta: {
        columnCount: meta["column-count"],
        rowCount: meta["row-count"],
        rowMeta: meta["row-meta"],
        columnMeta: meta["column-meta"],
      },
    };
    return newItem;
  });

  return newData;
}
function matchURLSafe(string) {
  //returns matches in a string to a urlsafe pattern
  let urlSafePattern = /^((\/)[a-z0-9._1~-]{1,})*$/g;
  const matches = string.match(urlSafePattern);

  return matches;
}
export {
  getColumns,
  getRows,
  updateCell,
  generateRows,
  jsonToData,
  reiszeColumns,
  isDev,
  toString26,
  formulateFormula,
  unHookFormula,
  inCell,
  formatDate,
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  verifyCellCount,
  exportRowsCSV,
  importCSV,
  dataToJson2,
  structureJson,
  structureJson1,
  matchURLSafe,
  metaArrayToStyleArray,
};
