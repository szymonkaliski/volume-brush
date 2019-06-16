const serializeObj = require("serialize-wavefront-obj");
const fs = require("fs");

const createVolume = require("../");

const volume = createVolume([64, 64, 64], [100, 100, 100]);

// volume.brush([0, 0, 0], 10);
// volume.brush([50, 50, 50], 10);
// volume.brush([99, 99, 99], 10);



volume.brush([50, 50, 50], 60);
volume.brush([70, 70, 70], 10, -1.0);

const mesh = volume.calculateMesh();

const str = serializeObj(mesh.cells, mesh.positions);
fs.writeFileSync("./01.obj", str, "utf-8");
