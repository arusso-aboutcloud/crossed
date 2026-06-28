import * as THREE from 'three';
import { FORMATIONS } from './formations';

export interface BgController {
  dispose(): void;
  setPaused(p: boolean): void;
  setEnabled(e: boolean): void;
  resize(w: number, h: number): void;
}

// Resting-state palette: Mario-inspired + summer colors (bright, warm, tropical).
const RESTING_COLORS = [
  '#5c94fc', // Mario sky blue
  '#43b047', // Mario green
  '#e52222', // Mario red
  '#ffd700', // Gold
  '#ffffff', // White
  '#ec4899', // Flamingo pink
  '#0891b2', // Ocean teal
  '#fbbf24', // Pineapple yellow
  '#f97316', // Orange
  '#7dd3fc', // Light blue
];

// Formation scheduler timing (seconds).
const FIRST_TRIGGER_MIN = 4;
const FIRST_TRIGGER_MAX = 8;
const INTERVAL_MIN = 8;
const INTERVAL_MAX = 15;
const ENTER_DURATION = 2.5;
const HOLD_DURATION = 6.0;
const LEAVE_DURATION = 2.0;

// Scale applied to non-formation cubes during formation so only the shape is visible.
const BYSTANDER_SCALE_MIN = 0.08;
// Scale applied to formation cubes during HOLDING for visual pop.
const FORMATION_SCALE_MAX = 1.25;

enum FormationState {
  DRIFTING,
  ENTERING,
  HOLDING,
  LEAVING,
}

interface Cube {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotSpeed: THREE.Vector3;
  // Position saved at start of ENTERING (lerp source for ENTERING, return target via preDriftPos)
  driftPos: THREE.Vector3;
  // Target formation world position (null = bystander)
  formTarget: THREE.Vector3 | null;
  restColorIdx: number;
  formColor: string;
  phaseOffset: number;
}

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Ease-in-out cubic
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
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

  // Fewer cubes so formations (17-45 cubes) are a large fraction and clearly visible.
  const COUNT = isLowPower ? 40 : 90;

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
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.1 });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const colorBuf = new Float32Array(COUNT * 3);
  const tmpColor = new THREE.Color();
  const dummy = new THREE.Object3D();

  const cubes: Cube[] = [];

  for (let i = 0; i < COUNT; i++) {
    const restColorIdx = Math.floor(Math.random() * RESTING_COLORS.length);
    const cube: Cube = {
      pos: new THREE.Vector3(rnd(-28, 28), rnd(-18, 18), rnd(-8, 8)),
      vel: new THREE.Vector3(rnd(-0.012, 0.012), rnd(-0.008, 0.008), 0),
      rot: new THREE.Euler(rnd(0, Math.PI * 2), rnd(0, Math.PI * 2), rnd(0, Math.PI * 2)),
      rotSpeed: new THREE.Vector3(rnd(-0.018, 0.018), rnd(-0.018, 0.018), rnd(-0.008, 0.008)),
      driftPos: new THREE.Vector3(),
      formTarget: null,
      restColorIdx,
      formColor: RESTING_COLORS[restColorIdx],
      phaseOffset: rnd(0, Math.PI * 2),
    };
    cubes.push(cube);
    tmpColor.set(RESTING_COLORS[restColorIdx]);
    mesh.setColorAt(i, tmpColor);
    applyMatrix(i, cube, 1.0);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  // Sets position, rotation, and SCALE on the instanced mesh slot.
  function applyMatrix(i: number, c: Cube, scale: number) {
    dummy.position.copy(c.pos);
    dummy.rotation.copy(c.rot);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  let formationState: FormationState = FormationState.DRIFTING;
  let formationTimer = 0;
  let nextFormationTime = rnd(FIRST_TRIGGER_MIN, FIRST_TRIGGER_MAX);
  let lastFormationIdx = -1;
  let transitionProgress = 0;

  // Positions saved at ENTERING start; used by LEAVING to scatter cubes back.
  const preDriftPos: THREE.Vector3[] = Array.from({ length: COUNT }, () => new THREE.Vector3());

  let formationQueue: number[] = [];
  let formationQueuePos = 0;

  function buildShuffledQueue(): number[] {
    const indices = FORMATIONS.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = indices[i]; indices[i] = indices[j]; indices[j] = tmp;
    }
    return indices;
  }
  formationQueue = buildShuffledQueue();

  const reducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pickNextFormation(): number {
    let idx = formationQueue[formationQueuePos];
    formationQueuePos++;
    if (formationQueuePos >= formationQueue.length) {
      formationQueue = buildShuffledQueue();
      formationQueuePos = 0;
    }
    if (FORMATIONS.length > 1 && idx === lastFormationIdx) {
      const next = formationQueue[formationQueuePos];
      formationQueue[formationQueuePos] = idx;
      idx = next;
      formationQueuePos++;
      if (formationQueuePos >= formationQueue.length) {
        formationQueue = buildShuffledQueue();
        formationQueuePos = 0;
      }
    }
    return idx;
  }

  // World-space gap between adjacent cubes in a formation.
  const GRID_STEP = 2.0;

  function assignFormation(formIdx: number) {
    const form = FORMATIONS[formIdx];
    const slots = form.slots;

    let minCol = Infinity, maxCol = -Infinity;
    let minRow = Infinity, maxRow = -Infinity;
    for (const s of slots) {
      if (s.col < minCol) minCol = s.col;
      if (s.col > maxCol) maxCol = s.col;
      if (s.row < minRow) minRow = s.row;
      if (s.row > maxRow) maxRow = s.row;
    }
    const centerCol = (minCol + maxCol) / 2;
    const centerRow = (minRow + maxRow) / 2;

    for (let i = 0; i < COUNT; i++) {
      cubes[i].driftPos.copy(cubes[i].pos);
      preDriftPos[i].copy(cubes[i].pos);
      cubes[i].formTarget = null;
      cubes[i].formColor = RESTING_COLORS[cubes[i].restColorIdx];
    }

    for (let si = 0; si < slots.length && si < COUNT; si++) {
      const s = slots[si];
      cubes[si].formTarget = new THREE.Vector3(
        (s.col - centerCol) * GRID_STEP,
        -(s.row - centerRow) * GRID_STEP,
        0
      );
      cubes[si].formColor = s.color;
    }
  }

  let paused = false;
  let enabled = true;
  let rafId = 0;
  let lastT = performance.now();
  let staticRendered = false;

  function onVisibility() {
    if (document.hidden) {
      paused = true;
    } else {
      paused = false;
      lastT = performance.now();
    }
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

    // State machine
    switch (formationState) {
      case FormationState.DRIFTING: {
        formationTimer += dt;
        if (formationTimer >= nextFormationTime) {
          formationTimer = 0;
          const idx = pickNextFormation();
          lastFormationIdx = idx;
          assignFormation(idx);
          formationState = FormationState.ENTERING;
          transitionProgress = 0;
        }
        break;
      }
      case FormationState.ENTERING: {
        transitionProgress += dt / ENTER_DURATION;
        if (transitionProgress >= 1) {
          transitionProgress = 1;
          formationState = FormationState.HOLDING;
          formationTimer = 0;
        }
        break;
      }
      case FormationState.HOLDING: {
        formationTimer += dt;
        if (formationTimer >= HOLD_DURATION) {
          formationState = FormationState.LEAVING;
          transitionProgress = 1;
          for (let i = 0; i < COUNT; i++) {
            cubes[i].driftPos.copy(cubes[i].pos);
          }
        }
        break;
      }
      case FormationState.LEAVING: {
        transitionProgress -= dt / LEAVE_DURATION;
        if (transitionProgress <= 0) {
          transitionProgress = 0;
          formationState = FormationState.DRIFTING;
          nextFormationTime = rnd(INTERVAL_MIN, INTERVAL_MAX);
          formationTimer = 0;
          for (let i = 0; i < COUNT; i++) {
            cubes[i].formTarget = null;
          }
        }
        break;
      }
    }

    const isFormationActive =
      formationState === FormationState.ENTERING ||
      formationState === FormationState.HOLDING ||
      formationState === FormationState.LEAVING;

    // blend: 0 = pure drift, 1 = fully in formation
    const blend = easeInOut(Math.max(0, Math.min(1, transitionProgress)));

    for (let i = 0; i < COUNT; i++) {
      const c = cubes[i];
      const isMember = c.formTarget !== null;

      // --- Position ---
      if (!isFormationActive) {
        // Pure drift with gentle bob
        c.pos.addScaledVector(c.vel, dt * 60);
        c.pos.y += Math.sin(now * 0.0008 + c.phaseOffset) * 0.004;
        if (c.pos.x > 30)  c.pos.x = -30;
        if (c.pos.x < -30) c.pos.x = 30;
        if (c.pos.y > 20)  c.pos.y = -20;
        if (c.pos.y < -20) c.pos.y = 20;
      } else if (isMember) {
        if (formationState === FormationState.ENTERING) {
          c.pos.lerpVectors(c.driftPos, c.formTarget!, blend);
        } else if (formationState === FormationState.HOLDING) {
          c.pos.copy(c.formTarget!);
          // Tiny oscillation so cubes feel alive during hold
          c.pos.x += Math.sin(now * 0.0006 + i * 0.9) * 0.06;
          c.pos.y += Math.cos(now * 0.0005 + i * 0.8) * 0.06;
        } else {
          // LEAVING: from held position back to pre-gather position
          c.pos.lerpVectors(c.driftPos, preDriftPos[i], 1 - blend);
        }
      } else {
        // Bystander: keep drifting, will scale to near-invisible
        c.pos.addScaledVector(c.vel, dt * 60);
        if (c.pos.x > 30)  c.pos.x = -30;
        if (c.pos.x < -30) c.pos.x = 30;
        if (c.pos.y > 20)  c.pos.y = -20;
        if (c.pos.y < -20) c.pos.y = 20;
      }

      // --- Rotation (always) ---
      c.rot.x += c.rotSpeed.x * dt * 60;
      c.rot.y += c.rotSpeed.y * dt * 60;
      c.rot.z += c.rotSpeed.z * dt * 60;

      // --- Scale ---
      // Formation members: 1 -> FORMATION_SCALE_MAX -> 1
      // Bystanders: 1 -> BYSTANDER_SCALE_MIN -> 1
      // This makes formations unmistakably visible.
      let scale = 1.0;
      if (isFormationActive) {
        if (isMember) {
          if (formationState === FormationState.ENTERING) {
            scale = 1.0 + (FORMATION_SCALE_MAX - 1.0) * blend;
          } else if (formationState === FormationState.HOLDING) {
            scale = FORMATION_SCALE_MAX;
          } else {
            // LEAVING: blend goes 1->0, so scale goes FORMATION_SCALE_MAX -> 1
            scale = 1.0 + (FORMATION_SCALE_MAX - 1.0) * blend;
          }
        } else {
          // Bystander: shrink as blend rises, grow back as blend falls
          scale = 1.0 + (BYSTANDER_SCALE_MIN - 1.0) * blend;
        }
      }

      applyMatrix(i, c, scale);

      // --- Color ---
      const restColor = RESTING_COLORS[c.restColorIdx];
      if (isFormationActive && isMember) {
        const [rr, rg, rb] = hexToRgb(restColor);
        const [fr, fg, fb] = hexToRgb(c.formColor);
        colorBuf[i * 3 + 0] = rr + (fr - rr) * blend;
        colorBuf[i * 3 + 1] = rg + (fg - rg) * blend;
        colorBuf[i * 3 + 2] = rb + (fb - rb) * blend;
      } else {
        const [rr, rg, rb] = hexToRgb(restColor);
        colorBuf[i * 3 + 0] = rr;
        colorBuf[i * 3 + 1] = rg;
        colorBuf[i * 3 + 2] = rb;
      }

      tmpColor.setRGB(colorBuf[i * 3], colorBuf[i * 3 + 1], colorBuf[i * 3 + 2]);
      mesh.setColorAt(i, tmpColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
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
    setPaused(p) {
      paused = p;
      if (!p) lastT = performance.now();
    },
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
