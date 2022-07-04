import create, { State } from "zustand";

interface Store extends State {
  rows: Array<any>;
  setRows: (rows: Array<any>) => void;

  columns: Array<any>;
  setColumns: (columns) => void;

  selectedCell: any;//todo: make a structure
  setSelectedCell: (selectedCell) => void;
}

const useStore = create<Store>((set, get) => ({
  rows: [],
  setRows: (rows) => set(() => ({ rows })),

  columns: [],
  setColumns: (columns) => set(() => ({ columns })),

  selectedCell: {},
  setSelectedCell: (selectedCell) => set(() => ({ selectedCell })),
}));

export default useStore;
