import { ROW_COUNT, CELL_CAP } from "./constants";
import availableFormulas from "./components/grid/formulajs";
import cloneDeep from "lodash/cloneDeep";
import Papa from "papaparse";
import useStore from "./store";
import Graph from "./Graph";
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
  graphy.printGraphe();
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
  return { type: "extendedText", text, nonEditable: true };
};
const getRows = (columnCount = 27, rowCount = ROW_COUNT) => {
  /*
  main grid data is returned here
  */
  return generateRows(rowCount, [getFirstRow(columnCount)]);
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
  //we have to account for our meta column
  let newLength = length + 1;
  for (let i = 0; i < newLength; i++) {
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
    return { error: true, feedback: "Please provide a function name" };
  }
  //todo: add feedback in above case
  const currentFormula = availableFormulas.filter(
    (formula) => formula.name === foundFormula
  );
  //formula function not found in our availableFormulas list, nothing to evaluate, return false
  if (currentFormula && currentFormula.length === 0) {
    //FEEDBACK: this function doesn't exist
    return { error: true, feedback: "The function you provided doesn't exist" };
  }
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

  if (!allValuesExist) {
    //FEEDBACK: Could not eval some of the cells you passed?
    //CONSIDERATION: throw error if one of the values is useless(different error, since on passing an actual value it should eval right away, so it's really just an execution error)
    return { error: true, feedback: "One or more of the cells do not exist" };
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
const formulateFormula = (cellValue, columnId, rowId, rows) => {
  /**
   * checks if value is a formula
   * if so, builds all the connections needed
   *  and adds formulaData and output value to this formula
   */
  const formulaData = fetchFormulaData(cellValue, rows);

  if (formulaData.error) {
    return false;
  }
  //update formula cell withe formula data using row and column id
  let newRows = cloneDeep(rows);
  //update formula cell with the needed values
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

  formulatedList.set(`${columnId},${rowId}`, updatedFormula);
  if (checkFormulaGraph() === "there is a cycle") {
    //Remove the formula and add an error msg
    newRows[rowId].cells[columnId].text = "#ERR infinite loop";
    return unHookFormula(updatedFormula.formulaData, columnId, rowId, newRows);
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
   * and remove formulaData from given formula cell
   **/
  if (formulaData === false) return false;
  //update formula cell removing the formulaData obj
  let newRows = cloneDeep(rows);
  //update formula cell, deleting formulaData
  let formulaCell = newRows[rowId].cells[columnId];
  delete formulaCell.formulaData;
  //update each param cell, removing the link between it and the formula cell
  formulaData.valueList.forEach((item) => {
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
    }
  });
  //return the new udpate rows
  return newRows;
};
const formulateRows = (rows) => {
  //remvoe all depandant formulas and formulaData
  //and re-eval all of them again
  let newRows = cloneDeep(rows).map((item, rowId) => {
    return {
      rowId: rowId === 0 ? "header" : rowId,
      cells: item.cells.map((item) => {
        let newCell = { ...item };
        delete newCell.dependantFormulas;
        //if we have formulaData extract the non-evaled text and make it the text here
        if (newCell.formulaData) {
          newCell.text = newCell.formulaData.nonEvaledText;
          delete newCell.formulaData;
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
  //use the changes object to directly access the correct cell and update it using the new text!
  const { rowId, columnId, newCell } = changes;
  let newRows = cloneDeep(prevRows);
  newRows[rowId].cells[columnId].text = newCell.text;

  const { dependantFormulas } = newRows[rowId].cells[columnId];
  //this cell has one or more depandant formulas,
  //we run updateFormulaFoo
  if (dependantFormulas && dependantFormulas.length > 0) {
    dependantFormulas.forEach((item) => {
      const formulaLocation = item;
      newRows = updateFormulaFoo(
        newCell.text,
        formulaLocation,
        { columnId, rowId },
        newRows
      );
    });
  }
  //check if user entered a formula
  let potentiallyNewerRows = formulateFormula(
    newCell.text,
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

  let newValueList = newFormulaData.valueList.map((item) => {
    //look up values in our sheet(rows) or return right away if direct input
    if (!item.columnId) return item;

    if (columnId == item.columnId && rowId == item.rowId) {
      //found the value to update
      return { ...item, value: updatedValue };
    } else {
      //otherwise we have to look for these ones value in real time
      //CONSIDERATION: out of bound
      const value = newRows[item.rowId].cells[item.columnId].text;
      return { ...item, value };
    }
  });
  newFormulaData.valueList = newValueList;
  //we have change in our param cells, that means update formula cell
  const executableList = newFormulaData.valueList.map((item) => item.value);
  //update the value
  newFormulaCell.formulaData = newFormulaData;
  newFormulaCell.text = newFormulaData.execute(executableList).toString();

  //update the formula cell with our values
  newRows[formulaRowId].cells[formulaColId] = newFormulaCell;
  //TODO: on changing the formula cell, that cell can also have depandant cells
  //does the formula cell have dependant cells?
  const dependantFormulas = newFormulaCell.dependantFormulas;
  // console.log("newFormulaCell", newFormulaCell);
  //add the updated formula to our formula(ted) list
  formulatedList.set(`${formulaColId},${formulaRowId}`, newFormulaCell);
  if (checkFormulaGraph() === "there is a cycle") {
    //Remove the formula and add an error msg
    newRows[rowId].cells[columnId].text = "#ERR infinite loop";
    return unHookFormula(newFormulaCell.formulaData, columnId, rowId, newRows);
  }
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
const generateRows = (rowCount, oldRows) => {
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
      let extraParams = {};
      if (colIndex === 0) {
        extraParams = getFirstCell(newRows.length.toString());
      }

      cells.push({ type: "extendedText", text: "", ...extraParams });
    }
    //insert the id of the new row and insert the row
    newRows.push({
      rowId: newRows.length,
      cells,
    });
  }
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
  let newRows = cloneDeep(rows);
  cellArray.forEach((item) => {
    //offset by one to
    let rowId = item[0][0] + 1;
    let columnId = item[0][1] + 1;
    let cellData = item[1];

    const cellToUpdate = newRows[rowId].cells[columnId];
    cellToUpdate.text = cellData.data.input;

    //make our customStyles obj from this data
    //array of objs to a shallow obj thatwe can use
    const metaObj = cellData.meta.reduce((a, b) => Object.assign(a, b), {});
    //generic meta obj used in the frontend
    let customStyles = {
      bold: metaObj.bold,
      italic: metaObj.italic,
      color: metaObj.foreground,
      backgroundColor: metaObj.background,
      strikeThrough: metaObj.strikethrough,
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
    width: 100,
    resizable: true,
  });
  //adjust the after array's indecies
  let startIndex = newColumnsBefore.length;
  newColumnsAfter = newColumnsAfter.map((item, index) => {
    return {
      ...item,
      columnId: startIndex + index,
      columnName: toString26(startIndex + index).toUpperCase(),
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
      let newCells = finalColumns.map((item) => {
        return { type: "header", text: item.columnName };
      });
      newRows[0].cells = newCells;
    } else {
      //regular cells
      //add a new empty cell in this row at the index we have
      newCell = { type: "extendedText", text: "" };
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
        return {
          type: "extendedText",
          text: newRowsBefore.length.toString(),
          nonEditable: true,
        };
      }
      return { type: "extendedText", text: "" };
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
  // console.log(newColumnsAfter.shift());
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
      let newCells = finalColumns.map((item) => {
        return { type: "header", text: item.columnName };
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
      cells.push({ type: "extendedText", text: item });
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
      return item.text;
    });
  });

  return parsedRows;
};
const dataToJson2 = (data, meta) => {
  //TODO:comment better
  /*
    takes grid data(rows) and transform it into what the back-end expects
    excluding first cell of each row and the first entierly(meta data)
    returns back end ready data
  */
  //exclude first row (a,b,c...) (coulmns)
  let newData = cloneDeep(data);
  newData.shift();

  //update row/column count and last-modified for now
  const rowCount = data.length - 1;
  const columnCount = data[0].cells.length - 1;
  const timeNow = new Date().getTime();
  const sheetMeta = {
    ...meta,
    "column-count": columnCount,
    "row-count": rowCount,
    "last-modified": timeNow,
  };

  const jsonData = [];

  newData.forEach((item, rowIndex) => {
    let newCells = [...item.cells];
    //exclude the first cell (1,2,3...) (row count cell)
    newCells.shift();
    return newCells.forEach((item, columnIndex) => {
      //does cell have a value?
      if (item.text.length > 0) {
        //we have a value, this gets included into the data we send

        //does cell have customStyles
        let textData;
        if (item.formulaData) {
          //if we have a formula text data should reflect that (input carries the formula name )
          textData = {
            input: item.formulaData.nonEvaledText,
            output: item.text,
          };
        } else {
          //otherwise input and output match
          textData = { input: item.text, output: item.text };
        }
        let metaArray = [];
        if (item.customStyles) {
          //make our customStyles obj from this data
          let metaObj = {
            bold: item.customStyles.bold,
            italic: item.customStyles.italic,
            foreground: item.customStyles.color,
            background: item.customStyles.backgroundColor,
            strikethrough: item.customStyles.strikeThrough,
            underline: item.customStyles.underline,
            size: item.customStyles.fontSize,
          };
          Object.keys(metaObj).forEach((key) => {
            //if field is defined add it to our list
            if (metaObj[key] !== undefined) {
              metaArray.push({ [key]: metaObj[key] });
            }
          });
        }
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
  return { meta: sheetMeta, data: jsonData };
};

/*ENV HELPERS*/
const isDev = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";
/* TIME HELPERS */
//TODO: should be it's own file
const formatDate = (dateNumber) => {
  if (!dateNumber) return "no date given";
  //converts a given date object into something we can show the user
  //TODO: display hours and mins?
  var options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const dateObj = new Date(dateNumber);
  return dateObj.toLocaleDateString("en-US", options);
};
/* CSV HELPERS */
function downloadBlob(content, filename, contentType) {
  // Create a blob
  var blob = new Blob([content], { type: contentType });
  var url = URL.createObjectURL(blob);
  // Create a link to download it
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
  console.log("results", results);
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
  //TODO: this one should be a single sheet item
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
};
