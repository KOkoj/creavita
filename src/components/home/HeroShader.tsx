'use client';

import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a,0.0,1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec3 deep = vec3(0.071, 0.067, 0.008);
  vec3 glow = vec3(0.165, 0.149, 0.086);
  vec3 accent = vec3(0.110, 0.125, 0.110);
  vec3 wash = vec3(0.086, 0.082, 0.039);
  vec2 p1 = (uv - vec2(0.88, 0.42)) / vec2(0.95, 0.80);
  float e1 = exp(-dot(p1,p1) * 2.2);
  vec2 p2 = (uv - vec2(0.04, 0.92)) / vec2(0.70, 0.60);
  float e2 = exp(-dot(p2,p2) * 2.4);
  vec2 p3 = (uv - vec2(0.38, -0.05)) / vec2(0.55, 0.45);
  float e3 = exp(-dot(p3,p3) * 2.6);
  vec3 col = mix(deep, wash, uv.x * 0.35 + 0.08 * sin(u_time * 0.07));
  col = mix(col, glow, e1 * 0.78);
  col = mix(col, accent, e2 * 0.62);
  col = mix(col, wash, e3 * 0.40);
  float n = fract(sin(dot(uv * u_res * 0.35, vec2(12.9898,78.233))) * 43758.5453);
  col += (n - 0.5) * 0.028;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

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
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    let raf = 0;
    let alive = true;
    const start = performance.now();
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = (now: number) => {
      if (!alive) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
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
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
