import * as THREE from "three";

/**
 * Creates a basic overlay that highlights scale notes on top of the virtual
 * fretboard. This implementation is intentionally very small and does not aim
 * to be musically perfect; it just renders small spheres at the frets that
 * belong to the selected scale.
 */
export function createScaleOverlay({
  scene,
  tuning,
  key,
  scalePattern,
  fretCount = 12,
}) {
  const group = new THREE.Group();
  scene.add(group);
  const noteMeshes = [];

  const draw = (rootMidi) => {
    // clear previous meshes
    noteMeshes.forEach((m) => group.remove(m));
    noteMeshes.length = 0;

    for (let s = 0; s < tuning.length; s++) {
      const open = tuning[s];
      for (let f = 0; f < fretCount; f++) {
        const noteInScale = (open + f - rootMidi + 120) % 12;
        if (scalePattern.includes(noteInScale)) {
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.006, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
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
