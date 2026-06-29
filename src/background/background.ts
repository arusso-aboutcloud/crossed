import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { FORMATIONS, FORMATION_SLOT_BUDGET } from './formations';

export interface BgController {
  dispose(): void;
  setPaused(p: boolean): void;
  setEnabled(e: boolean): void;
  resize(w: number, h: number): void;
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Formation scheduler timing (seconds)
// ---------------------------------------------------------------------------

const FIRST_TRIGGER_MIN = 4;
const FIRST_TRIGGER_MAX = 8;
const INTERVAL_MIN = 8;
const INTERVAL_MAX = 15;
const ENTER_DURATION = 2.5;
const HOLD_DURATION = 6.0;
const LEAVE_DURATION = 2.0;

// Bystanders scale to this during a formation (sub-pixel, fully invisible).
const BYSTANDER_SCALE_MIN = 0.001;
// Formation cubes scale to this at peak HOLDING for visual pop.
const FORMATION_SCALE_MAX = 1.25;

// ---------------------------------------------------------------------------
// Quality tier system
// ---------------------------------------------------------------------------

type QualityTier = 'high' | 'medium' | 'low';

// Device signals -> tier mapping.
// low: hardwareConcurrency <= 2 OR explicitly flagged low-power
// medium: concurrency <= 4 OR very high DPR (implies thin/hot phone)
// high: everything else (desktop / capable tablet)
function detectTier(isLowPower: boolean): QualityTier {
  if (isLowPower) return 'low';
  const cpu = (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined) ?? 4;
  const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : undefined) ?? 1;
  if (cpu <= 4 || dpr > 2) return 'medium';
  return 'high';
}

const DPR_CAP: Record<QualityTier, number> = {
  high: 2,
  medium: 1.5,
  low: 1,
};

interface BloomConfig {
  strength: number;
  radius: number;
  threshold: number;
  resScale: number; // bloom render-target scale relative to canvas (0.5 = half-res bloom)
}

const BLOOM_CONFIG: Record<QualityTier, BloomConfig | null> = {
  // High: full-res bloom, gentle glow on bright formation colors.
  high: { strength: 0.28, radius: 0.40, threshold: 0.55, resScale: 1.0 },
  // Medium: half-res bloom, slightly tighter to save fill-rate on mid phones.
  medium: { strength: 0.18, radius: 0.35, threshold: 0.60, resScale: 0.5 },
  // Low: no post-processing. Direct render.
  low: null,
};

// ---------------------------------------------------------------------------
// Easing library
// ---------------------------------------------------------------------------

// Classic ease-in-out cubic (used for LEAVING and color blend).
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Ease-out cubic: cubes rush to target and decelerate smoothly.
// Used for formation member POSITION during ENTERING.
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Back-out: arrives at destination with ~10 % overshoot then settles.
// Used for formation member SCALE during ENTERING - gives a satisfying
// "snap into place" pop without silly bounciness.
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Returns sRGB float components [0-1] from a '#rrggbb' hex string.
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

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
  driftPos: THREE.Vector3;
  formTarget: THREE.Vector3 | null;
  restColorIdx: number;
  formColor: string;
  phaseOffset: number;
}

// ---------------------------------------------------------------------------
// createBackground
// ---------------------------------------------------------------------------

export function createBackground(canvas: HTMLCanvasElement): BgController | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch {
    return null;
  }

  const isLowPower =
    typeof navigator !== 'undefined' &&
    navigator.hardwareConcurrency !== undefined &&
    navigator.hardwareConcurrency <= 2;

  const tier = detectTier(isLowPower);
  const COUNT = isLowPower ? 40 : 90;

  const dprCap = DPR_CAP[tier];
  const dpr = Math.min(window.devicePixelRatio ?? 1, dprCap);

  renderer.setPixelRatio(dpr);
  renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 600, false);
  renderer.setClearColor(0x000000, 0);

  // Neutral tone mapping: well-suited to saturated game palettes; less
  // contrast-crushing than ACES. OutputPass reads these settings.
  renderer.toneMapping = (THREE as any).NeutralToneMapping ?? (THREE as any).ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = (THREE as any).SRGBColorSpace ?? 'srgb';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    (canvas.clientWidth || 800) / (canvas.clientHeight || 600),
    0.1,
    200,
  );
  camera.position.z = 35;

  // ------------------------------------------------------------------
  // Lighting rig
  // ------------------------------------------------------------------
  // Warm ambient ensures no face is fully black; summer-sky warmth.
  const ambientLight = new THREE.AmbientLight(0xfff4e0, 0.85);
  scene.add(ambientLight);

  // Key light: warm summer sun from upper-right-front.
  const keyLight = new THREE.DirectionalLight(0xffecc0, 1.0);
  keyLight.position.set(8, 12, 10);
  scene.add(keyLight);

  // Fill light: cool sky reflection from upper-left. Skipped on low tier
  // to reduce lighting calculations and keep the GPU load down.
  if (tier !== 'low') {
    const fillLight = new THREE.DirectionalLight(0xa8d8ff, 0.35);
    fillLight.position.set(-10, 4, 8);
    scene.add(fillLight);
  }

  // ------------------------------------------------------------------
  // Geometry and material
  // ------------------------------------------------------------------
  // MeshStandardMaterial gives PBR shading: each cube face responds to
  // the lighting rig, giving real depth and material feel.
  // roughness=0.60 keeps it matte-ish (no harsh specular glints on mobile).
  // metalness=0.05 adds a touch of surface response without looking metallic.
  const geo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.60,
    metalness: 0.05,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

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

  function applyMatrix(i: number, c: Cube, scale: number) {
    dummy.position.copy(c.pos);
    dummy.rotation.copy(c.rot);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  // ------------------------------------------------------------------
  // Post-processing (high and medium tiers only)
  // ------------------------------------------------------------------
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let composer: EffectComposer | null = null;
  let bloomPass: UnrealBloomPass | null = null;

  const bloomConfig = BLOOM_CONFIG[tier];

  if (bloomConfig && !reducedMotion) {
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 600;

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bw = Math.max(1, Math.round(w * dpr * bloomConfig.resScale));
    const bh = Math.max(1, Math.round(h * dpr * bloomConfig.resScale));
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(bw, bh),
      bloomConfig.strength,
      bloomConfig.radius,
      bloomConfig.threshold,
    );
    composer.addPass(bloomPass);

    // Tasteful vignette: darkens edges slightly for a framed, premium feel.
    // offset=0.85 keeps a generous bright center; darkness=1.1 ensures
    // edges trend toward black (values > 1.0 clamp cleanly in the shader).
    const vignettePass = new ShaderPass(VignetteShader);
    (vignettePass.uniforms as Record<string, { value: unknown }>)['offset'].value = 0.85;
    (vignettePass.uniforms as Record<string, { value: unknown }>)['darkness'].value = 1.10;
    composer.addPass(vignettePass);

    // OutputPass applies tone mapping + sRGB conversion as the final step.
    composer.addPass(new OutputPass());
  }

  // ------------------------------------------------------------------
  // Formation scheduler
  // ------------------------------------------------------------------

  let formationState: FormationState = FormationState.DRIFTING;
  let formationTimer = 0;
  let nextFormationTime = rnd(FIRST_TRIGGER_MIN, FIRST_TRIGGER_MAX);
  let lastFormationIdx = -1;
  let transitionProgress = 0;

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

  const GRID_STEP = 2.0;

  function assignFormation(formIdx: number) {
    const form = FORMATIONS[formIdx];
    const slots = form.slots;

    if (slots.length > COUNT) {
      console.warn(
        `[WebGL] Formation "${form.id}" has ${slots.length} slots but pool is ${COUNT}.` +
        ` Keep formations at or below FORMATION_SLOT_BUDGET (${FORMATION_SLOT_BUDGET}).`,
      );
    }

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
        0,
      );
      cubes[si].formColor = s.color;
    }
  }

  // ------------------------------------------------------------------
  // Animation loop
  // ------------------------------------------------------------------

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

    // -- State machine -----------------------------------------------
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

    // ENTERING uses two separate blends:
    //   posBlend  (easeOut)     - smooth rush-to-position
    //   scaleBlend (easeOutBack) - spring overshoot for satisfying pop
    // LEAVING/HOLDING use a single easeInOut blend (smooth in both directions).
    const rawT = Math.max(0, Math.min(1, transitionProgress));
    const posBlend =
      formationState === FormationState.ENTERING ? easeOut(rawT) : easeInOut(rawT);
    const scaleBlend =
      formationState === FormationState.ENTERING ? easeOutBack(rawT) : easeInOut(rawT);
    // Color transitions on the same curve as position for visual coherence.
    const colorBlend = posBlend;

    // -- Per-cube update ---------------------------------------------
    for (let i = 0; i < COUNT; i++) {
      const c = cubes[i];
      const isMember = c.formTarget !== null;

      // Position
      if (!isFormationActive) {
        c.pos.addScaledVector(c.vel, dt * 60);
        c.pos.y += Math.sin(now * 0.0008 + c.phaseOffset) * 0.004;
        if (c.pos.x > 30)  c.pos.x = -30;
        if (c.pos.x < -30) c.pos.x = 30;
        if (c.pos.y > 20)  c.pos.y = -20;
        if (c.pos.y < -20) c.pos.y = 20;
      } else if (isMember) {
        if (formationState === FormationState.ENTERING) {
          c.pos.lerpVectors(c.driftPos, c.formTarget!, posBlend);
        } else if (formationState === FormationState.HOLDING) {
          c.pos.copy(c.formTarget!);
          // Gentle oscillation keeps cubes alive during hold.
          c.pos.x += Math.sin(now * 0.0006 + i * 0.9) * 0.06;
          c.pos.y += Math.cos(now * 0.0005 + i * 0.8) * 0.06;
        } else {
          c.pos.lerpVectors(c.driftPos, preDriftPos[i], 1 - posBlend);
        }
      } else {
        // Bystander: keep drifting while hidden.
        c.pos.addScaledVector(c.vel, dt * 60);
        if (c.pos.x > 30)  c.pos.x = -30;
        if (c.pos.x < -30) c.pos.x = 30;
        if (c.pos.y > 20)  c.pos.y = -20;
        if (c.pos.y < -20) c.pos.y = 20;
      }

      // Rotation (always spinning, even mid-formation for life)
      c.rot.x += c.rotSpeed.x * dt * 60;
      c.rot.y += c.rotSpeed.y * dt * 60;
      c.rot.z += c.rotSpeed.z * dt * 60;

      // Scale
      // Formation members: easeOutBack spring for ENTERING (pops in with
      //   slight overshoot); easeInOut for HOLDING->LEAVING (smooth exit).
      // Bystanders: shrink to near-invisible (BYSTANDER_SCALE_MIN).
      let scale = 1.0;
      if (isFormationActive) {
        if (isMember) {
          if (formationState === FormationState.ENTERING) {
            // scaleBlend can exceed 1 slightly (overshoot); allow it.
            scale = 1.0 + (FORMATION_SCALE_MAX - 1.0) * scaleBlend;
          } else if (formationState === FormationState.HOLDING) {
            scale = FORMATION_SCALE_MAX;
          } else {
            scale = 1.0 + (FORMATION_SCALE_MAX - 1.0) * posBlend;
          }
        } else {
          scale = 1.0 + (BYSTANDER_SCALE_MIN - 1.0) * posBlend;
        }
      }

      applyMatrix(i, c, scale);

      // Color: lerp from rest color to formation color on posBlend.
      const restColor = RESTING_COLORS[c.restColorIdx];
      if (isFormationActive && isMember) {
        const [rr, rg, rb] = hexToRgb(restColor);
        const [fr, fg, fb] = hexToRgb(c.formColor);
        const R = rr + (fr - rr) * colorBlend;
        const G = rg + (fg - rg) * colorBlend;
        const B = rb + (fb - rb) * colorBlend;
        // setStyle (hex) is sRGB-correct; setRGB without colorSpace arg
        // treats values as linear. We interpolate in sRGB then convert.
        tmpColor.setRGB(R, G, B, (THREE as any).SRGBColorSpace ?? 'srgb');
      } else {
        tmpColor.set(restColor);
      }
      mesh.setColorAt(i, tmpColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  tick();

  return {
    dispose() {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      bloomPass?.dispose();
      composer?.dispose();
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
      composer?.setSize(w, h);
      if (bloomPass && bloomConfig) {
        bloomPass.resolution.set(
          Math.max(1, Math.round(w * dpr * bloomConfig.resScale)),
          Math.max(1, Math.round(h * dpr * bloomConfig.resScale)),
        );
      }
    },
  };
}
