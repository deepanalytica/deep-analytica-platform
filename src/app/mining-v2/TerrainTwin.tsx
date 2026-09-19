"use client";

import { PointerEvent, WheelEvent, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type Layer = "terrain" | "geology" | "mineral" | "water";
type Mode = "surface" | "section" | "underground";

const VERTEX = `
attribute vec3 aPosition;
uniform mat4 uMvp;
varying float vHeight;
varying vec3 vWorld;
void main() {
  vHeight = aPosition.y;
  vWorld = aPosition;
  gl_Position = uMvp * vec4(aPosition, 1.0);
}
`;

const FRAGMENT = `
precision mediump float;
varying float vHeight;
varying vec3 vWorld;
uniform float uLayer;
uniform float uMode;

float gauss(vec2 p, vec2 c, float k) {
  vec2 d = p - c;
  return exp(-dot(d,d) * k);
}

void main() {
  if (uMode > 0.5 && uMode < 1.5 && vWorld.x > 0.10) discard;

  float h = clamp((vHeight + 0.35) / 0.8, 0.0, 1.0);
  vec3 base = mix(vec3(0.035,0.055,0.060), vec3(0.28,0.33,0.29), h);
  float ore = gauss(vWorld.xz, vec2(-0.18, 0.05), 8.0) + 0.75 * gauss(vWorld.xz, vec2(0.32,-0.20), 13.0);
  float water = gauss(vWorld.xz, vec2(0.10,0.28), 9.0) + 0.4 * gauss(vWorld.xz, vec2(-0.48,-0.16), 20.0);
  float bands = 0.5 + 0.5 * sin((vWorld.x * 9.0 + vWorld.z * 5.0 + vHeight * 8.0));

  vec3 color = base;
  if (uLayer > 0.5 && uLayer < 1.5) color = mix(vec3(0.09,0.13,0.15), vec3(0.62,0.42,0.22), bands * 0.72);
  if (uLayer > 1.5 && uLayer < 2.5) color = mix(base * 0.45, vec3(0.95,0.35,0.12), clamp(ore, 0.0, 1.0));
  if (uLayer > 2.5) color = mix(base * 0.52, vec3(0.02,0.55,0.82), clamp(water, 0.0, 1.0));

  if (uMode > 1.5) {
    color = mix(vec3(0.012,0.022,0.028), vec3(0.15,0.75,0.68), clamp(ore * 1.25, 0.0, 1.0));
  }

  float grid = step(0.97, abs(sin(vWorld.x * 34.0))) + step(0.97, abs(sin(vWorld.z * 34.0)));
  color += min(grid, 1.0) * 0.045;
  gl_FragColor = vec4(color, 1.0);
}
`;

function perspective(fov: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      out[c + r * 4] =
        a[r * 4] * b[c] +
        a[r * 4 + 1] * b[c + 4] +
        a[r * 4 + 2] * b[c + 8] +
        a[r * 4 + 3] * b[c + 12];
    }
  }
  return out;
}

function rotationX(a: number) {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1]);
}

function rotationY(a: number) {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1]);
}

function translation(z: number) {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-0.18,z,1]);
}

function terrain(size = 72) {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let z = 0; z < size; z += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = (x / (size - 1) - 0.5) * 2.35;
      const pz = (z / (size - 1) - 0.5) * 1.75;
      const ridge = 0.15 * Math.sin(px * 4.2) + 0.11 * Math.cos(pz * 6.0);
      const folded = 0.06 * Math.sin((px + pz) * 9.0);
      const pit = -0.22 * Math.exp(-((px - 0.12) ** 2 + (pz + 0.03) ** 2) * 6.5);
      positions.push(px, ridge + folded + pit, pz);
    }
  }
  for (let z = 0; z < size - 1; z += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const i = z * size + x;
      indices.push(i, i + 1, i + size, i + 1, i + size + 1, i + size);
    }
  }
  return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
}

export default function TerrainTwin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef({ active: false, x: 0, y: 0 });
  const [layer, setLayer] = useState<Layer>("mineral");
  const [mode, setMode] = useState<Mode>("surface");
  const [yaw, setYaw] = useState(-0.35);
  const [pitch, setPitch] = useState(-0.82);
  const [zoom, setZoom] = useState(-2.7);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    gl.useProgram(program);

    const mesh = terrain();
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    const mvpLoc = gl.getUniformLocation(program, "uMvp");
    const layerLoc = gl.getUniformLocation(program, "uLayer");
    const modeLoc = gl.getUniformLocation(program, "uMode");
    const layerIndex = { terrain: 0, geology: 1, mineral: 2, water: 3 }[layer];
    const modeIndex = { surface: 0, section: 1, underground: 2 }[mode];

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.018, 0.03, 0.036, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projection = perspective(Math.PI / 3.1, canvas.width / canvas.height, 0.1, 20);
    const modelView = multiply(translation(zoom), multiply(rotationX(pitch), rotationY(yaw)));
    const mvp = multiply(projection, modelView);

    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.uniform1f(layerLoc, layerIndex);
    gl.uniform1f(modeLoc, modeIndex);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
  }, [layer, mode, yaw, pitch, zoom]);

  function pointerDown(event: PointerEvent<HTMLCanvasElement>) {
    drag.current = { active: true, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { active: true, x: event.clientX, y: event.clientY };
    setYaw((value) => value + dx * 0.008);
    setPitch((value) => Math.max(-1.45, Math.min(-0.2, value + dy * 0.006)));
  }

  function pointerUp() {
    drag.current.active = false;
  }

  function wheel(event: WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    setZoom((value) => Math.max(-4.8, Math.min(-1.55, value + event.deltaY * 0.002)));
  }

  return (
    <div className={styles.twin}>
      <canvas
        ref={canvasRef}
        className={styles.twinCanvas}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onWheel={wheel}
      />

      <div className={styles.twinTop}>
        <div>
          <span>GEO / TEMPORAL TWIN</span>
          <strong>Territorio, operación y futuro en un solo lienzo</strong>
        </div>
        <div className={styles.segmented}>
          {(["surface","section","underground"] as Mode[]).map((item) => (
            <button key={item} onClick={() => setMode(item)} className={mode === item ? styles.selected : ""}>
              {item === "surface" ? "Superficie" : item === "section" ? "Sección" : "Subsuelo"}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layerDock}>
        {(["terrain","geology","mineral","water"] as Layer[]).map((item) => (
          <button key={item} onClick={() => setLayer(item)} className={layer === item ? styles.selected : ""}>
            <i />
            {item === "terrain" ? "Terreno" : item === "geology" ? "Geología" : item === "mineral" ? "Mineralización" : "Agua"}
          </button>
        ))}
      </div>

      <div className={styles.twinMarker} style={{ left: "32%", top: "39%" }}>
        <span />
        <b>Target Norte</b>
        <small>Hipótesis · confianza moderada</small>
      </div>
      <div className={styles.twinMarker} style={{ left: "55%", top: "57%" }}>
        <span />
        <b>Pit actual</b>
        <small>Operación · observado</small>
      </div>
      <div className={styles.twinMarker} style={{ left: "70%", top: "45%" }}>
        <span />
        <b>Expansión F4</b>
        <small>Escenario · condicionado</small>
      </div>

      <div className={styles.twinLegend}>
        <span>DEMO TERRAIN</span>
        <small>Arrastrar para orbitar · rueda para zoom · conectar Deep Geo para geometría real</small>
      </div>
    </div>
  );
}
