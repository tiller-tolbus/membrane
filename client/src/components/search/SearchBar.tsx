import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";

import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

const Item = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(["background", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  marginRight: theme.spacing(1),
  display: "flex",
  height: 30,
  borderRadius: 10,
  width: 360,
}));

export default function SearchBar({ onSearch = null, sheetList = [] }) {
  const [inputValue, setInputValue] = React.useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val: string = event.target.value;
    setInputValue(val);
    //TODO: debounce?
    //depending on inputvalue
    //filter our data to the ones that match
    const results = sheetList.filter((item) => {
      //does this sheet's title contain the search query? return boolean accordingly
      return item.title.toLowerCase().includes(val.toLowerCase());
    });
    onSearch(results);
  };
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent={"center"}
    >
      <Item
        variant="outlined"
        //component="form"
        //how to make this a form?
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search By Title"
          inputProps={{ "aria-label": "search the sheet list" }}
          value={inputValue}
          onChange={handleChange}
        />
      </Item>
    </Stack>
  );
}
