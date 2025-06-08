import * as THREE from 'three';

export function createScaleOverlay({ scene, tuning, key, scalePattern, fretCount }) {
  const group = new THREE.Group();
  scene.add(group);
  const material = new THREE.MeshStandardMaterial({ color: 0xff3333 });
  const notes = [];

  function addNotes(k) {
    for (let s = 0; s < tuning.length; s++) {
      for (let f = 0; f < fretCount; f++) {
        const midi = tuning[s] + f;
        const idx = (midi - k + 12) % 12;
        if (scalePattern.includes(idx)) {
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.005), material);
          mesh.position.set((s - tuning.length / 2) * 0.03, 0, -0.01 * f);
          group.add(mesh);
          notes.push(mesh);
        }
      }
    }
  }

  function clearNotes() {
    notes.forEach((n) => group.remove(n));
    notes.length = 0;
  }

  addNotes(key);

  return {
    group,
    updateKey(newKey) {
      clearNotes();
      addNotes(newKey);
    },
  };
}
