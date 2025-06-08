import * as THREE from 'three';

export function createChordOverlay({ scene, tuning, key, pattern, fretCount }) {
  const group = new THREE.Group();
  scene.add(group);
  const material = new THREE.MeshStandardMaterial({ color: 0x33ff33 });
  const notes = [];

  function addNotes(root, pat) {
    for (let s = 0; s < tuning.length; s++) {
      for (const interval of pat) {
        let target = root + interval;
        while (target < tuning[s]) target += 12;
        const fret = target - tuning[s];
        if (fret >= 0 && fret <= fretCount) {
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.005), material);
          mesh.position.set((s - tuning.length / 2) * 0.03, 0.005, -0.01 * fret);
          group.add(mesh);
          notes.push(mesh);
        }
      }
    }
  }

  function clearNotes() {
    notes.forEach(n => group.remove(n));
    notes.length = 0;
  }

  addNotes(key, pattern);

  return {
    group,
    update(root, pat) {
      clearNotes();
      addNotes(root, pat);
    },
  };
}
