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
  pathList,
  sheetList,
  updateSheetList,
  updatePathList,
  pals,
}) {
  const { title, id, tags, path, lastEditedFromatedDate } = item;

  return (
    <Item variant="outlined" onClick={() => goToSheet(path)}>
      <Grid container alignItems="center">
        <Grid sx={{ alignItems: "center" }} item xs={2}>
          <Typography variant="subtitle1" gutterBottom component="div">
            {title}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Chips chipData={tags} canDelete={false} />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="subtitle1" gutterBottom component="div">
            {lastEditedFromatedDate}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Stack
            flexDirection={"row"}
            justifyContent={"flex-end"}
            alignItems={"flex-start"}
          >
            <SheetMenu
              sheetId={id}
              path={path}
              title={title}
              pathList={pathList}
              updatePathList={updatePathList}
              sheetList={sheetList}
              tags={tags}
              pals={pals}
              updateSheetList={updateSheetList}
            />
          </Stack>
        </Grid>
      </Grid>
    </Item>
  );
}
