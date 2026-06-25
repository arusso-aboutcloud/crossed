import * as THREE from 'three';

export interface BgController {
  dispose(): void;
  setPaused(p: boolean): void;
  setEnabled(e: boolean): void;
  resize(w: number, h: number): void;
}

// Colors evoke the Microsoft Defender/Sentinel product palette.
// These are NOT the official Microsoft brand colors.
// Abstract homage using blues and teals from the security product UI.
const PALETTE = ['#3b82f6', '#1d4ed8', '#0ea5e9', '#0f766e'];

interface Cube {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotSpeed: THREE.Vector3;
  target: THREE.Vector3 | null;
  group: number;
}

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function createBackground(canvas: HTMLCanvasElement): BgController | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch {
    return null;
  }

  const isLowPower = typeof navigator !== 'undefined' &&
    navigator.hardwareConcurrency !== undefined &&
    navigator.hardwareConcurrency <= 2;

  const COUNT = isLowPower ? 80 : 200;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 600, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    (canvas.clientWidth || 800) / (canvas.clientHeight || 600),
    0.1,
    200
  );
  camera.position.z = 35;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 8);
  scene.add(dir);

  const geo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.3 });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const cubes: Cube[] = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < COUNT; i++) {
    const g = i % 4;
    const cube: Cube = {
      pos: new THREE.Vector3(rnd(-28, 28), rnd(-18, 18), rnd(-10, 10)),
      vel: new THREE.Vector3(rnd(-0.012, 0.012), rnd(-0.012, 0.012), 0),
      rot: new THREE.Euler(rnd(0, Math.PI * 2), rnd(0, Math.PI * 2), rnd(0, Math.PI * 2)),
      rotSpeed: new THREE.Vector3(rnd(-0.018, 0.018), rnd(-0.018, 0.018), rnd(-0.008, 0.008)),
      target: null,
      group: g,
    };
    cubes.push(cube);
    color.set(PALETTE[g]);
    mesh.setColorAt(i, color);
    applyMatrix(i, cube);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  function applyMatrix(i: number, c: Cube) {
    dummy.position.copy(c.pos);
    dummy.rotation.copy(c.rot);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  // Four-pane diamond choreography: cubes in each color group converge to one
  // quadrant of a tilted diamond, then drift free again.
  function choreoTarget(group: number, idx: number): THREE.Vector3 {
    const col = idx % 4;
    const row = Math.floor(idx / 4) % 4;
    const spread = 1.6;
    const radius = 7;
    const centers = [
      new THREE.Vector3(0, radius, 0),
      new THREE.Vector3(radius, 0, 0),
      new THREE.Vector3(0, -radius, 0),
      new THREE.Vector3(-radius, 0, 0),
    ];
    const base = centers[group];
    return new THREE.Vector3(
      base.x + (col - 1.5) * spread,
      base.y + (row - 1.5) * spread,
      rnd(-1, 1)
    );
  }

  let choreographing = false;
  let choreoTimer = 0;
  let holdTimer = 0;
  const CHOREO_EVERY = 22;
  const HOLD_FOR = 4;

  const reducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let paused = false;
  let enabled = true;
  let rafId = 0;
  let lastT = performance.now();
  let staticRendered = false;

  function onVisibility() {
    paused = !!document.hidden;
  }
  document.addEventListener('visibilitychange', onVisibility);

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!enabled || paused) return;

    if (reducedMotion) {
      if (!staticRendered) {
        renderer.render(scene, camera);
        staticRendered = true;
      }
      return;
    }

    const now = performance.now();
    const dt = Math.min((now - lastT) / 1000, 0.1);
    lastT = now;

    choreoTimer += dt;
    if (holdTimer > 0) holdTimer -= dt;

    if (!choreographing && choreoTimer >= CHOREO_EVERY) {
      choreographing = true;
      choreoTimer = 0;
      holdTimer = HOLD_FOR;
      const groupIdx = [0, 0, 0, 0];
      for (let i = 0; i < COUNT; i++) {
        const g = cubes[i].group;
        cubes[i].target = choreoTarget(g, groupIdx[g]);
        groupIdx[g]++;
      }
    }

    if (choreographing && holdTimer <= 0) {
      choreographing = false;
      for (let i = 0; i < COUNT; i++) cubes[i].target = null;
    }

    for (let i = 0; i < COUNT; i++) {
      const c = cubes[i];
      if (c.target) {
        c.pos.lerp(c.target, 0.05);
      } else {
        c.pos.addScaledVector(c.vel, 1);
        if (c.pos.x > 30)  c.pos.x = -30;
        if (c.pos.x < -30) c.pos.x = 30;
        if (c.pos.y > 20)  c.pos.y = -20;
        if (c.pos.y < -20) c.pos.y = 20;
      }
      c.rot.x += c.rotSpeed.x;
      c.rot.y += c.rotSpeed.y;
      c.rot.z += c.rotSpeed.z;
      applyMatrix(i, c);
    }

    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  tick();

  return {
    dispose() {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    },
    setPaused(p) { paused = p; },
    setEnabled(e) {
      enabled = e;
      if (e && reducedMotion) renderer.render(scene, camera);
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
  };
}
