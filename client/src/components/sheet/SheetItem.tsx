import * as React from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { blue } from "@mui/material/colors";

import Grid from "@mui/material/Grid";
import Chips from "./Chips";
import SheetMenu from "./SheetMenu";

const Item = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(["background", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  "&:hover": { background: blue[100], cursor: "pointer" },
  margin: theme.spacing(1),
  borderRadius: 10, //todo: start building our theme
}));

export default function SheetItem({
  goToSheet,
  item,
  onRename,
  onDelete,
  onShare,
  onAdd,
}) {
  const { title, id, tags, lastEdited, sheetMeta, sheetData } = item;
  return (
    <Item
      variant="outlined"
      onClick={() => goToSheet({ sheetMeta, sheetData, title })}
    >
      <Grid container alignItems="center">
        <Grid sx={{ alignItems: "center" }} item xs={3}>
          <Typography variant="subtitle1" gutterBottom component="div">
            {title}
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <Chips chipData={tags} canDelete={false} />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="subtitle1" gutterBottom component="div">
            {lastEdited}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Stack
            flexDirection={"row"}
            justifyContent={"flex-end"}
            alignItems={"flex-start"}
          >
            <SheetMenu
              onRename={onRename}
              onDelete={onDelete}
              onShare={onShare}
              onAdd={onAdd}
              sheetId={id}
            />
          </Stack>
        </Grid>
      </Grid>
    </Item>
  );
}
