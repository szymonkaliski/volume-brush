const OrbitControls = require("three-orbitcontrols");
const THREE = require("three");

const SimplicialComplex = require("three-simplicial-complex")(THREE);

module.exports = ({ positions, cells }) => {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = 0;
  renderer.domElement.style.left = 0;

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = false;
  orbitControls.enableZoom = true;

  const scene = new THREE.Scene();

  const geometry = new SimplicialComplex({ positions, cells });
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0x999999,
      roughness: 0.1,
      metalness: 0.1
    })
  );
  scene.add(mesh);

  const ambient = new THREE.AmbientLight(0xeeeeee);
  scene.add(ambient);

  const spot = new THREE.SpotLight();
  spot.position.set(0, 200, 200);
  scene.add(spot);

  const loop = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("resize", onWindowResize, false);

  loop();
};
