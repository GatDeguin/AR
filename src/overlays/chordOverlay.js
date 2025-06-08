import * as THREE from "three";

/**
 * Overlay that highlights chord tones across the fretboard. It mirrors the
 * behavior of `createScaleOverlay` but uses a chord interval pattern instead.
 */
export function createChordOverlay({
  scene,
  tuning,
  key,
  chordPattern,
  fretCount = 12,
}) {
  const group = new THREE.Group();
  scene.add(group);
  const noteMeshes = [];

  const draw = (rootMidi) => {
    noteMeshes.forEach((m) => group.remove(m));
    noteMeshes.length = 0;

    for (let s = 0; s < tuning.length; s++) {
      const open = tuning[s];
      for (let f = 0; f < fretCount; f++) {
        const noteInChord = (open + f - rootMidi + 120) % 12;
        const idx = chordPattern.indexOf(noteInChord);
        if (idx !== -1) {
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.006, 8, 8),
            new THREE.MeshBasicMaterial({ color: idx === 0 ? 0xff0000 : 0x00ff00 })
          );
          mesh.position.set(-0.15 + s * 0.06, 0, -0.01 * f);
          group.add(mesh);
          noteMeshes.push(mesh);
        }
      }
    }
  };

  draw(key);

  return {
    group,
    updateKey(newKey) {
      draw(newKey);
    },
  };
}
