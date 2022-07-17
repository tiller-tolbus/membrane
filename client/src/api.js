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
    const urb = isDev()
      ? new Urbit("http://localhost:80", "lidlut-tabwed-pillex-ridrup")
      : new Urbit("");
    urb.ship = isDev() ? "zod" : window.ship; //this shoud be winodw.ship in release
    // Just log errors if we get any
    urb.onError = (message) => console.log("onError: ", message);
    urb.onOpen = () => console.log("urbit onOpen");
    urb.onRetry = () => console.log("urbit onRetry");
    //not sure this is needed in release build
    urb.connect();

    return urb;
  }),
  getSpreadsheetData: async () => {
    return api.createApi().scry({ app: "membrane", path: "/pull" });
  },
  putSpreadSheetData: async (uneditedSheetMeta) => {
    //get data from our zustand store
    const rows = useStore.getState().rows;
    //transform the data into something the back end expects
    const json = dataToJson2(rows, uneditedSheetMeta);

    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { replace: json },
    });
  },
  getSheetByPath: async (path) => {
    return api.createApi().scry({ app: "membrane", path: "/retrieve" + path });
  },
  getAllPaths: async () => {
    return api.createApi().scry({ app: "membrane", path: "/tree" });
  },
  getAllSheetMeta: async () => {
    return api.createApi().scry({ app: "membrane", path: "/metatree" });
  },
  createSheet: async (path, title) => {
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { create: [title, path] },
    });
  },
  deleteSheet: async (path) => {
    console.log("path", path);
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { delete: [path] },
    });
  },
  renameSheet: async (path, title) => {
    console.log("path", path);
    console.log("title", title);
    return api.createApi().poke({
      app: "membrane",
      mark: "membrane-action",
      json: { rename: [title, path] },
    });
  },
};
export default api;
