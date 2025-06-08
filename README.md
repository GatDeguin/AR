# Guitarra Tutor AR

Guitarra Tutor AR is a web application that overlays guitar scales and chords over your instrument using augmented reality. It is built with React, Vite, Tailwind CSS and Three.js.

## AR Features
- Detects the guitar fretboard with the device camera.
- Renders scale overlays on top of the detected frets in real time.
- Uses WebXR to enable immersive AR sessions on supported browsers.

### Browser requirements
- A browser with WebXR support (Chrome for Android, Oculus Browser, etc.).
- The site must be served over **HTTPS** (or `localhost`) so that the camera and WebXR APIs can be accessed.

## Getting started

### Install dependencies
```bash
npm install --force
```

### Development server
```bash
npm run dev
```
This starts the Vite dev server and prints the local URL. Open it in a WebXR capable browser to launch the AR experience.

### Building for production
```bash
npm run build
```
The production build will be written to the `dist` directory which can then be served from any static web server.

## Project structure
- `src/` – main React source code.
- `openapi.yaml` – API specification.
- `uml_diagrams.puml` – PlantUML diagrams.

