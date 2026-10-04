"use client";

import { useSyncExternalStore } from "react";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

import {
  getServerSoundsEnabled,
  getSoundsEnabled,
  play,
  setSoundsEnabled,
  subscribeToSounds,
} from "@/lib/sounds";

import { iconButtonClassName } from "./primitives";

const SoundToggle = () => {
  const enabled = useSyncExternalStore(
    subscribeToSounds,
    getSoundsEnabled,
    getServerSoundsEnabled
  );

  const toggle = () => {
    const nextEnabled = !enabled;
    setSoundsEnabled(nextEnabled);
    if (nextEnabled) {
      play("toggle");
    }
  };

  const Icon = enabled ? FaVolumeHigh : FaVolumeXmark;

  return (
    <button
      aria-label="interface sounds"
      aria-pressed={enabled}
      className={iconButtonClassName}
      onClick={toggle}
      title={enabled ? "mute sounds" : "enable sounds"}
      type="button"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
    </button>
  );
};

export { SoundToggle };
