import memoize from "lodash/memoize";
import Urbit from "@urbit/http-api";
import useStore from "./store";
import { dataToJson2, isDev } from "./helpers";

const api = {
  createApi: memoize(() => {
    /*
    Connect to urbit and return the urbit instance
    returns urbit instance
  */
    //ropnys-batwyd-nossyt-mapwet => nec
    //lidlut-tabwed-pillex-ridrup => zod
    const urb = isDev()
      ? new Urbit("http://localhost:80", "lidlut-tabwed-pillex-ridrup")
      : new Urbit("");
    urb.ship = isDev() ? "zod" : window.ship;
    // Just log errors if we get any
    urb.onError = (message) => console.log("onError: ", message);
    urb.onOpen = () => console.log("urbit onOpen");
    urb.onRetry = () => console.log("urbit onRetry");
    //not sure this is needed in release build
    urb.connect();

    return urb;
  }),
  putSpreadSheetData: async (uneditedSheetMeta) => {
    //get data from our zustand store
    const rows = useStore.getState().rows;
    const columns = useStore.getState().columns;
    //transform the data into something the back end expects
    const json = dataToJson2(rows, columns, uneditedSheetMeta);

    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { write: [uneditedSheetMeta.path, json] },
    });
  },
  getSheetByPath: async (path) => {
    return api.createApi().scry({ app: "membrane", path: "/read" + path });
  },
  getAllPaths: async (path = "") => {
    return api.createApi().scry({ app: "membrane", path: "/tree" + path });
  },
  getAllSheetMeta: async () => {
    return api.createApi().scry({ app: "membrane", path: "/metatree" });
  },
  getPals: async () => {
    return api.createApi().scry({ app: "pals", path: "/json" });
  },
  createSheet: async (path, title) => {
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { create: [path, title] },
    });
  },
  deleteSheet: async (path) => {
    console.log("path", path);
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { delete: path },
    });
  },
  renameSheet: async (path, title) => {
    console.log("path", path);
    console.log("title", title);
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { rename: [path, title] },
    });
  },
  moveSheet: async (path, destinationPath) => {
    console.log("path", path);
    console.log("destinationPath", destinationPath);
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { move: [path, destinationPath] },
    });
  },
  updateTags: async (path, tags) => {
    console.log("path", path);
    console.log("tags", tags);
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { retag: [path, tags] },
    });
  },
  shareSheet: async (ship, pathToSheet) => {
    //send an inviate to a ship to recieve your sheet
    console.log("ship", ship);
    console.log("pathToSheet", pathToSheet);
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { "send-invite": [ship, pathToSheet] },
    });
  },
  getInvites: async () => {
    return api.createApi().scry({ app: "membrane", path: "/comms" });
  },
  acceptInvite: async (inviteId) => {
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { "send-rsvp": inviteId },
    });
  },
  acceptInvite: async (inviteId) => {
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { "send-rsvp": inviteId },
    });
  },
  cancelInvite: async (inviteId) => {
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { "cancel-invite": inviteId },
    });
  },
  declineInvite: async (inviteId) => {
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { "decline-invite": inviteId },
    });
  },
};
export default api;
