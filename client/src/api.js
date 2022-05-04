import memoize from "lodash/memoize";
import Urbit from "@urbit/http-api";
import useStore from "./store";
import { dataToJson } from "./components/grid/helpers";

const api = {
  createApi: memoize(() => {
    /*
   Connect to urbit and return the urbit instance
  */
    //when we release should just call new Urbit("")
    const urb = new Urbit("http://localhost:80", "lidlut-tabwed-pillex-ridrup");
    urb.ship = "zod"; //this shoud be winodw.ship in release
    // Just log errors if we get any
    urb.onError = (message) => console.log(message);
    urb.onOpen = () => console.log("opened an urbit");
    urb.onRetry = () => console.log("re-trying to connect to urbit");
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
      onSuccess: () => console.log("updated sheet succesfully"),
      onError: () => console.log("failed to update sheet"),
    });
  },
};
export default api;
