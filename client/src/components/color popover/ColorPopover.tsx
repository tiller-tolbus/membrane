import React, { useState, useRef } from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
const allColors = require("./colors.json");
const standardColors = require("./standardColors.json");
function ColorCircle({ color, onClick }) {
  return (
    <div
      onClick={() => {
        //commit the changes to the cell and close the popover
        onClick();
      }}
      style={{
        backgroundColor: color,
        width: 20,
        height: 20,
        borderRadius: 20,
        margin: 1,
        border: ".2px solid lightgrey",
        cursor: "pointer",
      }}
    ></div>
  );
}
export default function ColorPopover({
  updateCell,
  icon,
  passedId,
  disabled,
  selectedColorIcon,
}) {
  const colorInput = useRef(null);

  const [selectedColor, setSelectedColor] = useState("");

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? passedId : undefined;
  return (
    <div>
      <IconButton
        aria-describedby={id}
        aria-label="background"
        onClick={handleClick}
        color={"default"}
        disabled={disabled}
        sx={{ color: selectedColorIcon }}
        size="small"
      >
        {icon}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transitionDuration={0}
        sx={{
          maxHeight: 450,
          scrollbarColor: "#6969dd #e0e0e0",
          scrollbarWidth: "thin",
        }}
      >
        <Stack flexDirection={"row"} alignItems="center" padding={0.5}>
          <Button
            sx={{ border: "none", color: "rgba(0, 0, 0, 0.87)" }}
            onClick={() => {
              //commit the changes to the cell and close the popover
              updateCell(selectedColor);
              handleClose();
            }}
          >
            use custom
          </Button>
          <input
            ref={colorInput}
            type="color"
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value);
            }}
          />
        </Stack>
        <Divider light />
        <Stack flexDirection="column" padding={1}>
          <Typography variant="button" display="block" gutterBottom>
            Standard Colors
          </Typography>
          <Stack flexDirection="row" flexWrap="wrap" width={200}>
            {standardColors.map((item, index) => {
              return (
                <ColorCircle
                  key={index}
                  onClick={() => {
                    //commit the changes to the cell and close the popover
                    updateCell(item);
                    handleClose();
                  }}
                  color={item}
                />
              );
            })}
          </Stack>
        </Stack>
        <Divider light />

        <Stack flexDirection="column" padding={1}>
          <Typography variant="button" display="block" gutterBottom>
            Plenty of Colors
          </Typography>
          <Stack flexDirection="row" flexWrap="wrap" width={200}>
            {allColors.map((item, index) => {
              return (
                <ColorCircle
                  key={index}
                  onClick={() => {
                    //commit the changes to the cell and close the popover
                    updateCell(item);
                    handleClose();
                  }}
                  color={item}
                />
              );
            })}
          </Stack>
        </Stack>
      </Popover>
    </div>
  );
}
