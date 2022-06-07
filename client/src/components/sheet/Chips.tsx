import * as React from "react";

import Stack from "@mui/material/Stack";

import { styled } from "@mui/material/styles";

import Chip from "@mui/material/Chip";

interface ChipData {
  key: number;
  label: string;
}

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function Chips({
  chipData,
  canDelete = false,
  onDelete = null,
}) {
  return (
    <Stack
      flexDirection="row"
      flexWrap="wrap"
      sx={{ listStyle: "none", cursor: "pointer" }}///fix curosr
    >
      {chipData.map((data, index) => {
        return (
          <ListItem key={index}>
            {canDelete ? (
              <Chip label={data.label} onDelete={() => onDelete(data)} />
            ) : (
              <Chip label={data.label} />
            )}
          </ListItem>
        );
      })}
    </Stack>
  );
}
