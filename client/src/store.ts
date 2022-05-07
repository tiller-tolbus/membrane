import create, { State } from "zustand";

interface Store extends State {
  rows: Array<any>;
  setRows: (rows: Array<any>) => void;

  columns: Array<any>;
  setColumns: (columns) => void;
}

const useStore = create<Store>((set, get) => ({
  rows: [],
  setRows: (rows) => set(() => ({ rows })),

  columns: [],
  setColumns: (columns) => set(() => ({ columns })),
}));

export default useStore;
