"use client";

import { useMemo, useState } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-webgl2";

const RIVE_SRC = "/rive/apart-testweb.riv";

type TimelineTest = {
  label: string;
  candidates: string[];
};

const timelineTests: TimelineTest[] = [
  { label: "idle", candidates: ["idle"] },
  { label: "walk", candidates: ["walk"] },
  { label: "wave", candidates: ["wave"] },
  { label: "jump", candidates: ["jump"] },
  { label: "sixseven", candidates: ["sixseven", "67"] }
];

export function RiveTimelineTester() {
  const [status, setStatus] = useState("Loading /rive/apart-testweb.riv ...");
  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const layout = useMemo(() => new Layout({ fit: Fit.Contain, alignment: Alignment.Center }), []);

  const { RiveComponent, rive } = useRive({
    src: RIVE_SRC,
    animations: "idle",
    autoplay: true,
    layout,
    onLoad: () => {
      setStatus("Loaded. Reading Timeline animations...");
    },
    onLoadError: (error) => {
      setStatus("Failed to load Rive file.");
      setLastError(error instanceof Error ? error.message : String(error));
    },
    onRiveReady: (readyRive) => {
      const names = readyRive.animationNames ?? [];
      setAnimationNames(names);
      setActiveAnimation(names.includes("idle") ? "idle" : names[0] ?? null);
      setStatus(`Ready. Found ${names.length} Timeline animation(s).`);
    }
  });

  const playTimeline = (test: TimelineTest) => {
    if (!rive) {
      setLastError("Rive instance is not ready yet.");
      return;
    }

    const names = rive.animationNames ?? animationNames;
    const timelineName = test.candidates.find((candidate) => names.includes(candidate)) ?? test.candidates[0];

    try {
      rive.stop();
      rive.play(timelineName, true);
      setActiveAnimation(timelineName);
      setStatus(`Playing Timeline: ${timelineName}`);
      setLastError(
        names.includes(timelineName)
          ? null
          : `Tried "${timelineName}", but it was not found in animationNames. Available: ${names.join(", ") || "(none)"}`
      );
    } catch (error) {
      setLastError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <section className="rive-test-shell">
      <div className="rive-test-header">
        <div>
          <p>Rive Timeline Test</p>
          <h1>apart-testweb.riv</h1>
          <span>src: {RIVE_SRC}</span>
        </div>
        <strong>{activeAnimation ? `Now: ${activeAnimation}` : "No animation"}</strong>
      </div>

      <div className="rive-test-stage">
        <RiveComponent className="rive-test-canvas" />
      </div>

      <div className="rive-test-controls" aria-label="Timeline controls">
        {timelineTests.map((test) => (
          <button
            key={test.label}
            type="button"
            className={test.candidates.includes(activeAnimation ?? "") ? "active" : ""}
            onClick={() => playTimeline(test)}
          >
            {test.label}
            {test.label === "sixseven" ? <span>fallback: 67</span> : null}
          </button>
        ))}
      </div>

      <div className="rive-test-panel">
        <strong>Status</strong>
        <p>{status}</p>
        {lastError ? <p className="rive-test-error">{lastError}</p> : null}
      </div>

      <div className="rive-test-panel">
        <strong>Detected animationNames</strong>
        {animationNames.length > 0 ? (
          <ul>
            {animationNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p>No Timeline animation names detected yet.</p>
        )}
      </div>
    </section>
  );
}

export default RiveTimelineTester;
