const SimplexNoise = require("simplex-noise");
const fs = require("fs");
const serializeObj = require("serialize-wavefront-obj");
const taubinSmooth = require("taubin-smooth");

const createVolume = require("../");

const simplex = new SimplexNoise();
const volume = createVolume([64, 64, 64], [100, 100, 100]);

const dist = (a, b) => {
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  const z = a[2] - b[2];

  return Math.sqrt(x * x + y * y + z * z);
};

console.time("brush");
for (let x = 5; x < 95; x += 2) {
  for (let y = 5; y < 95; y += 2) {
    for (let z = 5; z < 95; z += 2) {
      const k = 0.033;
      const n = simplex.noise3D(x * k, y * k, z * k);
      const d = dist([x, y, z], [50, 50, 50]);

      if (n > 0.5 && d < 50) {
        volume.brush([x, y, z], 2, 10, "peak");
      }
    }
  }
}
console.timeEnd("brush");

console.time("mesh");
const mesh = volume.calculateMesh();
mesh.positions = taubinSmooth(mesh.cells, mesh.positions, { iters: 50 });
console.timeEnd("mesh");

const str = serializeObj(mesh.cells, mesh.positions);
fs.writeFileSync("./02.obj", str, "utf-8");
