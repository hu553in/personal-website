"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { FaPause, FaPlay } from "react-icons/fa6";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribeToReducedMotion = (notify: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
// Render a static poster until the browser's motion preference is known.
const getServerReducedMotion = () => true;

const HeroMedia = () => {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const showPoster = reducedMotion || failed;
  const Icon = playing ? FaPause : FaPlay;
  const label = playing ? "Pause animation" : "Play animation";

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.paused) {
      try {
        await video.play();
      } catch {
        // Keep the poster and play control when the browser blocks playback.
        setPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  return (
    <div className="relative mb-8" style={{ viewTransitionName: "hero-media" }}>
      {showPoster ? (
        <Image
          alt=""
          className="h-auto w-full"
          height={464}
          loading="eager"
          sizes="(max-width: 640px) calc(100vw - 48px), 592px"
          src="/hero.webp"
          width={832}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            aria-hidden="true"
            autoPlay
            className="h-auto w-full"
            disablePictureInPicture
            disableRemotePlayback
            height={464}
            loop
            muted
            onClick={togglePlayback}
            onError={(event) => {
              if (event.target === event.currentTarget) {
                setFailed(true);
              }
            }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            playsInline
            poster="/hero.webp"
            preload="metadata"
            tabIndex={-1}
            width={832}
          >
            <source src="/hero.webm" type="video/webm" />
            <source
              onError={() => setFailed(true)}
              src="/hero.mp4"
              type="video/mp4"
            />
          </video>
          <button
            aria-label={label}
            className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-sm bg-black/70 text-white transition-colors hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={togglePlayback}
            title={label}
            type="button"
          >
            <Icon aria-hidden="true" className="size-3" />
          </button>
        </>
      )}
    </div>
  );
};
export { HeroMedia };
