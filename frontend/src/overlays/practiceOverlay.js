import * as THREE from "three";

/**
 * Very small overlay used for practice mode. It shows a pulsing sphere that
 * works like a visual metronome.
 */
export function createPracticeOverlay({ scene, bpm = 60 }) {
  const group = new THREE.Group();
  scene.add(group);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00ffff })
  );
  sphere.position.set(0, 0.025, 0);
  group.add(sphere);

  const tick = () => {
    sphere.scale.setScalar(1.5);
    setTimeout(() => sphere.scale.setScalar(1), 100);
  };
  tick();
  const interval = 60000 / bpm;
  let id = setInterval(tick, interval);

  return {
    group,
    updateBpm(newBpm) {
      clearInterval(id);
      id = setInterval(tick, 60000 / newBpm);
    },
    dispose() {
      clearInterval(id);
    },
  };
}
