import * as React from "react";

import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RenameDialog from "./dialog/RenameDialog";
import DeleteDialog from "./dialog/DeleteDialog";
import ShareDialog from "./dialog/ShareDialog";
import EditTagsDialog from "./dialog/EditTagsDialog";

export default function SheetMenu({
  onRename,
  onDelete,
  onAdd,
  onShare,
  sheetId,
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [renameDialogOpen, setRenameDialogOpen] =
    React.useState<boolean>(false);
  const [deletDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    //stop parent click from triggeing
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };
  const onRenameDialogOpen = () => {
    setRenameDialogOpen(true);
  };
  const onRenameDialogClose = () => {
    setRenameDialogOpen(false);
  };

  const onDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  const onDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  const onRenameDialogUpdate = (value: string) => {
    console.log("value", value);
    console.log("sheetId", sheetId);
    onRename(value, sheetId);
    onRenameDialogClose();
  };
  const onDeleteDialogUpdate = () => {
    console.log("delete this one =>", sheetId);
    onDelete();
    onDeleteDialogClose();
  };
  const [shareDialogOpen, setShareDialogOpen] = React.useState<boolean>(false);
  const onShareDialogClose = () => {
    setShareDialogOpen(false);
  };
  const onShareDialogOpen = () => {
    setShareDialogOpen(true);
  };
  const onShareDialogUpdate = (user: string) => {
    onShare(sheetId, user);
    onShareDialogClose();
  };
  const [editTagsDialogOpen, setEditTagsDialogOpen] =
    React.useState<boolean>(false);
  const onEditTagsDialogClose = () => {
    setEditTagsDialogOpen(false);
  };
  const onEditTagsDialogOpen = () => {
    setEditTagsDialogOpen(true);
  };
  const onEditTagsDialogUpdate = (tags: []) => {
    onEditTagsDialogClose();
  };

  return (
    <React.Fragment>
      <IconButton
        onClick={handleClick}
        size="medium"
        sx={{ ml: 2 }}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVertIcon>M</MoreVertIcon>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
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
        <MenuItem onClick={() => onRenameDialogOpen()}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="medium" />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem onClick={() => onDeleteDialogOpen()}>
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Delete
        </MenuItem>
        <MenuItem onClick={() => onEditTagsDialogOpen()}>
          <ListItemIcon>
            <LocalOfferIcon fontSize="medium" />
          </ListItemIcon>
          Edit Tags
        </MenuItem>
        <MenuItem onClick={() => onShareDialogOpen()}>
          <ListItemIcon>
            <PeopleAltOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Share with ur @pals
        </MenuItem>
      </Menu>
      <RenameDialog
        open={renameDialogOpen}
        onConfirm={onRenameDialogUpdate}
        onClose={onRenameDialogClose}
      />
      <DeleteDialog
        open={deletDialogOpen}
        onConfirm={onDeleteDialogUpdate}
        onClose={onDeleteDialogClose}
      />
      <ShareDialog
        open={shareDialogOpen}
        onConfirm={onShareDialogUpdate}
        onClose={onShareDialogClose}
      />
      <EditTagsDialog
        open={editTagsDialogOpen}
        onConfirm={onEditTagsDialogUpdate}
        onClose={onEditTagsDialogClose}
      />
    </React.Fragment>
  );
}
