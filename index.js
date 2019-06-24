const isosurface = require("isosurface");
const { PointOctree } = require("sparse-octree");
const { Vector3 } = require("math-ds");

const brushes = {
  additive: (prev, curr) => prev + curr,
  peak: (prev, curr) => Math.max(prev, curr),
  replace: (_, curr) => curr
};

module.exports = (resolution, scale) => {
  const [resX, resY, resZ] = resolution;
  const [scaleX, scaleY, scaleZ] = scale || resultion;

  const octree = new PointOctree(
    new Vector3(0, 0, 0),
    new Vector3(resX, resY, resZ)
  );

  const updateVoxel = ([x, y, z], newVal, brushMode) => {
    const vec = new Vector3(x, y, z);
    const val = octree.fetch(vec);

    octree.put(vec, brushes[brushMode](val, newVal));
  };

  const brush = (pos, radius, density, brushMode) => {
    if (!density && !brushMode) {
      density = 1;
      brushMode = "additive";
    }

    if (!brushMode && density) {
      if (typeof density === "string") {
        brushMode = density;
        density = 1;
      } else {
        brushMode = "additive";
      }
    }

    let [cx, cy, cz] = pos;

    cx = (cx / scale[0]) * resolution[0];
    cy = (cy / scale[1]) * resolution[1];
    cz = (cz / scale[2]) * resolution[2];

    const cellRadiusX = (radius / scaleX) * resX + 1;
    const cellRadiusY = (radius / scaleY) * resY + 1;
    const cellRadiusZ = (radius / scaleZ) * resZ + 1;

    const stretchY = cellRadiusX / cellRadiusY;
    const stretchZ = cellRadiusX / cellRadiusZ;

    const minX = Math.max(Math.round(cx - cellRadiusX), 0);
    const minY = Math.max(Math.round(cy - cellRadiusY), 0);
    const minZ = Math.max(Math.round(cz - cellRadiusZ), 0);
    const maxX = Math.min(Math.round(cx + cellRadiusX), resX);
    const maxY = Math.min(Math.round(cy + cellRadiusY), resY);
    const maxZ = Math.min(Math.round(cz + cellRadiusZ), resZ);

    for (let z = minZ; z < maxZ; z++) {
      let dz = (z - cz) * stretchZ;
      dz *= dz;

      for (let y = minY; y < maxY; y++) {
        let dyz = (y - cy) * stretchY;
        dyz = dyz * dyz + dz;

        for (let x = minX; x < maxX; x++) {
          const dx = x - cx;
          const d = Math.sqrt(dx * dx + dyz);

          if (d <= cellRadiusX) {
            const cellVal = (1 - d / cellRadiusX) * density;
            updateVoxel([x, y, z], cellVal, brushMode);
          }
        }
      }
    }
  };

  const calculateMesh = (k = 0.5) => {
    const complex = isosurface.surfaceNets(resolution, (x, y, z) => {
      const val = octree.fetch(new Vector3(x, y, z)) || 0;
      return k - val;
    });

    for (let i = 0; i < complex.positions.length; i++) {
      complex.positions[i][0] =
        ((complex.positions[i][0] - resolution[0] / 2) / resolution[0]) *
        scale[0];
      complex.positions[i][1] =
        ((complex.positions[i][1] - resolution[1] / 2) / resolution[1]) *
        scale[1];
      complex.positions[i][2] =
        ((complex.positions[i][2] - resolution[2] / 2) / resolution[2]) *
        scale[2];
    }

    return complex;
  };

  return {
    octree,
    brush,
    calculateMesh
  };
};
