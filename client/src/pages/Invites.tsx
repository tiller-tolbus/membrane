import React, { useState, useEffect, useRef } from "react";

import api from "../api";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";

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
function InviteActionDialog({
  open,
  handleClose,
  onInviteReject,
  onInviteAccept,
}) {
  return (
    <Dialog fullWidth maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogTitle>Invite Action</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Accept or decline "Membrane business" from{" "}
          {shipName("~randes-losrep")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onInviteReject}>Decline</Button>
        <Button onClick={onInviteAccept}>Accept</Button>
      </DialogActions>
    </Dialog>
  );
}
function InviteItem({ ship, title, path, direction, onClick, id }) {
  return (
    <Item variant="outlined" onClick={() => onClick(id)}>
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
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedInvite, setSelectedInvite] = React.useState(null);
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedInvite(null);
  };
  const onInviteAccept = async () => {
    try {
      const result = await api.acceptInvite(selectedInvite);
      console.log("onInviteAccept result => ", result);
    } catch (e) {
      console.log("onInviteAccept error => ", e);
    }
    handleDialogClose();
  };
  const onInviteReject = () => {
    handleDialogClose();
  };
  const onInviteCancel = () => {
    handleDialogClose();
  };
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  console.log("selectedInvite",selectedInvite)

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
            return (
              <InviteItem
                key={index}
                title={what}
                ship={who}
                path={where}
                id={item[0]}
                direction={"incoming"}
                onClick={(id) => {
                  setSelectedInvite(id);
                  setDialogOpen(true);
                }}
              />
            );
          })}
        </TabPanel>
        <TabPanel value="2">
          {outgoing.map((item, index) => {
            const { what, who, where } = item[1];
            return (
              <InviteItem
                key={index}
                title={what}
                ship={who}
                path={where}
                id={item[0]}
                direction={"outgoing"}
                onClick={(id) => {
                  setSelectedInvite(id);
                  setDialogOpen(true);
                }}
              />
            );
          })}
        </TabPanel>
      </TabContext>
      <InviteActionDialog
        handleClose={handleDialogClose}
        open={dialogOpen}
        onInviteAccept={onInviteAccept}
        onInviteReject={onInviteReject}
      />
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
