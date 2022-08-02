import { SUM, PRODUCT } from "@formulajs/formulajs"; // import individual components

const availableFormulas = [
  {
    name: "SUM",
    execute: (arr) => {
      //make sure all the inputs are (stringed) numbers
      const isValid = arr.every((value) => !isNaN(parseInt(value)));
      //feedback to the user
      if (!isValid) return "#ERR: params must be numbers";

      return SUM(arr);
    },
  },
  { name: "PRODUCT", execute: PRODUCT },
  {
    name: "EXACT",
    execute: (arr) => arr.every((v) => v === arr[0]), //checks if every value is the same
  },
  {
    name: "DIV",
    execute: (arr) => {
      //divide first value by second
      if (arr.length > 2) return "#ERR: too many params";
      return arr[0] / arr[1];
    },
  },
];
export default availableFormulas;
