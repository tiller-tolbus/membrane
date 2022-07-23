import React from "react";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
export default function GoBackButton() {
  let navigate = useNavigate();

  return (
    <Button
      size={"small"}
      startIcon={<ArrowBackIcon />}
      sx={{ border: "none", color: "black", width: 100 }}
      onClick={() => {
        navigate("/apps/membrane");
      }}
    >
      go back
    </Button>
  );
}
