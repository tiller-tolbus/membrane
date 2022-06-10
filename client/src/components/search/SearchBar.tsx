import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

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
const StyledRoundButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "#E1E1E1",
  width: 40,
  height: 40,
  borderRadius: 20,
  marginLeft: theme.spacing(1),
}));

export default function SearchBar() {
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent={"center"}
      sx={{ marginBottom: 2 }}
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
        />
      </Item>
      <StyledRoundButton type="submit" sx={{ p: "10px" }} aria-label="search">
        <SearchIcon />
      </StyledRoundButton>
      <StyledRoundButton type="submit" sx={{ p: "10px" }} aria-label="search">
        <FilterListIcon />
      </StyledRoundButton>
    </Stack>
  );
}
