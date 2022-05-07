import React from "react";

//mui
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

import Alert from "../alert/Alert";
import verbiage from "../../verbiage";
export default function Snackie({ open, synced, handleClose, errorRetry }) {
  const { success, error } = synced;
  if (success) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={"success"} sx={{ width: 300 }}>
          {verbiage.syncSuccess}
        </Alert>
      </Snackbar>
    );
  } else {
    return (
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={"error"}
          sx={{ width: 300 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                errorRetry();
              }}
            >
              {verbiage.tryAgain}
            </Button>
          }
        >
          {verbiage.syncFail}
        </Alert>
      </Snackbar>
    );
  }
}
