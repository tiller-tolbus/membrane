import { SUM, PRODUCT } from "@formulajs/formulajs"; // import individual components

const availableFormulas = [
  { name: "SUM", execute: SUM },
  { name: "PRODUCT", execute: PRODUCT },
  {
    name: "EXACT",
    execute: (arr) => arr.every((v) => v === arr[0]), //checks if every value is the same
  },
  {
    name: "DIV",
    execute: (arr) => {
      //divide first value by second
      if (arr.length > 2) return "Error too many params";
      return arr[0] / arr[1];
    },
  },
];
export default availableFormulas;
