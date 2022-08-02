import React from "react";

//mui
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

import Alert from "../alert/Alert";
import verbiage from "../../verbiage";
export default function Snackie({
  open,
  state,
  handleClose,
  errorRetry = null,
  successText,
  errorText,
}) {
  const { success, error } = state;
  if (success) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleClose} severity={"success"} sx={{ width: 300 }}>
          {successText}
        </Alert>
      </Snackbar>
    );
  } else {
    return (
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        autoHideDuration={3000}
      >
        <Alert
          severity={"error"}
          sx={{ width: 300 }}
          action={
            errorRetry && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  errorRetry();
                }}
              >
                {verbiage.tryAgain}
              </Button>
            )
          }
        >
          {errorText}
        </Alert>
      </Snackbar>
    );
  }
}
