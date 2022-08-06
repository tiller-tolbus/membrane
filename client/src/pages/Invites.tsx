import React, { useState, useEffect } from "react";

import api from "../api";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import { formatDate } from "../helpers";
import { GoBackButton } from "../components";
import { LoadingButton } from "@mui/lab";

const Item = styled(Paper)(({ theme }) => ({
  transition: theme.transitions.create(["background", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  borderRadius: 10, //todo: start building our theme
  marginBottom: theme.spacing(2),
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
  onInviteAccept,
  selectedInvite,
}) {
  if (!selectedInvite) return null;
  return (
    <Dialog fullWidth maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogTitle>Path conflict</DialogTitle>
      <DialogContent>
        <DialogContentText>
          path {selectedInvite.path} already exists on your ship, if you accept
          this invite you'll override your version
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>cancel</Button>
        <Button onClick={() => onInviteAccept(selectedInvite.id, false)}>
          confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
function InviteItem({
  ship,
  title,
  path,
  direction,
  date,
  status,
  id,
  onInviteAccept = null,
  onInviteDecline = null,
  onInviteCancel = null,
  loading,
}) {
  /*
  ::  a status indicates one of five things
  ::  invited: appeal has been sent but not acknowledged
  ::  waiting: appeal has been sent and acknowledged
  ::  canceled: appeal was canceled by sender
  ::  declined: appeal was declined by receiver
  ::  accepted: appeal has been approved and rsvp sent; awaiting package
  ::  sent: package has been sent but not acknowledged
  ::  received: package has been sent and acknowledged
  */
  const actions = (status = "", direction, loading) => {
    if (direction === "incoming") {
      if (status === "waiting") {
        return (
          <>
            <LoadingButton
              color="success"
              loading={loading.accept && loading.id === id}
              onClick={() => onInviteAccept(id, true, path)}
            >
              accept
            </LoadingButton>
            <LoadingButton
              loading={loading.decline && loading.id === id}
              color="error"
              onClick={() => onInviteDecline(id)}
            >
              decline
            </LoadingButton>
          </>
        );
      }
    } else {
      if (status === "waiting" || status === "invited") {
        return (
          <LoadingButton
            loading={loading.cancel && loading.id === id}
            color="error"
            onClick={() => onInviteCancel(id)}
          >
            cancel
          </LoadingButton>
        );
      }
    }

    return <div style={{ height: 36.5 }}></div>;
  };
  const styleStatus = (status = "") => {
    if (status === "received") {
      return (
        <Typography variant="subtitle2" color="success.main">
          {status}
        </Typography>
      );
    } else if (status === "canceled" || status === "declined") {
      return (
        <Typography variant="subtitle2" color="error">
          {status}
        </Typography>
      );
    } else {
      //all the pending ones go here
      return (
        <Typography variant="subtitle2" color="warning.main">
          {status}
        </Typography>
      );
    }
  };
  return (
    <Item variant="outlined">
      <Grid container alignItems="center">
        <Grid item xs={2}>
          {shipName(ship)}
        </Grid>
        <Grid item xs={2}>
          {title}
        </Grid>
        <Grid item xs={2}>
          {path}
        </Grid>
        <Grid item xs={2}>
          {formatDate(date)}
        </Grid>
        <Grid item xs={2}>
          {styleStatus(status)}
        </Grid>

        <Grid item xs={2}>
          {actions(status, direction, loading)}
        </Grid>
      </Grid>
    </Item>
  );
}
function LabTabs({ incoming, outgoing, setIncoming, setOutgoing }) {
  const [value, setValue] = React.useState("1");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedInvite, setSelectedInvite] = React.useState(null);
  const [loading, setLoading] = React.useState({
    accept: false,
    decline: false,
    cancel: false,
    id: null,
  });

  const onInviteItemUpdate = (id: string, newStatus: string) => {
    //todo: merge these and only filter while displaying in tabs

    const newOutgoing = outgoing.map((item) => {
      if (item[0] === id) {
        return [item[0], { ...item[1], why: newStatus }];
      }
      return item;
    });
    const newIncoming = incoming.map((item) => {
      if (item[0] === id) {
        return [item[0], { ...item[1], why: newStatus }];
      }
      return item;
    });
    setIncoming(newIncoming);
    setOutgoing(newOutgoing);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedInvite(null);
  };
  const onInviteAccept = async (
    id: string,
    validatePath: true,
    path: string,
    direction: string
  ) => {
    try {
      if (validatePath) {
        //check if this user already has a sheet at the target path,
        const pathExists = await api.getAllPaths(path);
        if (pathExists && pathExists.length > 0) {
          //path already exists does display a dialog for the user to make a decision

          throw "path already exists";
        }
        console.log("pathExists", pathExists);
      }
      setLoading({
        accept: true,
        decline: false,
        cancel: false,
        id,
      });
      const result = await api.acceptInvite(id);
      console.log("onInviteAccept result => ", result);
      if (result) {
        onInviteItemUpdate(id, "accepted");
      }
      setLoading({
        accept: false,
        decline: false,
        cancel: false,
        id: null,
      });
      handleDialogClose();
    } catch (e) {
      console.log("onInviteAccept error => ", e);
      if (e === "path already exists") {
        setDialogOpen(true);
        setSelectedInvite({ id, path });
      }
      setLoading({
        accept: false,
        decline: false,
        cancel: false,
        id: null,
      });
    }
  };
  const onInviteDecline = async (id: string, direction: string) => {
    try {
      setLoading({
        accept: false,
        decline: true,
        cancel: false,
        id,
      });
      const result = await api.declineInvite(id);
      console.log("onInviteDecline result => ", result);
      if (result) {
        onInviteItemUpdate(id, "declined");
      }
      setLoading({
        accept: false,
        decline: false,
        cancel: false,
        id: null,
      });
    } catch (e) {
      console.log("onInviteDecline error => ", e);
      setLoading({
        accept: false,
        decline: false,
        cancel: false,
        id: null,
      });
    }
  };
  const onInviteCancel = async (id: string, direction: string) => {
    try {
      setLoading({
        accept: false,
        decline: false,
        cancel: true,
        id,
      });
      const result = await api.cancelInvite(id);
      if (result) {
        onInviteItemUpdate(id, "canceled");
      }
      console.log("onInviteCancel result => ", result);
      setLoading({
        accept: false,
        decline: false,
        cancel: false,
        id: null,
      });
    } catch (e) {
      console.log("onInviteCancel error => ", e);

      setLoading({
        accept: false,
        decline: false,
        cancel: false,
        id: null,
      });
    }
  };
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const invitesHeaderGrid = () => {
    return (
      <>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            ship
          </Grid>
          <Grid item xs={2}>
            title
          </Grid>
          <Grid item xs={2}>
            path
          </Grid>
          <Grid item xs={2}>
            date
          </Grid>
          <Grid item xs={2}>
            status
          </Grid>

          <Grid item xs={2}>
            actions
          </Grid>
        </Grid>
        <Divider light sx={{ marginBottom: 1, marginTop: 1 }} />
      </>
    );
  };

  return (
    <Box>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Incoming" value="1" />
            <Tab label="Outgoing" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          {invitesHeaderGrid()}
          {incoming.map((item, index) => {
            const { what, who, where, when, why } = item[1];
            return (
              <InviteItem
                key={index}
                title={what}
                ship={who}
                path={where}
                date={when}
                status={why}
                id={item[0]}
                direction={"incoming"}
                onInviteAccept={onInviteAccept}
                onInviteDecline={onInviteDecline}
                loading={loading}
              />
            );
          })}
        </TabPanel>
        <TabPanel value="2">
          {invitesHeaderGrid()}
          {outgoing.map((item, index) => {
            const { what, who, where, when, why } = item[1];
            return (
              <InviteItem
                key={index}
                title={what}
                ship={who}
                path={where}
                date={when}
                status={why}
                id={item[0]}
                direction={"outgoing"}
                onInviteCancel={onInviteCancel}
                loading={loading}
              />
            );
          })}
        </TabPanel>
      </TabContext>
      <InviteActionDialog
        handleClose={handleDialogClose}
        open={dialogOpen}
        onInviteAccept={onInviteAccept}
        selectedInvite={selectedInvite}
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
      console.log("getInvites result => ", invites);

      setOutgoing(outgoing);
      setIncoming(incoming);
    } catch (e) {
      console.log("getInvites error =>", e);
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
        <LabTabs
          outgoing={outgoing}
          incoming={incoming}
          setIncoming={setIncoming}
          setOutgoing={setOutgoing}
        />
      </Container>
    </>
  );
}
