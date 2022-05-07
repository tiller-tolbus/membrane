import memoize from "lodash/memoize";
import Urbit from "@urbit/http-api";
import useStore from "./store";
import { dataToJson, isDev } from "./helpers";
console.log("isDev", isDev());
const api = {
  createApi: memoize(() => {
    /*
    Connect to urbit and return the urbit instance
    returns urbit instance
  */
    //when we release should just call new Urbit("")

    const urb = isDev()
      ? new Urbit("http://localhost:80", "lidlut-tabwed-pillex-ridrup")
      : new Urbit();
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
    return api.createApi().scry({ app: "cell", path: "/pull" });
  },
  putSpreadSheetData: async () => {
    //get data from our zustand store
    const rows = useStore.getState().rows;
    //transform the data into something the back end expects
    const json = dataToJson(rows);
    return api.createApi().poke({
      app: "cell",
      mark: "sheet",
      json: json,
    });
  },
};
export default api;
