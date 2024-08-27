import * as THREE from 'three'


// Create Long object
export function createLong(scene) {
    const longTexture = new THREE.TextureLoader().load("images/Long.jpg");
    const long = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.MeshBasicMaterial({ map: longTexture })
    );
    long.position.set(2, 0, -5);
    scene.add(long);
    return long;
  }
  
// Create moon object
export function createMoon(scene) {
const moonTexture = new THREE.TextureLoader().load("images/Moon.png");
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(6, 32, 32),
    new THREE.MeshBasicMaterial({ map: moonTexture })
);
moon.position.set(-30, 0, 30);
scene.add(moon);
return moon;
}