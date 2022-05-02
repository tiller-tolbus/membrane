import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import api from "../../api";
import { dataToJson } from "./helpers";
import useStore from "../../store";

export default function GridOptions({ addRowsCb }) {
  const [addMoreInputValue, setAddMoreInputValue] = useState<string>("1");
  const [error, setError] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val: string | number = parseInt(event.target.value);
    console.log("val", val);
    if (val <= 0) {
      //value too small tell the user to enter something usefull
      setError(true);
      setFeedback("at least 1 row");
    } else if (val > 1000) {
      //value too large tell the user to enter something usefull
      setError(true);
      setFeedback("at most 1000");
    } else if (isNaN(val)) {
      setError(true);
      setFeedback("");
    } else {
      setError(false);
      setFeedback("");
    }
    setAddMoreInputValue(val.toString());
  };
  return (
    <Stack
      sx={{ marginTop: "1em" }}
      direction="row"
      spacing={2}
      alignItems="center"
    >
      <Button
        variant="contained"
        onClick={async () => {
          try {
            const pokeTestRes = await api.pokeTest();
            console.log("pokeTestRes", pokeTestRes);
          } catch (e) {
            console.log("pokeTest error", e);
          }
        }}
      >
        Poke test
      </Button>
      <Button
        disabled={error}
        variant="contained"
        onClick={() => {
          addRowsCb(addMoreInputValue);
        }}
      >
        Add
      </Button>
      <TextField
        error={error}
        helperText={feedback}
        hiddenLabel
        id="outlined-number"
        type="number"
        size="small"
        variant="standard"
        value={addMoreInputValue}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <p>more rows</p>
    </Stack>
  );
}
