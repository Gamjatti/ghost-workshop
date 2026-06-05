// 유령제작소 — hero 3D (Home): translucent glass knot, brand-tinted.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const el = document.getElementById("orb3d");
if (el) {
  try {
    const ball = el.querySelector(".orb3d__ball");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    cam.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    function resize() {
      const s = el.clientWidth || 420;
      renderer.setSize(s, s, false);
      cam.aspect = 1; cam.updateProjectionMatrix();
    }
    resize();

    // studio environment so the glass has something to refract / reflect
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // tinted glass crystal — visible body + transmission + iridescence
    const geo = new THREE.TorusKnotGeometry(0.8, 0.34, 220, 36);
    const mat = new THREE.MeshPhysicalMaterial({
      transmission: 0.55, thickness: 2.2, roughness: 0.12, ior: 1.45, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.06, transparent: true,
      color: 0x33538a, attenuationColor: 0xda6a4a, attenuationDistance: 0.7,
      iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 420],
      envMapIntensity: 1.6,
    });
    const knot = new THREE.Mesh(geo, mat);
    scene.add(knot);

    // brand-colored rim lights for glints
    const l1 = new THREE.PointLight(0xff7a4a, 26, 0, 2); l1.position.set(3, 2, 3); scene.add(l1);
    const l2 = new THREE.PointLight(0x6aa0e0, 22, 0, 2); l2.position.set(-3, -1.5, 2.5); scene.add(l2);
    const l3 = new THREE.DirectionalLight(0xffffff, 0.9); l3.position.set(0, 3, 4); scene.add(l3);

    if (ball) ball.style.display = "none";

    let tx = 0, ty = 0;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });

    let t = 0;
    function loop() {
      t += 0.01;
      knot.rotation.y += 0.006;
      knot.rotation.x += (ty * 0.7 - knot.rotation.x) * 0.05;
      knot.rotation.z += (tx * 0.4 - knot.rotation.z) * 0.05;
      knot.position.y = Math.sin(t) * 0.08;
      renderer.render(scene, cam);
      if (!reduce) requestAnimationFrame(loop);
    }
    loop();
    window.addEventListener("resize", resize);
  } catch (err) {
    /* WebGL/addons unavailable: CSS fallback ball stays visible */
  }
}
