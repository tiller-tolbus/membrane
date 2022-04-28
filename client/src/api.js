import memoize from "lodash/memoize";
import Urbit from "@urbit/http-api";

const api = {
  createApi: memoize(() => {
    /*
   Connect to urbit and return the urbit instance
  */
    //when we release should just call new Urbit("")
    const urb = new Urbit("http://localhost:80", "lidlut-tabwed-pillex-ridrup");
    urb.ship = window.ship;
    // Just log errors if we get any
    urb.onError = (message) => console.log(message);
    //doesn't work for some reason
    urb.onOpen = () => console.log("opened an urbit");
    urb.onRetry = () => console.log("re-trying to connect to urbit");
    //not sure this is needed in release build
    urb.connect();

    return urb;
  }),
  getSpreadsheetData: async () => {
    return api.createApi().scry({ app: "cell", path: "/pull" });
  },
  pokeTest: async () => {
    return api.createApi().poke({
      app: "cell",
      mark: "sheet",
      json: "test",
      onSuccess: () => console.log("hoon"),
      onError: () => console.log("doom"),
    });
  },
};
export default api;
