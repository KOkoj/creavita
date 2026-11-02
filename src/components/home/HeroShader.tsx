'use client';

import { useEffect, useRef } from 'react';
import { projects } from '@/data/projects';
import { applyPalette, paletteFromImage, DEFAULT_PALETTE } from '@/lib/atmosphere';

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a,0.0,1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform vec3 u_deep;
uniform vec3 u_glow;
uniform vec3 u_accent;
uniform vec3 u_wash;

float ellipseD(vec2 uv, vec2 center, vec2 radius){
  vec2 p = (uv - center) / radius;
  return length(p);
}

float stop5(float d, float p0, float p1, float p2, float p3, float p4, float a0, float a1, float a2, float a3, float a4){
  if(d <= p0) return a0;
  if(d <= p1) return mix(a0, a1, (d - p0) / max(p1 - p0, 0.0001));
  if(d <= p2) return mix(a1, a2, (d - p1) / max(p2 - p1, 0.0001));
  if(d <= p3) return mix(a2, a3, (d - p2) / max(p3 - p2, 0.0001));
  if(d <= p4) return mix(a3, a4, (d - p3) / max(p4 - p3, 0.0001));
  return a4;
}

vec3 stopLin(float t, vec3 c0, vec3 c1, vec3 c2, vec3 c3, vec3 c4, vec3 c5){
  if(t <= 0.22) return mix(c0, c1, t / 0.22);
  if(t <= 0.40) return mix(c1, c2, (t - 0.22) / 0.18);
  if(t <= 0.58) return mix(c2, c3, (t - 0.40) / 0.18);
  if(t <= 0.74) return mix(c3, c4, (t - 0.58) / 0.16);
  return mix(c4, c5, (t - 0.74) / 0.26);
}

void main(){
  vec2 css = vec2(gl_FragCoord.x / u_res.x, 1.0 - gl_FragCoord.y / u_res.y);
  float angle = 148.0 * 3.14159265 / 180.0;
  vec2 dir = vec2(sin(angle), -cos(angle));
  float proj = dot(css - vec2(0.5), dir);
  float maxProj = abs(dir.x) * 0.5 + abs(dir.y) * 0.5;
  float t = clamp((proj + maxProj) / (2.0 * maxProj), 0.0, 1.0);
  vec3 washDeep = mix(u_deep, u_wash, 0.55);
  vec3 accentWash = mix(u_wash, u_accent, 0.40);
  vec3 accentDeep = mix(u_deep, u_accent, 0.55);
  vec3 col = stopLin(t, u_deep, washDeep, u_wash, accentWash, accentDeep, u_deep);

  float dWash = ellipseD(css, vec2(0.38, -0.05), vec2(0.55, 0.45));
  float aWash = stop5(dWash, 0.0, 0.34, 0.68, 1.0, 1.0, 0.48, 0.22, 0.0, 0.0, 0.0);
  col = mix(col, u_wash, aWash);

  float dAccent = ellipseD(css, vec2(0.04, 0.92), vec2(0.70, 0.60));
  float aAccent = stop5(dAccent, 0.0, 0.28, 0.48, 0.62, 1.0, 0.62, 0.32, 0.10, 0.0, 0.0);
  col = mix(col, u_accent, aAccent);

  float dGlow = ellipseD(css, vec2(0.88, 0.42), vec2(0.95, 0.80));
  float aGlow = stop5(dGlow, 0.0, 0.22, 0.42, 0.58, 0.72, 0.78, 0.48, 0.22, 0.06, 0.0);
  col = mix(col, u_glow, aGlow);

  gl_FragColor = vec4(col, 1.0);
}
`;

function parseRgb(value: string): [number, number, number] {
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = v.match(/rgba?\(\s*([\d.]+)[,\s/]+([\d.]+)[,\s/]+([\d.]+)/i);
  if (!m) return [18 / 255, 17 / 255, 2 / 255];
  return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
}

export default function HeroShader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    applyPalette(root, DEFAULT_PALETTE);
    let token = 0;
    const paint = async (src?: string) => {
      const id = ++token;
      const palette = src ? await paletteFromImage(src) : DEFAULT_PALETTE;
      if (id !== token) return;
      applyPalette(rootRef.current, palette);
    };
    const first = projects[0]?.images[0]?.src;
    if (first) paint(first);
    const onAtmosphere = (e: Event) => {
      const src = (e as CustomEvent<{ src?: string }>).detail?.src;
      if (src) paint(src);
    };
    window.addEventListener('cv-atmosphere', onAtmosphere);
    return () => window.removeEventListener('cv-atmosphere', onAtmosphere);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) return;
    root?.classList.add('is-gl');

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      root?.classList.remove('is-gl');
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uDeep = gl.getUniformLocation(prog, 'u_deep');
    const uGlow = gl.getUniformLocation(prog, 'u_glow');
    const uAccent = gl.getUniformLocation(prog, 'u_accent');
    const uWash = gl.getUniformLocation(prog, 'u_wash');

    let raf = 0;
    let alive = true;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = () => {
      if (!alive) return;
      const styles = getComputedStyle(root ?? document.documentElement);
      const deep = parseRgb(styles.getPropertyValue('--page-deep') || 'rgb(18, 17, 2)');
      const glow = parseRgb(styles.getPropertyValue('--page-glow') || 'rgb(42, 38, 22)');
      const accent = parseRgb(styles.getPropertyValue('--page-accent') || 'rgb(28, 32, 28)');
      const wash = parseRgb(styles.getPropertyValue('--page-wash') || 'rgb(22, 21, 10)');
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform3f(uDeep, deep[0], deep[1], deep[2]);
      gl.uniform3f(uGlow, glow[0], glow[1], glow[2]);
      gl.uniform3f(uAccent, accent[0], accent[1], accent[2]);
      gl.uniform3f(uWash, wash[0], wash[1], wash[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(draw);
    };
    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      root?.classList.remove('is-gl');
    };
  }, []);

  return (
    <div className="cv-shader" ref={rootRef} aria-hidden="true">
      <div className="cv-shader__field" />
      <canvas ref={canvasRef} />
      <div className="cv-shader__noise" />
    </div>
  );
}
