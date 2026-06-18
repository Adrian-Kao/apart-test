"use client";

import { useEffect, useMemo, useRef } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-webgl2";

const RIVE_SRC = "/rive/apart-testweb.riv";

interface ChatRiveAvatarProps {
  animation: "idle" | "jump" | "wave";
  animationKey?: string;
  side: "own" | "partner";
}

export function ChatRiveAvatar({ animation, animationKey, side }: ChatRiveAvatarProps) {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeAnimationRef = useRef<string | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const layout = useMemo(() => new Layout({ fit: Fit.Contain, alignment: Alignment.Center }), []);
  const riveParams = useMemo(
    () => ({
      src: RIVE_SRC,
      animations: "idle",
      autoplay: true,
      layout
    }),
    [layout]
  );
  const riveOptions = useMemo(
    () => ({
      useOffscreenRenderer: false,
      shouldUseIntersectionObserver: false
    }),
    []
  );

  const { RiveComponent, canvas, rive } = useRive(riveParams, riveOptions);

  useEffect(() => {
    if (!canvas) return;
    canvas.style.background = "transparent";
    canvas.style.backgroundColor = "transparent";
  }, [canvas]);

  useEffect(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!canvas || !displayCanvas) return;

    const context = displayCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    let frameId = 0;

    const renderTransparentFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      if (width > 0 && height > 0) {
        if (displayCanvas.width !== width) displayCanvas.width = width;
        if (displayCanvas.height !== height) displayCanvas.height = height;

        try {
          context.clearRect(0, 0, width, height);
          context.drawImage(canvas, 0, 0, width, height);

          const image = context.getImageData(0, 0, width, height);
          const data = image.data;
          const baseR = data[0];
          const baseG = data[1];
          const baseB = data[2];
          const tolerance = 22;

          for (let index = 0; index < data.length; index += 4) {
            const diff =
              Math.abs(data[index] - baseR) + Math.abs(data[index + 1] - baseG) + Math.abs(data[index + 2] - baseB);

            if (diff <= tolerance) data[index + 3] = 0;
          }

          context.putImageData(image, 0, 0);
        } catch {
          context.clearRect(0, 0, width, height);
        }
      }

      frameId = window.requestAnimationFrame(renderTransparentFrame);
    };

    renderTransparentFrame();

    return () => window.cancelAnimationFrame(frameId);
  }, [canvas]);

  useEffect(() => {
    if (!rive) return;

    const names = rive.animationNames ?? [];
    const nextAnimation = names.includes(animation) ? animation : "idle";

    if (activeAnimationRef.current !== nextAnimation) {
      rive.stop(rive.animationNames);
      rive.play(nextAnimation, true);
      activeAnimationRef.current = nextAnimation;
    }

    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);

    if (nextAnimation !== "idle") {
      resetTimerRef.current = window.setTimeout(() => {
        rive.stop(rive.animationNames);
        rive.play("idle", true);
        activeAnimationRef.current = "idle";
      }, 1050);
    }

    return () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, [animation, animationKey, rive]);

  return (
    <div className={`chat-rive-avatar ${side}`} aria-label={`${side} lion avatar`}>
      <RiveComponent className="chat-rive-source" />
      <canvas ref={displayCanvasRef} className="chat-rive-canvas" aria-hidden="true" />
    </div>
  );
}
