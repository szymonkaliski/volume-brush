// const fs = require("fs");
// const serializeObj = require("serialize-wavefront-obj");

const createVolume = require("../");
const render = require("./utils/render");

const volume = createVolume([64, 64, 64], [100, 100, 100]);

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

render(mesh);

// const str = serializeObj(mesh.cells, mesh.positions);
// fs.writeFileSync("./01.obj", str, "utf-8");
