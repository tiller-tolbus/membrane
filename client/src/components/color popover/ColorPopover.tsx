import React, { useState, useRef } from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

const colorArray = require("./colors.json");

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
      >
        <Stack flexDirection={"row"} alignItems="center" padding={0.5}>
          <Button
            sx={{ border: "none", color: "black" }}
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
        <Stack flexDirection="row" padding={1} flexWrap="wrap" width={200}>
          {colorArray.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  //commit the changes to the cell and close the popover
                  updateCell(item);
                  handleClose();
                }}
                style={{
                  backgroundColor: item,
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                  margin: 1,
                  border: ".2px solid lightgrey",
                  cursor: "pointer",
                }}
              ></div>
            );
          })}
        </Stack>
      </Popover>
    </div>
  );
}
