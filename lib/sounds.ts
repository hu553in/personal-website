import { bind, setEnabled, setVolume } from "cuelume";

// Stay silent until the saved preference is restored by SoundToggle.
setEnabled(false);
setVolume(0.2);

const storageKey = "interface-sounds";
let enabled = false;
const listeners = new Set<() => void>();

const updateEnabled = (value: boolean) => {
  enabled = value;
  setEnabled(value);
  for (const listener of listeners) {
    listener();
  }
};

const restorePreference = () => {
  try {
    updateEnabled(window.localStorage.getItem(storageKey) === "true");
  } catch {
    // Keep the in-memory preference when browser storage is blocked.
  }
};

const subscribeToSounds = (listener: () => void) => {
  listeners.add(listener);
  bind();
  restorePreference();
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      restorePreference();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

const getSoundsEnabled = () => enabled;
const getServerSoundsEnabled = () => false;
const setSoundsEnabled = (value: boolean) => {
  updateEnabled(value);
  try {
    window.localStorage.setItem(storageKey, String(value));
  } catch {
    // Sound still works for this visit without persistent storage.
  }
};

export { play } from "cuelume";
export {
  getServerSoundsEnabled,
  getSoundsEnabled,
  setSoundsEnabled,
  subscribeToSounds,
};
