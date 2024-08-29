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

// Function drone

export function createDrone(scene, camera) {
  const droneGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const droneMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const drone = new THREE.Mesh(droneGeometry, droneMaterial);
  
  function updateDronePosition() {
    // Get current time in seconds
    const time = performance.now() * 0.001;

    // Calculate the camera's right direction
    const cameraRight = new THREE.Vector3();
    camera.getWorldDirection(cameraRight);
    cameraRight.cross(camera.up).normalize();

    // Create a smooth left-right oscillation
    const oscillation = Math.sin(time * .5) * 0.2; // Adjust multipliers to change speed and range

    // Position the drone relative to the camera
    drone.position.copy(camera.position)
      .add(cameraRight.multiplyScalar(.8 + oscillation))  // Move right and oscillate
      .add(camera.up.clone().multiplyScalar(1.8))  // Move up
      .add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3));  // Move in front

    // Add a slight up-down movement
    drone.position.y += Math.sin(time * 3) * 0.1;

    // Make the drone rotate slightly
    drone.rotation.y = time * 0.5;

    drone.lookAt(camera.position);
  }

  scene.add(drone);
  return { drone, updateDronePosition };
}
