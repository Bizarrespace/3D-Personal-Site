// Import necessary modules and styles
import './style.css'
import * as THREE from 'three';
import { createBlackHole } from './components/blackhole';
import { createStarField } from './components/starfield';
import { createLong, createMoon } from './components/normalObject'
import { createProjectObjects } from './components/projectObjects';
import { createSpaceBackground } from './components/createSpaceBackground';

// Initialize the scene, camera, and renderer
function initializeScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
  });
  
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  return { scene, camera, renderer };
}

// Handle camera movement on scroll
function animateOnScroll(camera, long, moon, projectObjects, t) {

  long.rotation.y += 0.01;
  long.rotation.z += 0.01;

  moon.position.x = (t * -0.02) - 70; // Want to make it responsive with scrolling, right now it just moves to the right whenever the user scrolls either left or right
  moon.position.y = (t * -0.02) - 70;

 //console.log(t);

  camera.position.z = t * -0.02;
  camera.position.x = t * -0.002;
  camera.rotation.y = t * -0.00010;

  

  // Debug output
  // console.log('Camera position:', 
  //   'x:', camera.position.x.toFixed(2), 
  //   'y:', camera.position.y.toFixed(2), 
  //   'z:', camera.position.z.toFixed(2)
  // );

  
  // Update where HTML element (div) appears on the screen to match 3D object
  projectObjects.forEach((po) => {
    // Figure out where 3D object would appear on the 2D screen
    const screenPosition = po.mesh.position.clone().project(camera);

    // Convert screen position to actual pixel locations
    const translateX = (screenPosition.x * 3 + 0.5) * window.innerWidth;
    const translateY = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;
    console.log("OBJECT")
    console.log(translateX)
    console.log(translateY)


    // Move the div to the right spot on the screen
    // This makes it look like the div is attach to the 3D object
    po.element.style.transform = `translate(${translateX}px, ${translateY}px)`;

  });
}

// Main animation loop
// Asking browser to execute animate function before next screen repaint, recursive 
// function to do this about 60 times a second
function animate(renderer, scene, camera, blackHole, moon, starField, updateSkyPosition, projectObjects) {
  requestAnimationFrame(() => animate(renderer, scene, camera, blackHole, moon, starField, updateSkyPosition, projectObjects));

  // Black hole's lensing effect:
  blackHole.children[2].material.uniforms.time.value += 0.01;

  moon.rotation.y += 0.003;
  moon.rotation.x += 0.0005;
  
  starField.rotation.y += 0.00009;

  
  // Get the current time in seconds
  const time = Date.now() * 0.001;

  // Rotate the project objects
  projectObjects.forEach((po, index) => {
    // Create a smooth oscillation using sine
    // The multiplier 0.5 determines the speed of oscillation
    const baseRotation = Math.sin(time * 3 + index);
    
    // Adjust the rotation range to favor the right side
    // This will make the rotation range approximately -5 to +15 degrees
    const adjustedRotation = (baseRotation * 0.175) + 0.5;
    
    // Apply the rotation to the y-axis of the object
    po.mesh.rotation.y = adjustedRotation;
  });

  updateSkyPosition();
  renderer.render(scene, camera);
}

// Main function to set up the scene
function main() {
  const { scene, camera, renderer } = initializeScene();
  const blackHole = createBlackHole(scene);
  const starField = createStarField(scene);
  const updateSkyPosition = createSpaceBackground(scene, camera);
  const long = createLong(scene);
  const moon = createMoon(scene);
  const projectObjects = createProjectObjects(scene, camera);

  setTimeout(() => {
    projectObjects.forEach(po => {
      po.element.style.transition = 'opacity 0.5s ease-in';
      po.element.style.opacity = '1';
    });

  }, 1500);

  document.body.onscroll = () => {
    const t = document.body.getBoundingClientRect().top;
    animateOnScroll(camera, long, moon, projectObjects, t);
    starField.position.z = camera.position.z;
  };

  animate(renderer, scene, camera, blackHole, moon, starField, updateSkyPosition, projectObjects);
}

// Start the application
main();