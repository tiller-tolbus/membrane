import * as React from "react";

import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";

const StyledRoundButton = styled(IconButton)(({ theme }) => ({
  border: "1px solid #B3B3B3",
  width: 40,
  height: 40,
  borderRadius: 10,
  color: theme.palette.text.primary,

  marginLeft: theme.spacing(1),
}));

export default StyledRoundButton;
