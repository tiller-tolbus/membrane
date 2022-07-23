import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Sheet, Home, Invites } from "./pages";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { purple, green } from "@mui/material/colors";

declare module "@mui/material/styles" {
  interface Theme {
    status: {
      main: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      main?: string;
    };
  }
}
//example of themeing
//to explore later
const theme = createTheme({
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: green[500],
    },
  },
});
function App() {
  return (
    <Router>
      {/* A <Routes > looks through its children <Route>s and
        renders the first one that matches the current URL. */}
      <Routes>
        <Route path="/apps/membrane" element={<Home />} />
        <Route path="/apps/membrane/sheet/*" element={<Sheet />} />
        <Route path="/apps/membrane/invites" element={<Invites />} />
      </Routes>
    </Router>
  );
}

export default App;
