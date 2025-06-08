import { useState, useEffect, useCallback } from "react";
import { loadOpenCV, detectFrets } from "../vision/fretDetection.js";
import { calibratePose } from "../vision/calibratePose.js";
export function usePoseCalibration(videoRef, scaleReal = 647) {
  const [poseMatrix4, setPoseMatrix4] = useState(null);
  const [calibrated, setCalibrated] = useState(false);
  const [error, setError] = useState(null);
  const runCalibration = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await loadOpenCV();
      const frets = detectFrets(videoRef.current);
      if (frets.length < 4) throw new Error("No se detectaron suficientes trastes");
      const nut = { x: (frets[0].x1 + frets[0].x2)/2, y:(frets[0].y1+frets[0].y2)/2 };
      const br = frets[frets.length-1];
      const bridge = { x:(br.x1+br.x2)/2, y:(br.y1+br.y2)/2 };
      const f5 = frets[Math.min(5, frets.length-1)];
      const fret5 = { x:(f5.x1+f5.x2)/2, y:(f5.y1+f5.y2)/2 };
      const f12 = frets[Math.min(12, frets.length-1)];
      const fret12 = { x:(f12.x1+f12.x2)/2, y:(f12.y1+f12.y2)/2 };
      const { pose, success } = await calibratePose({nut,bridge,fret5,fret12}, scaleReal, videoRef.current.videoWidth, videoRef.current.videoHeight);
      if(!success) throw new Error("solvePnP falló");
      setPoseMatrix4(pose.matrix4); setCalibrated(true); setError(null);
    } catch(e){ console.warn("Calibración fallida",e); setError(e.message); setCalibrated(false);}
  }, [videoRef, scaleReal]);
  useEffect(() => {
    if (calibrated) return;
    const to = setTimeout(runCalibration, 2000);
    return () => clearTimeout(to);
  }, [videoRef, calibrated, runCalibration]);
  return { poseMatrix4, calibrated, retry: runCalibration, error };
}