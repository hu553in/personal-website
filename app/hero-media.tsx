"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa6";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import heroPoster from "@/public/hero.webp";

const HeroVideo = ({ onError }: { onError: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
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
    <>
      <video
        ref={videoRef}
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 h-full w-full"
        style={{ opacity: frameReady ? 1 : 0 }}
        disablePictureInPicture
        disableRemotePlayback
        height={464}
        loop
        muted
        onClick={togglePlayback}
        onError={(event) => {
          if (event.target === event.currentTarget) {
            onError();
          }
        }}
        onLoadedData={() => setFrameReady(true)}
        onLoadStart={() => setFrameReady(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        playsInline
        poster="/hero.webp"
        preload="metadata"
        tabIndex={-1}
        width={832}
      >
        <source src="/hero.webm" type="video/webm" />
        <source onError={() => onError()} src="/hero.mp4" type="video/mp4" />
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
  );
};

const HeroMedia = () => {
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative mb-8" style={{ viewTransitionName: "hero-media" }}>
      <Image
        alt=""
        className="h-auto w-full"
        height={464}
        loading="eager"
        sizes="(max-width: 640px) calc(100vw - 48px), 592px"
        placeholder="blur"
        src={heroPoster}
        width={832}
      />
      {!reducedMotion && !failed && (
        <HeroVideo onError={() => setFailed(true)} />
      )}
    </div>
  );
};
export { HeroMedia };
