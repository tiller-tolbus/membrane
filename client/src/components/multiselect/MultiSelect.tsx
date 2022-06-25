import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export default function MultiSelect({ options, onSelection, defaultValue }) {
  const [selectedValue, setSelectedValue] = React.useState(null);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedValue(event.target.value);
    //callback here
    onSelection(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="font-size-select">Font Size</InputLabel>
      <Select
        labelId="font-size-select"
        id="font-size-select"
        //if no selected value use default one
        value={selectedValue ? selectedValue : defaultValue}
        onChange={handleChange}
        label="Font Size"
      >
        {options.map((item, index) => {
          return (
            <MenuItem key={index} value={item.value}>
              {item.value}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
