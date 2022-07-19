import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import verbiage from "../../verbiage";
import AddIcon from "@mui/icons-material/Add";

export default function GridOptions({ addRowsCb }) {
  const [addMoreInputValue, setAddMoreInputValue] = useState<string>("1");
  const [error, setError] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val: string | number = parseInt(event.target.value);
    if (val <= 0) {
      //value too small tell the user to enter something usefull
      setError(true);
      setFeedback(verbiage.addRowMinLimit);
    } else if (val > 50) {
      //value too large tell the user to enter something usefull
      setError(true);

      setFeedback(verbiage.addRowMaxLimit(50));
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
    <Stack direction="row" spacing={2} alignItems="center">
      <Button
        size={"small"}
        endIcon={<AddIcon />}
        disabled={error}
        sx={{ border: "none", color: "black", marginTop: 1 }}
        onClick={() => {
          addRowsCb(addMoreInputValue);
        }}
      >
        {verbiage.add}
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

      <p>{verbiage.moreRows}</p>
    </Stack>
  );
}
