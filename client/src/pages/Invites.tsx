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
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";

import { formatDate } from "../helpers";

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

function InviteMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "invite-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="invite-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => console.log("ola")}>
          <ListItemIcon>
            {/* <PeopleAltOutlinedIcon fontSize="medium" /> */}
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={() => console.log("ola")}>
          <ListItemIcon>
            {/* <DriveFileRenameOutlineIcon fontSize="medium" />*/}
          </ListItemIcon>
          Rename
        </MenuItem>
      </Menu>
    </div>
  );
}
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
          path {selectedInvite.path} already exists on your ship, if you
          accept this invite you'll override your version
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
  onInviteReject = null,
  onInviteCancel = null,
}) {
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
          {status}
        </Grid>

        <Grid item xs={2}>
          {direction === "incoming" ? (
            <>
              <Button
                color="success"
                onClick={() => onInviteAccept(id, true, path)}
              >
                accept
              </Button>
              <Button color="error" onClick={() => onInviteReject(id)}>
                refuse
              </Button>
            </>
          ) : (
            <Button color="error" onClick={() => onInviteCancel(id)}>
              cancel
            </Button>
          )}
        </Grid>
      </Grid>
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
  const onInviteAccept = async (id, validatePath: true, path) => {
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
      const result = await api.acceptInvite(id);
      console.log("onInviteAccept result => ", result);
      handleDialogClose();
    } catch (e) {
      console.log("onInviteAccept error => ", e);
      if (e === "path already exists") {
        console.log("here");
        setDialogOpen(true);
        setSelectedInvite({ id, path });
      }
    }
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

  const invitesHeaderGrid = () => {
    return (
      <>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            ship
          </Grid>
          <Grid item xs={2}>
            sheet name
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
                onInviteReject={onInviteReject}
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
