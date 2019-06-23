// const fs = require("fs");
// const serializeObj = require("serialize-wavefront-obj");

const SimplexNoise = require("simplex-noise");
const taubinSmooth = require("taubin-smooth");

const createVolume = require("../");
const render = require("./utils/render");

const simplex = new SimplexNoise();
const volume = createVolume([64, 64, 64], [100, 100, 100]);

const ITERS = 10000;
const MOD_VEL = 0.5;
const MOD_DIR = 0.5;
const NUM_POINTS = 30;

const range = length => Array.from({ length }, (_, i) => i);
const rand = (a, b) => Math.random() * (b - a) + a;

const dist = (a, b) => {
  const x = a[0] - b[0];
  const y = a[1] - b[1];

  return Math.sqrt(x * x + y * y);
};

const points = range(NUM_POINTS).map(i => ({
  pos: [rand(40, 50), rand(40, 50), i * 2 + 10],
  vel: [0, 0]
}));

console.time("brush");
for (let iter = 0; iter < ITERS; iter++) {
  for (point of points) {
    const k = 0.02;
    const noise = simplex.noise3D(
      point.pos[0] * k,
      point.pos[1] * k,
      point.pos[2]
    );
    const angle = noise * 2 * Math.PI;
    const dir = [Math.sin(angle), Math.cos(angle)];

    point.vel[0] += dir[0] * MOD_DIR;
    point.vel[1] += dir[1] * MOD_DIR;

    point.vel[0] *= MOD_VEL;
    point.vel[1] *= MOD_VEL;

    point.pos[0] += point.vel[0];
    point.pos[1] += point.vel[1];

    if (dist([point.pos[0], point.pos[1]], [50, 50]) < 50) {
      volume.brush(
        [point.pos[0], point.pos[1], (point.pos[2] / NUM_POINTS) * 5 + 25],
        2,
        1,
        "peak"
      );
    }
  }
}
console.timeEnd("brush");

console.time("mesh");
const mesh = volume.calculateMesh();
mesh.positions = taubinSmooth(mesh.cells, mesh.positions, { iters: 20 });
console.timeEnd("mesh");

render(mesh);

// const str = serializeObj(mesh.cells, mesh.positions);
// fs.writeFileSync("./03.obj", str, "utf-8");
