// 유령제작소 — hero 3D orb (Three.js, Home only). Falls back to CSS ball on failure.
import * as THREE from "three";

const el = document.getElementById("orb3d");
if (el) {
  try {
    const ball = el.querySelector(".orb3d__ball");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 4.4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    function resize() {
      const s = el.clientWidth || 420;
      renderer.setSize(s, s, false);
      cam.aspect = 1;
      cam.updateProjectionMatrix();
    }
    resize();

    // faceted low-poly gem
    const geo = new THREE.IcosahedronGeometry(1.35, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a2a42, metalness: 0.25, roughness: 0.4, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // wireframe shell
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.62, 1),
      new THREE.MeshBasicMaterial({ color: 0x5b8fd0, wireframe: true, transparent: true, opacity: 0.16 })
    );
    scene.add(wire);

    // brand-colored lights
    const l1 = new THREE.PointLight(0xff7a4a, 2.6, 0, 0); l1.position.set(3.2, 2.0, 4.0); scene.add(l1);
    const l2 = new THREE.PointLight(0x6aa0e0, 2.3, 0, 0); l2.position.set(-4.0, -1.4, 2.2); scene.add(l2);
    const l3 = new THREE.PointLight(0xffffff, 0.6, 0, 0); l3.position.set(0, 3, -3); scene.add(l3);
    scene.add(new THREE.AmbientLight(0x2a3c55, 1.0));

    // floating particles
    const N = 130, pg = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 2.2 + Math.random() * 1.7, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(b) * Math.cos(a);
      pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
      pos[i * 3 + 2] = r * Math.cos(b);
    }
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9fc0e8, size: 0.032, transparent: true, opacity: 0.7 }));
    scene.add(pts);

    if (ball) ball.style.display = "none";

    // mouse interaction
    let tx = 0, ty = 0;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });

    let t = 0;
    function loop() {
      t += 0.005;
      mesh.rotation.y += 0.005;
      mesh.rotation.x += (ty * 0.7 - mesh.rotation.x) * 0.06;
      mesh.rotation.z += (tx * 0.5 - mesh.rotation.z) * 0.06;
      wire.rotation.x = mesh.rotation.x;
      wire.rotation.y = -mesh.rotation.y;
      wire.rotation.z = mesh.rotation.z;
      pts.rotation.y += 0.001;
      mesh.scale.setScalar(1 + Math.sin(t) * 0.04);
      renderer.render(scene, cam);
      if (!reduce) requestAnimationFrame(loop);
    }
    loop();
    window.addEventListener("resize", resize);
  } catch (err) {
    /* WebGL unavailable: CSS fallback ball stays visible */
  }
}
