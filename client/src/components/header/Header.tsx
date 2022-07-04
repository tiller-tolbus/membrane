import React from "react";

//mui
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import LoadingButton from "@mui/lab/LoadingButton";
import verbiage from "../../verbiage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

export default function Header({
  children,

  connected,
  synced,
  syncSheet,
  sheetName,
}) {
  let navigate = useNavigate();

  return (
    <Stack
      sx={{
        position: "sticky",
        top: 0,
        paddingTop: 1,
        paddingBottom: 1,
        paddingRight: 2,
      }}
    >
      <Button
        size={"small"}
        startIcon={<ArrowBackIcon />}
        sx={{ border: "none", color: "black", width: 100 }}
        onClick={() => {
          navigate(-1); 
        }}
      >
        go back
      </Button>
      <Stack direction="row" justifyContent={"space-between"}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{sheetName}</Typography>
        </Stack>
        {connected.success && (
          <LoadingButton
            sx={{ width: 100 }}
            variant="contained"
            loading={synced.trying}
            onClick={() => {
              syncSheet();
            }}
            loadingIndicator="Syncing..."
          >
            {verbiage.sync}
          </LoadingButton>
        )}
      </Stack>
      {children}
    </Stack>
  );
}
