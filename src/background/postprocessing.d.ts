// Minimal type stubs for three/examples/jsm addons used by background.ts.
// These modules ship as plain .js with no bundled .d.ts, so we declare just
// the surface we call. Imports are inside each declare-module block (required
// for ambient module declarations in a non-module file).

declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
  import type * as THREE from 'three';
  export class EffectComposer {
    constructor(renderer: THREE.WebGLRenderer, renderTarget?: THREE.WebGLRenderTarget);
    addPass(pass: object): void;
    render(deltaTime?: number): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/RenderPass.js' {
  import type * as THREE from 'three';
  export class RenderPass {
    constructor(scene: THREE.Scene, camera: THREE.Camera);
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass.js' {
  import type * as THREE from 'three';
  export class UnrealBloomPass {
    constructor(
      resolution: THREE.Vector2,
      strength: number,
      radius: number,
      threshold: number,
    );
    strength: number;
    radius: number;
    threshold: number;
    resolution: THREE.Vector2;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/ShaderPass.js' {
  export class ShaderPass {
    constructor(shader: {
      name?: string;
      uniforms: Record<string, { value: unknown }>;
      vertexShader: string;
      fragmentShader: string;
    });
    uniforms: Record<string, { value: unknown }>;
  }
}

declare module 'three/examples/jsm/postprocessing/OutputPass.js' {
  export class OutputPass {}
}

declare module 'three/examples/jsm/shaders/VignetteShader.js' {
  export const VignetteShader: {
    name: string;
    uniforms: Record<string, { value: unknown }>;
    vertexShader: string;
    fragmentShader: string;
  };
}
