import * as React from "react";
import api from "../../api";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import RenameDialog from "./dialog/RenameDialog";
import DeleteDialog from "./dialog/DeleteDialog";
import ShareDialog from "./dialog/ShareDialog";
import EditTagsDialog from "./dialog/EditTagsDialog";
import MoveDialog from "./dialog/MoveDialog";

export default function SheetMenu({
  sheetId,
  path,
  title,
  pathList,
  sheetList,
  tags,
  updateSheetList,
  updatePathList,
}) {
  const [updatingTags, setUpdatingTags] = React.useState({
    trying: false,
    success: false,
    error: false,
  });
  const [deletingSheet, setDeletingSheets] = React.useState({
    trying: false,
    success: false,
    error: false,
  });
  const [renamingSheet, setRenamingSheet] = React.useState({
    trying: false,
    success: false,
    error: false,
  });
  const [movingSheet, setMovingSheet] = React.useState({
    trying: false,
    success: false,
    error: false,
  });
  const onShare = async (ship: string) => {
    try {
      const result = await api.shareSheet(ship, path);
      //TODO: add status tracking (trying/succ...)
      console.log("onShare result => ", result);
    } catch (e) {
      console.log("onShare error => ", e);
    }
    return;
  };
  const onDelete = async (path: string) => {
    setDeletingSheets({ trying: true, success: false, error: false });
    try {
      const result = await api.deleteSheet(path);
      console.log("onDelete result => ", result);
      if (result) {
        //remove sheet we just deleted from sheetList
        const newSheetList = sheetList.filter((item) => {
          return item.path !== path;
        });
        //remove path of sheet we just deleted from pathList
        const newPathList = pathList.filter((item) => {
          return item !== path;
        });

        updatePathList(newPathList);
        updateSheetList(newSheetList);
        onDeleteDialogClose();
        setDeletingSheets({ trying: false, success: true, error: false });
      } else {
        setDeletingSheets({ trying: false, success: false, error: true });
      }
    } catch (e) {
      console.log("onDelete error => ", e);
      setDeletingSheets({ trying: false, success: false, error: true });
    }
  };
  const onRename = async (title: string, path: number) => {
    setRenamingSheet({ trying: true, success: false, error: false });
    try {
      const result = await api.renameSheet(path, title);
      console.log("onRename result => ", result);
      if (result) {
        //update title in the sheet we just renamed
        const newSheetList = sheetList.map((item) => {
          if (item.path === path) {
            return {
              ...item,
              title: title,
            };
          }
          return item;
        });

        updateSheetList(newSheetList);
        onRenameDialogClose();
        setRenamingSheet({ trying: false, success: true, error: false });
      } else {
        setRenamingSheet({ trying: false, success: false, error: true });
      }
    } catch (e) {
      console.log("onRename error => ", e);
      setRenamingSheet({ trying: false, success: false, error: true });
    }
  };
  const onMove = async (path: string, destinationPath: string) => {
    console.log("path", path);
    console.log("destinationPath", destinationPath);
    setMovingSheet({ trying: true, success: false, error: false });

    try {
      const result = await api.moveSheet(path, destinationPath);
      console.log("onMove result => ", result);

      if (result) {
        //update path in the sheet we just moved
        const newSheetList = sheetList.map((item) => {
          if (item.path === path) {
            return {
              ...item,
              path: destinationPath,
            };
          }
          return item;
        });
        //replace path we just moved with destinaiton path in pathList
        const newPathList = pathList.map((item) => {
          if (item === path) {
            return destinationPath;
          }
          return item;
        });
        updatePathList(newPathList);
        updateSheetList(newSheetList);
        onMoveDialogClose();
        setMovingSheet({ trying: false, success: true, error: false });
      } else {
        setMovingSheet({ trying: false, success: false, error: true });
      }
    } catch (e) {
      console.log("onMove error => ", e);
      setMovingSheet({ trying: false, success: false, error: true });
    }
  };

  const onUpdateTags = async (path: string, tags: Array<string>) => {
    setUpdatingTags({ trying: true, success: false, error: false });
    try {
      const result = await api.updateTags(path, tags);
      console.log("onUpdateTags result => ", result);

      if (result) {
        const newSheetList = sheetList.map((item) => {
          if (item.path === path) {
            //update tags in the sheet we just updated
            return {
              ...item,
              tags: tags.map((item, index) => {
                //remake the tag list
                return { label: item, key: index };
              }),
            };
          }
          return item;
        });
        updateSheetList(newSheetList);
        onEditTagsDialogClose();
        setUpdatingTags({ trying: false, success: true, error: false });
      } else {
        setUpdatingTags({ trying: false, success: false, error: true });
      }
    } catch (e) {
      setUpdatingTags({ trying: false, success: false, error: true });
      console.log("onUpdateTags error => ", e);
    }
  };
  //TODO: there should be one instance of the dialogs,in the parent component, not for every sheet item
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
  const onRenameDialogUpdate = (newTitle: string) => {
    onRename(newTitle, path);
  };
  const onDeleteDialogUpdate = () => {
    onDelete(path);
  };
  const [shareDialogOpen, setShareDialogOpen] = React.useState<boolean>(false);
  const onShareDialogClose = () => {
    setShareDialogOpen(false);
  };
  const onShareDialogOpen = () => {
    setShareDialogOpen(true);
  };
  const onShareDialogUpdate = (ship: string) => {
    onShare(ship);
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
    onUpdateTags(path, tags);
  };
  const [moveDialogOpen, setMoveDialogOpen] = React.useState<boolean>(false);
  const onMoveDialogClose = () => {
    setMoveDialogOpen(false);
  };
  const onMoveDialogOpen = () => {
    setMoveDialogOpen(true);
  };
  const onMoveDialogUpdate = (destinationPath: string) => {
    onMove(path, destinationPath);
  };

  return (
    <React.Fragment>
      <IconButton
        onClick={handleClick}
        size="medium"
        sx={{ ml: 2 }}
        aria-controls={open ? "sheet-menu" : undefined}
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
        <MenuItem onClick={() => onShareDialogOpen()}>
          <ListItemIcon>
            <PeopleAltOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={() => onRenameDialogOpen()}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="medium" />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem onClick={() => onEditTagsDialogOpen()}>
          <ListItemIcon>
            <LocalOfferOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Edit Tags
        </MenuItem>
        <MenuItem onClick={() => onMoveDialogOpen()}>
          <ListItemIcon>
            <DriveFileMoveOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Move sheet
        </MenuItem>
        <MenuItem onClick={() => onDeleteDialogOpen()}>
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      <RenameDialog
        open={renameDialogOpen}
        onConfirm={onRenameDialogUpdate}
        onClose={onRenameDialogClose}
        title={title}
        loading={renamingSheet.trying}
      />
      <DeleteDialog
        open={deletDialogOpen}
        onConfirm={onDeleteDialogUpdate}
        onClose={onDeleteDialogClose}
        path={path}
        title={title}
        loading={deletingSheet.trying}
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
        tags={tags}
        loading={updatingTags.trying}
      />
      <MoveDialog
        open={moveDialogOpen}
        onConfirm={onMoveDialogUpdate}
        onClose={onMoveDialogClose}
        path={path}
        pathList={pathList}
        loading={movingSheet.trying}
      />
    </React.Fragment>
  );
}
