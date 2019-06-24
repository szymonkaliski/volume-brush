const SimplexNoise = require("simplex-noise");
const taubinSmooth = require("taubin-smooth");

const createVolume = require("../");
const render = require("./utils/render");

const simplex = new SimplexNoise();
const volume = createVolume([128, 128, 128], [100, 100, 100]);

console.time("brush");
for (let x = 1; x < 99; x += 1) {
  for (let y = 1; y < 99; y += 1) {
    for (let z = 1; z < 99; z += 1) {
      const k = 0.03;
      const n = simplex.noise3D(x * k, y * k, z * k);

      if (n > 0.5) {
        volume.brush([x, y, z], 1, "peak");
      }
    }
  }
}
console.timeEnd("brush");

console.time("mesh");
const mesh = volume.calculateMesh();
mesh.positions = taubinSmooth(mesh.cells, mesh.positions, { iters: 50 });
console.timeEnd("mesh");

if (process.env.EXPORT === "1") {
  console.log("export 02.obj...");
  const fs = require("fs");
  const serializeObj = require("serialize-wavefront-obj");
  const str = serializeObj(mesh.cells, mesh.positions);
  fs.writeFileSync("./export/02.obj", str, "utf-8");
} else {
  render(mesh);

  setTimeout(() => {
    window.sketchbook && window.sketchbook.shot();
  }, 200);
}
