import { createContext, useContext, useState, useCallback } from "react";

const translations = {
  es: {
    browserUnsupported: "Tu navegador no soporta WebXR AR.",
    calibrating: "Calibrando… mueve la cámara para enfocar todo el mástil",
    retry: "Reintentar",
    errorCalibrating: "Error calibrando:",
    modes: { scales: "Escalas", chords: "Acordes", practice: "Practice" },
    errors: {
      no_camera: "Acceso a la cámara denegado.",
      no_frets:
        "No se detectaron suficientes trastes. Asegúrate de que todo el mástil esté visible y bien iluminado.",
      solvepnp: "No se pudo calibrar la pose.",
    },
  },
  en: {
    browserUnsupported: "Your browser doesn't support WebXR AR.",
    calibrating: "Calibrating… move the camera to capture the fretboard",
    retry: "Retry",
    errorCalibrating: "Calibration error:",
    modes: { scales: "Scales", chords: "Chords", practice: "Practice" },
    errors: {
      no_camera: "Camera access denied. Please allow access.",
      no_frets:
        "Could not detect frets. Ensure the entire fretboard is visible and well-lit.",
      solvepnp: "Pose calibration failed.",
    },
  },
};

const I18nContext = createContext({ t: (k) => k, lang: "es", setLang: () => {} });

export function I18nProvider({ children }) {
  const defaultLang = navigator.language.startsWith("es") ? "es" : "en";
  const [lang, setLang] = useState(defaultLang);
  const t = useCallback((key) => {
    const keys = key.split(".");
    let value = translations[lang];
    for (const k of keys) value = value?.[k];
    return value || key;
  }, [lang]);
  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
