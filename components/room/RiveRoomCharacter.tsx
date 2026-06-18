"use client";

import { useEffect, useMemo, useRef } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-webgl2";

const RIVE_SRC = "/rive/apart-testweb.riv";

export type RoomCharacterAnimation = "idle" | "walk" | "jump" | "sixseven";

interface RiveRoomCharacterProps {
  x: number;
  y: number;
  animation: RoomCharacterAnimation;
  animationKey?: number;
  label?: string;
  onMoveEnd?: () => void;
}

export function RiveRoomCharacter({ x, y, animation, animationKey = 0, label, onMoveEnd }: RiveRoomCharacterProps) {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeAnimationRef = useRef<string | null>(null);
  const activeAnimationKeyRef = useRef<number | null>(null);
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
      shouldUseIntersectionObserver: false,
      shouldResizeCanvasToContainer: false
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
      }

      frameId = window.requestAnimationFrame(renderTransparentFrame);
    };

    renderTransparentFrame();

    return () => window.cancelAnimationFrame(frameId);
  }, [canvas]);

  useEffect(() => {
    if (!rive) return;

    const names = rive.animationNames ?? [];
    const candidates = animation === "sixseven" ? ["sixseven", "67"] : [animation];
    const nextAnimation = candidates.find((candidate) => names.includes(candidate)) ?? "idle";
    if (activeAnimationRef.current === nextAnimation && activeAnimationKeyRef.current === animationKey) return;

    rive.stop(rive.animationNames);
    rive.play(nextAnimation, true);
    activeAnimationRef.current = nextAnimation;
    activeAnimationKeyRef.current = animationKey;
  }, [animation, animationKey, rive]);

  return (
    <div
      className={`room-rive-character ${animation === "walk" ? "is-walking" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (animation === "walk" && event.propertyName === "left") onMoveEnd?.();
      }}
      aria-label={label ?? "idle lion character"}
    >
      <RiveComponent className="room-rive-source" width={512} height={512} />
      <canvas ref={displayCanvasRef} className="room-rive-canvas" aria-hidden="true" />
      {label ? <strong>{label}</strong> : null}
    </div>
  );
}
