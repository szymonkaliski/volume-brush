const createVolume = require("../");
const render = require("./utils/render");

const volume = createVolume([128, 128, 128], [100, 100, 100]);

const circlePoint = ([x, y], r, a) => [
  Math.sin(a) * r + x,
  Math.cos(a) * r + y
];

console.time("brush");
for (let a = 0; a < Math.PI * 2; a += 0.05) {
  const [x, y] = circlePoint([50, 50], 40, a);

  volume.brush([x, y, 50], 10, "peak");
  volume.brush([x, 50, y], 10, "peak");
  volume.brush([50, x, y], 10, "peak");
}
console.timeEnd("brush");

console.time("mesh");
const mesh = volume.calculateMesh();
console.timeEnd("mesh");

if (process.env.EXPORT === "1") {
  console.log("export 01.obj...");
  const fs = require("fs");
  const serializeObj = require("serialize-wavefront-obj");
  const str = serializeObj(mesh.cells, mesh.positions);
  fs.writeFileSync("./export/01.obj", str, "utf-8");
} else {
  render(mesh);

  setTimeout(() => {
    window.sketchbook && window.sketchbook.shot();
  }, 200);
}
