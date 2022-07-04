import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export default function MultiSelect({
  options,
  onSelection,
  defaultValue,
  disabled,
}) {
  const [selectedValue, setSelectedValue] = React.useState(null);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedValue(event.target.value);
    //callback here
    onSelection(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: "65px" }} size="small">
      <Select
        id="font-size-select"
        //if no selected value use default one
        value={selectedValue ? selectedValue : defaultValue}
        onChange={handleChange}
        disabled={disabled}
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
