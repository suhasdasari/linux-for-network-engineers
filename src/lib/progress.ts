import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  done: Record<string, boolean>;
  mark: (slug: string) => void;
  toggle: (slug: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      done: {},
      mark: (slug) => {
        if (get().done[slug]) return;
        set({ done: { ...get().done, [slug]: true } });
      },
      toggle: (slug) =>
        set({ done: { ...get().done, [slug]: !get().done[slug] } }),
      reset: () => set({ done: {} }),
    }),
    { name: "lfne-progress" },
  ),
);
