import create, { State } from "zustand";

interface Store extends State {
  bears: number;
  otters: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

const useStore = create<Store>((set, get) => ({
  bears: 0,
  otters: 12,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));

export default useStore;
