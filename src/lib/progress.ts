import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  done: Record<string, boolean>;
  userId: string | null;
  hydrate: (userId: string, done: Record<string, boolean>) => void;
  mark: (slug: string) => void;
  toggle: (slug: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      done: {},
      userId: null,
      hydrate: (userId, done) => set({ userId, done }),
      mark: (slug) => {
        if (get().done[slug]) return;
        set({ done: { ...get().done, [slug]: true } });
      },
      toggle: (slug) =>
        set({ done: { ...get().done, [slug]: !get().done[slug] } }),
      reset: () => set({ done: {}, userId: null }),
    }),
    { name: "lfne-progress", partialize: (s) => ({ done: s.done, userId: s.userId }) },
  ),
);
