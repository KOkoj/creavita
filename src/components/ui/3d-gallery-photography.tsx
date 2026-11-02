'use client';

/**
 * InfiniteGallery — 21st.dev "3D Gallery Photography" (shadway / Jessi)
 *
 * The original lives at https://21st.dev/@moazamtrade/components/3d-gallery-photography
 * (InfiniteGallery: cloth vertex shader, depth fade/blur, autoplay, wheel hijack via
 * `document.querySelector('canvas')` + preventDefault).
 *
 * Creavita adaptations:
 *  - animation is driven by a parent 0–1 scroll progress (no wheel preventDefault)
 *  - canvas / pointer / touch-action are scoped to this instance
 *  - planes are clickable with a pointer cursor
 */
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MutableRefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

export type GalleryImageItem = {
  src: string;
  alt?: string;
  title?: string;
  href?: string;
};

type FadeSettings = {
  fadeIn: { start: number; end: number };
  fadeOut: { start: number; end: number };
};

type BlurSettings = {
  blurIn: { start: number; end: number };
  blurOut: { start: number; end: number };
  maxBlur: number;
};

export type InfiniteGalleryProps = {
  images: GalleryImageItem[];
  speed?: number;
  zSpacing?: number;
  visibleCount?: number;
  falloff?: { near: number; far: number };
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  className?: string;
  style?: CSSProperties;
  /** 0–1 page-scroll progress through the sticky section. */
  scrollProgress?: number;
  onSelect?: (image: GalleryImageItem) => void;
  onContextLost?: () => void;
  dpr?: number | [number, number];
};

type PlaneData = {
  index: number;
  z: number;
  imageIndex: number;
  x: number;
  y: number;
};

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;
/** Normalized Z of the "current" plane — close enough to read, not on the camera. */
const FOCUS = 0.4;

const DEFAULT_FADE: FadeSettings = {
  fadeIn: { start: 0.08, end: 0.2 },
  fadeOut: { start: 0.58, end: 0.78 },
};

const DEFAULT_BLUR: BlurSettings = {
  blurIn: { start: 0.0, end: 0.14 },
  blurOut: { start: 0.54, end: 0.78 },
  maxBlur: 4.0,
};

function createClothMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;
        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          flagWave += sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
        }
        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(map, vUv);
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }
        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });
}

function easeRange(
  value: number,
  start: number,
  end: number,
  from: number,
  to: number
) {
  if (end <= start) return to;
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return from + (to - from) * t;
}

function ImagePlane({
  planeIndex,
  material,
  planesRef,
  images,
  textures,
  depthRange,
  onSelect,
}: {
  planeIndex: number;
  material: THREE.ShaderMaterial;
  planesRef: MutableRefObject<PlaneData[]>;
  images: GalleryImageItem[];
  textures: THREE.Texture[];
  depthRange: number;
  onSelect?: (image: GalleryImageItem) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const gl = useThree((state) => state.gl);

  const setHover = useCallback(
    (hovered: boolean) => {
      if (material.uniforms.isHovered) {
        material.uniforms.isHovered.value = hovered ? 1 : 0;
      }
      gl.domElement.style.cursor = hovered ? 'pointer' : 'auto';
    },
    [gl, material]
  );

  useEffect(() => {
    return () => {
      if (gl.domElement.style.cursor === 'pointer') {
        gl.domElement.style.cursor = 'auto';
      }
    };
  }, [gl]);

  useFrame(() => {
    const mesh = meshRef.current;
    const plane = planesRef.current[planeIndex];
    if (!mesh || !plane) return;
    const halfRange = depthRange / 2;
    mesh.position.set(plane.x, plane.y, plane.z - halfRange);
    const texture = textures[plane.imageIndex];
    const image = texture?.image as { width?: number; height?: number } | undefined;
    const aspect = image?.width && image?.height ? image.width / image.height : 1;
    if (aspect > 1) mesh.scale.set(2.35 * aspect, 2.35, 1);
    else mesh.scale.set(2.35, 2.35 / aspect, 1);
  });

  return (
    <mesh
      ref={meshRef}
      material={material}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = pointerStart.current;
        pointerStart.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (dx * dx + dy * dy > 36) return;
        const image = images[planesRef.current[planeIndex]?.imageIndex ?? 0];
        if (image) onSelect?.(image);
      }}
    >
      <planeGeometry args={[1, 1, 24, 24]} />
    </mesh>
  );
}

function GalleryScene({
  images,
  visibleCount,
  scrollProgress,
  fadeSettings,
  blurSettings,
  onSelect,
  onContextLost,
}: {
  images: GalleryImageItem[];
  visibleCount: number;
  scrollProgress: number;
  fadeSettings: FadeSettings;
  blurSettings: BlurSettings;
  onSelect?: (image: GalleryImageItem) => void;
  onContextLost?: () => void;
}) {
  const gl = useThree((state) => state.gl);
  const progressRef = useRef(scrollProgress);
  const playheadRef = useRef(-1);
  const forceRef = useRef(0);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = 'pan-y';
    const onLost = (event: Event) => {
      event.preventDefault();
      onContextLost?.();
    };
    canvas.addEventListener('webglcontextlost', onLost, { passive: false });
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
    };
  }, [gl, onContextLost]);

  const urls = useMemo(() => images.map((image) => image.src), [images]);
  const loaded = useTexture(urls);
  const textures = useMemo(
    () => (Array.isArray(loaded) ? loaded : [loaded]),
    [loaded]
  );

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    });
  }, [textures]);

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount]
  );

  useEffect(() => {
    return () => {
      materials.forEach((material) => material.dispose());
    };
  }, [materials]);

  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < visibleCount; i += 1) {
      if (i === 0) {
        positions.push({ x: 0, y: 0.08 });
        continue;
      }
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;
      positions.push({
        x: (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) / 3,
        y: (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4,
      });
    }
    return positions;
  }, [visibleCount]);

  const depthRange = DEFAULT_DEPTH_RANGE;
  const totalImages = images.length;

  const planesRef = useRef<PlaneData[]>(
    Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }))
  );

  useEffect(() => {
    planesRef.current = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }));
  }, [depthRange, spatialPositions, totalImages, visibleCount]);

  useFrame((state, delta) => {
    const totalRange = depthRange;
    const target = progressRef.current * Math.max(totalImages - 0.001, 1);
    if (playheadRef.current < 0) playheadRef.current = target;
    const previous = playheadRef.current;
    const next = previous + (target - previous) * Math.min(1, delta * 5.5);
    forceRef.current = forceRef.current * 0.86 + (next - previous) * 6;
    playheadRef.current = next;
    const time = state.clock.getElapsedTime();
    const baseIndex = Math.floor(next);
    const frac = next - baseIndex;

    planesRef.current.forEach((plane, i) => {
      if (totalImages > 0) {
        plane.imageIndex = ((baseIndex + i) % totalImages + totalImages) % totalImages;
      }
      const slot = (i - frac + visibleCount) % visibleCount;
      const normalized = (slot / Math.max(visibleCount, 1) + FOCUS) % 1;
      plane.z = normalized * totalRange;
      plane.x = spatialPositions[i]?.x ?? 0;
      plane.y = spatialPositions[i]?.y ?? 0;

      const normalizedPosition = plane.z / totalRange;
      let opacity = 1;
      if (normalizedPosition < fadeSettings.fadeIn.start) opacity = 0;
      else if (normalizedPosition <= fadeSettings.fadeIn.end) {
        opacity = easeRange(
          normalizedPosition,
          fadeSettings.fadeIn.start,
          fadeSettings.fadeIn.end,
          0,
          1
        );
      } else if (normalizedPosition >= fadeSettings.fadeOut.end) opacity = 0;
      else if (normalizedPosition >= fadeSettings.fadeOut.start) {
        opacity = easeRange(
          normalizedPosition,
          fadeSettings.fadeOut.start,
          fadeSettings.fadeOut.end,
          1,
          0
        );
      }

      let blur = 0;
      if (normalizedPosition < blurSettings.blurIn.start) blur = blurSettings.maxBlur;
      else if (normalizedPosition <= blurSettings.blurIn.end) {
        blur = easeRange(
          normalizedPosition,
          blurSettings.blurIn.start,
          blurSettings.blurIn.end,
          blurSettings.maxBlur,
          0
        );
      } else if (normalizedPosition >= blurSettings.blurOut.end) {
        blur = blurSettings.maxBlur;
      } else if (normalizedPosition >= blurSettings.blurOut.start) {
        blur = easeRange(
          normalizedPosition,
          blurSettings.blurOut.start,
          blurSettings.blurOut.end,
          0,
          blurSettings.maxBlur
        );
      }

      const material = materials[i];
      const texture = textures[plane.imageIndex];
      if (material?.uniforms) {
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = forceRef.current;
        material.uniforms.opacity.value = opacity;
        material.uniforms.blurAmount.value = blur;
        if (texture && material.uniforms.map.value !== texture) {
          material.uniforms.map.value = texture;
        }
      }
    });
  });

  if (images.length === 0) return null;

  return (
    <>
      {materials.map((material, i) => (
        <ImagePlane
          key={i}
          planeIndex={i}
          material={material}
          planesRef={planesRef}
          images={images}
          textures={textures}
          depthRange={depthRange}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

export default function InfiniteGallery({
  images,
  className = 'h-full w-full',
  style,
  visibleCount = 10,
  scrollProgress = 0,
  fadeSettings = DEFAULT_FADE,
  blurSettings = DEFAULT_BLUR,
  onSelect,
  onContextLost,
  dpr = [1, 1.5],
}: InfiniteGalleryProps) {
  const count = Math.max(4, Math.min(visibleCount, Math.max(images.length, 4)));
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapperRef}
      className={cn('relative h-full w-full', className)}
      style={{ touchAction: 'pan-y', ...style }}
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 50, near: 0.1, far: 80 }}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ touchAction: 'pan-y' }}
        eventSource={wrapperRef}
        eventPrefix="client"
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'pan-y';
        }}
      >
        <Suspense fallback={null}>
          <GalleryScene
            images={images}
            visibleCount={count}
            scrollProgress={scrollProgress}
            fadeSettings={fadeSettings}
            blurSettings={blurSettings}
            onSelect={onSelect}
            onContextLost={onContextLost}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
