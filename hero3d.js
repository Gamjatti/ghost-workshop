// 유령제작소 — hero 3D (Home). Concept: an AI-generated layout grid (the rough 80%)
// with ONE selected region raised + glowing + framed (the finished "마지막 20%").
import * as THREE from "three";

const el = document.getElementById("orb3d");
if (el) {
  try {
    const ball = el.querySelector(".orb3d__ball");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    cam.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    function resize() {
      const s = el.clientWidth || 420;
      renderer.setSize(s, s, false);
      cam.aspect = 1; cam.updateProjectionMatrix();
    }
    resize();

    // lights (brand)
    scene.add(new THREE.AmbientLight(0x2a3c55, 1.1));
    const l1 = new THREE.PointLight(0xff7a4a, 2.4, 0, 0); l1.position.set(3.5, 3, 5); scene.add(l1);
    const l2 = new THREE.PointLight(0x6aa0e0, 2.0, 0, 0); l2.position.set(-4, -1, 4); scene.add(l2);
    const l3 = new THREE.DirectionalLight(0xffffff, 0.5); l3.position.set(0, 4, 2); scene.add(l3);

    const group = new THREE.Group();
    scene.add(group);

    const COLS = 5, ROWS = 4, SP = 0.62, TILE = 0.5, TH = 0.12;
    // the finished 2x2 region (exactly 20% of 20 tiles)
    const DONE = new Set(["3,1", "4,1", "3,2", "4,2"]);

    const tileGeo = new THREE.BoxGeometry(TILE, TILE, TH);
    const matRough = new THREE.MeshStandardMaterial({ color: 0x16263d, roughness: 0.85, metalness: 0.1 });
    const matDone = new THREE.MeshStandardMaterial({ color: 0x2a1712, roughness: 0.32, metalness: 0.35, emissive: 0xda6a4a, emissiveIntensity: 0.55 });

    const doneTiles = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const isDone = DONE.has(c + "," + r);
        const m = new THREE.Mesh(tileGeo, isDone ? matDone : matRough);
        m.position.set((c - (COLS - 1) / 2) * SP, (r - (ROWS - 1) / 2) * SP, isDone ? 0.26 : 0);
        group.add(m);
        if (isDone) doneTiles.push(m);
      }
    }

    // selection frame around the finished region (= "여기만" / HCI selection)
    const cMin = 3, cMax = 4, rMin = 1, rMax = 2, pad = TILE / 2 + 0.07;
    const x0 = (cMin - (COLS - 1) / 2) * SP - pad, x1 = (cMax - (COLS - 1) / 2) * SP + pad;
    const y0 = (rMin - (ROWS - 1) / 2) * SP - pad, y1 = (rMax - (ROWS - 1) / 2) * SP + pad;
    const fz = 0.5;
    const framePts = [
      new THREE.Vector3(x0, y0, fz), new THREE.Vector3(x1, y0, fz),
      new THREE.Vector3(x1, y1, fz), new THREE.Vector3(x0, y1, fz), new THREE.Vector3(x0, y0, fz),
    ];
    const frame = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(framePts),
      new THREE.LineBasicMaterial({ color: 0xff8a5a, transparent: true, opacity: 0.9 })
    );
    group.add(frame);
    // corner handles
    const handleGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const handleMat = new THREE.MeshBasicMaterial({ color: 0xff8a5a });
    [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([hx, hy]) => {
      const h = new THREE.Mesh(handleGeo, handleMat);
      h.position.set(hx, hy, fz); group.add(h);
    });

    // floating particles for depth
    const N = 70, pg = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 + 1;
    }
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9fc0e8, size: 0.03, transparent: true, opacity: 0.55 })));

    // base isometric-ish tilt
    group.rotation.x = -0.62;
    group.rotation.z = 0.12;
    if (ball) ball.style.display = "none";

    // mouse parallax
    let tx = 0, ty = 0;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });

    let t = 0;
    function loop() {
      t += 0.016;
      group.rotation.z += (0.12 + tx * 0.5 - group.rotation.z) * 0.05;
      group.rotation.x += (-0.62 + ty * 0.4 - group.rotation.x) * 0.05;
      group.position.y = Math.sin(t * 0.8) * 0.12;
      const pulse = 0.26 + Math.sin(t * 1.6) * 0.06;
      doneTiles.forEach((m) => (m.position.z = pulse));
      frame.material.opacity = 0.7 + Math.sin(t * 1.6) * 0.25;
      matDone.emissiveIntensity = 0.5 + Math.sin(t * 1.6) * 0.18;
      renderer.render(scene, cam);
      if (!reduce) requestAnimationFrame(loop);
    }
    loop();
    window.addEventListener("resize", resize);
  } catch (err) {
    /* WebGL unavailable: CSS fallback ball stays visible */
  }
}
