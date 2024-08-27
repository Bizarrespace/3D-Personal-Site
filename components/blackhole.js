import * as THREE from 'three';

export function createBlackHole(scene) {
  const group = new THREE.Group();

  // Create the event horizon (black sphere)
  const horizonGeometry = new THREE.SphereGeometry(5, 32, 32);
  const horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
  group.add(horizon);

  // Create the accretion disk
  const diskGeometry = new THREE.RingGeometry(5.5, 12, 64);
  const diskTexture = new THREE.CanvasTexture(generateDiskTexture());
  const diskMaterial = new THREE.MeshBasicMaterial({
    map: diskTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
  });
  const disk = new THREE.Mesh(diskGeometry, diskMaterial);
  disk.rotation.x = Math.PI / 1.5;
  group.add(disk);

  // Create the gravitational lensing effect
  const lensGeometry = new THREE.SphereGeometry(5.5, 32, 32);
  const lensMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        float alpha = smoothstep(0.5, 0.35, dist);
        vec3 color = mix(vec3(0.0), vec3(0.1, 0.2, 0.3), dist * 2.0);
        gl_FragColor = vec4(color, alpha * (0.8 + 0.2 * sin(time)));
      }
    `,
    transparent: true,
    side: THREE.BackSide
  });
  const lens = new THREE.Mesh(lensGeometry, lensMaterial);
  group.add(lens);

  scene.add(group);

  return group;
}

function generateDiskTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, 'rgba(255, 120, 0, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 50, 0, 1)');
  gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  return canvas;
}