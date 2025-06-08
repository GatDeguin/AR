import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { loadOpenCV, detectFrets } from "./vision/fretDetection.js";
import { usePoseCalibration } from "./hooks/usePoseCalibration.js";
import { createScaleOverlay } from "./overlays/scaleOverlay.js";
import { createChordOverlay } from "./overlays/chordOverlay.js";

const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];
const MAJOR_PATTERN = [0, 2, 4, 5, 7, 9, 11];
const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHORD_PATTERNS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
};

function noteNameToMidi(name) {
  const idx = KEYS.indexOf(name);
  return 60 + idx;
}

export default function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const fretGroupRef = useRef(null);
  const overlayRef = useRef(null);

  const [mode, setMode] = useState("scales");
  const [currentKey, setCurrentKey] = useState("C");
  const [chordType, setChordType] = useState("major");
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [tick, setTick] = useState(0);
  const [xrSupported, setXrSupported] = useState(false);

  const { poseMatrix4, calibrated, retry, error } = usePoseCalibration(videoRef);

  useEffect(() => {
    if (!videoRef.current) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      });
  }, []);

  useEffect(() => {
    if (navigator.xr) navigator.xr.isSessionSupported("immersive-ar").then(setXrSupported);
  }, []);

  useEffect(() => {
    if (!xrSupported) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.xr.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    const fretGroup = new THREE.Group();
    scene.add(fretGroup);
    fretGroupRef.current = fretGroup;

    const drawFrets = (frets) => {
      while (fretGroup.children.length) fretGroup.remove(fretGroup.children[0]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffa500 });
      frets.forEach((_, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.15, 0, -0.01 * i),
          new THREE.Vector3(0.15, 0, -0.01 * i),
        ]);
        fretGroup.add(new THREE.Line(geo, mat));
      });
      if (overlayRef.current) fretGroup.add(overlayRef.current.group);
    };

    renderer.setAnimationLoop(() => renderer.render(scene, camera));

    navigator.xr.requestSession("immersive-ar", { requiredFeatures: ["hit-test"] }).then((session) => {
      renderer.xr.setSession(session);
    });

    let stopVision = false;
    (async () => {
      await loadOpenCV();
      const interval = setInterval(() => {
        if (stopVision || !videoRef.current) return;
        try {
          const frets = detectFrets(videoRef.current);
          drawFrets(frets);
        } catch {}
      }, 1500);
      return () => clearInterval(interval);
    })();

    return () => {
      stopVision = true;
      renderer.dispose();
    };
  }, [xrSupported]);

  useEffect(() => {
    if (calibrated && poseMatrix4 && fretGroupRef.current) {
      fretGroupRef.current.matrix.fromArray(poseMatrix4);
      fretGroupRef.current.matrixAutoUpdate = false;
    }
  }, [calibrated, poseMatrix4]);

  useEffect(() => {
    if (!calibrated || !fretGroupRef.current) return;

    const group = fretGroupRef.current;

    if (mode === "scales") {
      if (!overlayRef.current) {
        overlayRef.current = createScaleOverlay({
          scene: group,
          tuning: STANDARD_TUNING,
          key: noteNameToMidi(currentKey),
          scalePattern: MAJOR_PATTERN,
          fretCount: 15,
        });
      } else {
        overlayRef.current.updateKey(noteNameToMidi(currentKey));
      }
    } else if (mode === "chords") {
      if (!overlayRef.current) {
        overlayRef.current = createChordOverlay({
          scene: group,
          tuning: STANDARD_TUNING,
          key: noteNameToMidi(currentKey),
          pattern: CHORD_PATTERNS[chordType],
          fretCount: 15,
        });
      } else {
        overlayRef.current.update(
          noteNameToMidi(currentKey),
          CHORD_PATTERNS[chordType]
        );
      }
    } else {
      if (overlayRef.current) {
        group.remove(overlayRef.current.group);
        overlayRef.current = null;
      }
    }
  }, [mode, currentKey, chordType, calibrated]);

  useEffect(() => {
    if (!metronomeOn) {
      return;
    }
    setTick(0);
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 600);
    return () => clearInterval(interval);
  }, [metronomeOn]);

  const ModeButton = ({ id, label, icon }) => (
    <Button
      className={`flex-1 ${mode === id ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
      onClick={() => setMode(id)}
      aria-label={label}
    >
      {icon} {label}
    </Button>
  );

  if (!xrSupported) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <p>Tu navegador no soporta WebXR AR.</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <video ref={videoRef} className="hidden" playsInline />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {!calibrated && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur rounded-xl px-4 py-2 text-sm text-white">
          {error ? (
            <>
              Error calibrando: {error}
              <Button size="sm" variant="ghost" className="ml-2 underline" onClick={retry}>
                Reintentar
              </Button>
            </>
          ) : (
            "Calibrando… mueve la cámara para enfocar todo el mástil"
          )}
        </div>
      )}
      {(mode === "scales" || mode === "chords") && calibrated && (
        <div className="absolute top-4 right-4 flex gap-2 bg-white/80 rounded-lg px-2 py-1 text-sm">
          <select
            value={currentKey}
            onChange={(e) => setCurrentKey(e.target.value)}
            className="bg-transparent"
          >
            {KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          {mode === "chords" && (
            <select
              value={chordType}
              onChange={(e) => setChordType(e.target.value)}
              className="bg-transparent"
            >
              <option value="major">maj</option>
              <option value="minor">min</option>
            </select>
          )}
        </div>
      )}
      {mode === "practice" && (
        <div className="absolute top-4 right-4 bg-white/80 rounded-lg px-3 py-1 text-sm flex items-center gap-2">
          <Button size="sm" onClick={() => setMetronomeOn(!metronomeOn)}>
            {metronomeOn ? 'Stop' : 'Start'}
          </Button>
          <span>{tick}</span>
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 w-11/12 max-w-md">
        <ModeButton id="scales" label="Escalas" icon="🎼" />
        <ModeButton id="chords" label="Acordes" icon="🎸" />
        <ModeButton id="practice" label="Practice" icon="⏱" />
      </div>
    </div>
  );
}
