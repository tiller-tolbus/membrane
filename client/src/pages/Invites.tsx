import React, { useState, useEffect, useRef } from "react";

import api from "../api";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { GoBackButton } from "../components";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { blue } from "@mui/material/colors";

const Item = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(["background", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.primary,
  "&:hover": { background: blue[100], cursor: "pointer" },
  margin: theme.spacing(1),
  borderRadius: 10, //todo: start building our theme
}));
function InviteItem({ ship, title, path, direction }) {
  const shipName = (ship) => {
    return (
      <span
        style={{
          color: "#1976d2",
          backgroundColor: blue[50],
          padding: 3,
          paddingLeft: 5,
          paddingRight: 5,
          borderRadius: 5,
        }}
      >
        {ship}
      </span>
    );
  };
  return (
    <Item variant="outlined">
      {direction === "incoming" ? (
        <Typography
          variant="body1"
          textAlign="center"
          gutterBottom
          component="div"
        >
          {shipName(ship)} has sent you sheet "{title}" at "{path}"
        </Typography>
      ) : (
        <Typography
          variant="body1"
          textAlign="center"
          gutterBottom
          component="div"
        >
          you sent {shipName(ship)} sheet "{title}" at "{path}"
        </Typography>
      )}
    </Item>
  );
}
function LabTabs({ incoming, outgoing }) {
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Incoming" value="1" />
            <Tab label="Outgoing" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          {incoming.map((item, index) => {
            const { what, who, where } = item[1];
            console.log("item[1]", item[1]);
            return (
              <InviteItem
                key={index}
                title={what}
                ship={who}
                path={where}
                direction={"incoming"}
              />
            );
          })}
        </TabPanel>
        <TabPanel value="2">
          {outgoing.map((item, index) => {
            const { what, who, where } = item[1];
            console.log("item[1]", item[1]);

            return (
              <InviteItem
                key={index}
                title={what}
                ship={who}
                path={where}
                direction={"outgoing"}
              />
            );
          })}
        </TabPanel>
      </TabContext>
    </Box>
  );
}
export default function Invites() {
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const getInvites = async () => {
    try {
      const invites = await api.getInvites();
      //convert these into something we can use
      const outgoing = Object.entries(invites.outbox);
      const incoming = Object.entries(invites.inbox);
      console.log("invites", invites);

      setOutgoing(outgoing);
      setIncoming(incoming);
    } catch (e) {
      console.log("e", e);
    }
  };
  useEffect(() => {
    getInvites();
  }, []);
  return (
    <>
      <Box
        sx={{
          paddingLeft: 1,
          paddingTop: 1,
          paddingBottom: 1,
          paddingRight: 2,
        }}
      >
        <GoBackButton />
      </Box>
      <Container>
        <Stack flexDirection="row">
          <Typography variant="h4" sx={{ paddingBottom: 2, marginLeft: 1 }}>
            Invites
          </Typography>
        </Stack>
        <LabTabs outgoing={outgoing} incoming={incoming} />
      </Container>
    </>
  );
}
