import create, { State } from "zustand";

interface Store extends State {
  rows: Array<any>;
  setRows: (rows: Array<any>) => void;
}

const useStore = create<Store>((set, get) => ({
  rows: [],
  setRows: (rows) => set(() => ({ rows })),
}));

export default useStore;
