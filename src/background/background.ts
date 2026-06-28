import * as THREE from 'three';
import { FORMATIONS } from './formations';

export interface BgController {
  dispose(): void;
  setPaused(p: boolean): void;
  setEnabled(e: boolean): void;
  resize(w: number, h: number): void;
}

// Resting-state palette: Mario-inspired + summer colors (bright, warm, tropical).
// Dark cubes reduced to 1 entry out of 10 so the background reads light and summery.
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
const FIRST_TRIGGER_MIN = 8;
const FIRST_TRIGGER_MAX = 15;
const INTERVAL_MIN = 15;
const INTERVAL_MAX = 25;
const ENTER_DURATION = 2.0;
const HOLD_DURATION = 5.0;
const LEAVE_DURATION = 2.0;

enum FormationState {
  DRIFTING,
  ENTERING,
  HOLDING,
  LEAVING,
}

interface Cube {
  // Current world position
  pos: THREE.Vector3;
  // Drift velocity (world units per second)
  vel: THREE.Vector3;
  // Current rotation
  rot: THREE.Euler;
  // Rotation speed (radians per second per axis)
  rotSpeed: THREE.Vector3;
  // Drift position saved when formation starts (lerp source during ENTERING)
  driftPos: THREE.Vector3;
  // Target formation position (null when cube has no slot in the current formation)
  formTarget: THREE.Vector3 | null;
  // Resting color index (0 = white, 1 = black)
  restColorIdx: number;
  // Formation color (hex string) assigned when a formation starts
  formColor: string;
  // Random phase offset for individual idle bob animation (0..2*PI)
  phaseOffset: number;
}

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function rndInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ease-in-out cubic
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Parse a hex color string into r, g, b in [0,1]
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const ri = parseInt(h.slice(0, 2), 16) / 255;
  const gi = parseInt(h.slice(2, 4), 16) / 255;
  const bi = parseInt(h.slice(4, 6), 16) / 255;
  return [ri, gi, bi];
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

  const COUNT = isLowPower ? 80 : 260;

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

  // Pre-allocate lerp buffer for colors - no per-frame heap allocation
  const colorBuf = new Float32Array(COUNT * 3);
  const tmpColor = new THREE.Color();
  const dummy = new THREE.Object3D();

  const cubes: Cube[] = [];

  for (let i = 0; i < COUNT; i++) {
    const restColorIdx = Math.floor(Math.random() * RESTING_COLORS.length);
    const cube: Cube = {
      pos: new THREE.Vector3(rnd(-28, 28), rnd(-18, 18), rnd(-10, 10)),
      vel: new THREE.Vector3(rnd(-0.008, 0.008), rnd(-0.008, 0.008), 0),
      rot: new THREE.Euler(rnd(0, Math.PI * 2), rnd(0, Math.PI * 2), rnd(0, Math.PI * 2)),
      rotSpeed: new THREE.Vector3(rnd(-0.015, 0.015), rnd(-0.015, 0.015), rnd(-0.006, 0.006)),
      driftPos: new THREE.Vector3(),
      formTarget: null,
      restColorIdx,
      formColor: RESTING_COLORS[restColorIdx],
      phaseOffset: rnd(0, Math.PI * 2),
    };
    cubes.push(cube);
    tmpColor.set(RESTING_COLORS[restColorIdx]);
    mesh.setColorAt(i, tmpColor);
    applyMatrix(i, cube);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  function applyMatrix(i: number, c: Cube) {
    dummy.position.copy(c.pos);
    dummy.rotation.copy(c.rot);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  // Formation scheduler state
  let formationState: FormationState = FormationState.DRIFTING;
  let formationTimer = 0;
  let nextFormationTime = rnd(FIRST_TRIGGER_MIN, FIRST_TRIGGER_MAX);
  let lastFormationIdx = -1;
  let transitionProgress = 0; // 0..1

  // Shuffled formation queue for varied sequencing
  let formationQueue: number[] = [];
  let formationQueuePos = 0;

  function buildShuffledQueue(): number[] {
    const indices = FORMATIONS.map((_, i) => i);
    // Fisher-Yates shuffle using Math.random
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
    // Walk through the shuffled queue, rebuilding when exhausted
    // Skip the immediately-previous formation to avoid repeats at queue boundaries
    let idx = formationQueue[formationQueuePos];
    formationQueuePos++;
    if (formationQueuePos >= formationQueue.length) {
      formationQueue = buildShuffledQueue();
      formationQueuePos = 0;
    }
    // If same as last (can happen at queue boundary), swap with next slot
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

  // Grid spacing between cubes in a formation (world units)
  const GRID_STEP = 2.2;

  function assignFormation(formIdx: number) {
    const form = FORMATIONS[formIdx];
    const slots = form.slots;

    // Find bounding box of slots to center the grid in world space
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

    // Save current drift position as the lerp source
    for (let i = 0; i < COUNT; i++) {
      cubes[i].driftPos.copy(cubes[i].pos);
      cubes[i].formTarget = null;
      cubes[i].formColor = RESTING_COLORS[cubes[i].restColorIdx];
    }

    // Assign cubes to slots in order (first COUNT cubes that have slots)
    for (let si = 0; si < slots.length && si < COUNT; si++) {
      const s = slots[si];
      const wx = (s.col - centerCol) * GRID_STEP;
      const wy = -(s.row - centerRow) * GRID_STEP; // invert Y (row 0 = top)
      cubes[si].formTarget = new THREE.Vector3(wx, wy, 0);
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
      lastT = performance.now(); // reset dt to avoid huge jump
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!enabled || paused) return;

    if (reducedMotion) {
      // Static frame only - no formations, no animation
      if (!staticRendered) {
        renderer.render(scene, camera);
        staticRendered = true;
      }
      return;
    }

    const now = performance.now();
    const dt = Math.min((now - lastT) / 1000, 0.1);
    lastT = now;

    // Formation state machine
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
          formationTimer = 0;
          formationState = FormationState.LEAVING;
          transitionProgress = 1;
          // Save current (formation) position as departure point for lerp back
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
          // Clear formation targets
          for (let i = 0; i < COUNT; i++) {
            cubes[i].formTarget = null;
          }
        }
        break;
      }
    }

    const isTransitioning = formationState === FormationState.ENTERING ||
                            formationState === FormationState.HOLDING ||
                            formationState === FormationState.LEAVING;

    // Blend factor: how far into the formation we are (0 = pure drift, 1 = pure formation)
    const blend = easeInOut(Math.max(0, Math.min(1, transitionProgress)));

    for (let i = 0; i < COUNT; i++) {
      const c = cubes[i];

      if (formationState === FormationState.DRIFTING) {
        // Pure drift + subtle individual bob
        c.pos.addScaledVector(c.vel, dt * 60);
        // Subtle individual floating bob (amplitude 0.3, each cube at its own phase)
        const bobY = Math.sin(now * 0.0008 + c.phaseOffset) * 0.3;
        c.pos.y += bobY * dt * 60 * 0.016; // scale to be frame-rate independent subtle nudge
        // Wrap
        if (c.pos.x > 30)  c.pos.x = -30;
        if (c.pos.x < -30) c.pos.x = 30;
        if (c.pos.y > 20)  c.pos.y = -20;
        if (c.pos.y < -20) c.pos.y = 20;
      } else if (isTransitioning && c.formTarget !== null) {
        // Cube has a formation slot: lerp between drift position and formation target
        if (formationState === FormationState.ENTERING) {
          c.pos.lerpVectors(c.driftPos, c.formTarget, blend);
        } else if (formationState === FormationState.HOLDING) {
          c.pos.copy(c.formTarget);
          // Gentle drift within formation during hold - tiny oscillation
          c.pos.x += Math.sin(now * 0.0005 + i * 0.8) * 0.05;
          c.pos.y += Math.cos(now * 0.0004 + i * 0.7) * 0.05;
        } else {
          // LEAVING: lerp from saved departure position back toward drift
          // Drift continues accumulating during leave
          c.pos.addScaledVector(c.vel, dt * 60 * (1 - blend));
          const target = new THREE.Vector3(
            c.driftPos.x + c.vel.x * dt * 60,
            c.driftPos.y + c.vel.y * dt * 60,
            c.driftPos.z
          );
          c.pos.lerpVectors(c.driftPos, target, 1 - blend);
          // Wrap
          if (c.pos.x > 30)  c.pos.x = -30;
          if (c.pos.x < -30) c.pos.x = 30;
          if (c.pos.y > 20)  c.pos.y = -20;
          if (c.pos.y < -20) c.pos.y = 20;
        }
      } else if (isTransitioning) {
        // No formation slot for this cube - keep drifting normally
        c.pos.addScaledVector(c.vel, dt * 60);
        if (c.pos.x > 30)  c.pos.x = -30;
        if (c.pos.x < -30) c.pos.x = 30;
        if (c.pos.y > 20)  c.pos.y = -20;
        if (c.pos.y < -20) c.pos.y = 20;
      }

      // Rotation always continues
      c.rot.x += c.rotSpeed.x * dt * 60;
      c.rot.y += c.rotSpeed.y * dt * 60;
      c.rot.z += c.rotSpeed.z * dt * 60;

      applyMatrix(i, c);

      // Color lerp
      const restColor = RESTING_COLORS[c.restColorIdx];
      if (isTransitioning && c.formTarget !== null && formationState !== FormationState.DRIFTING) {
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
