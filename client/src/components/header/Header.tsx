import React from "react";

//mui
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import LoadingButton from "@mui/lab/LoadingButton";
import verbiage from "../../verbiage";

export default function Header({ connected, synced, syncSheet }) {
  return (
    <Stack
      marginTop={"1.5em"}
      marginBottom={"1em"}
      direction="row"
      justifyContent={"space-between"}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h4">{verbiage.appName}</Typography>
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
  );
}
