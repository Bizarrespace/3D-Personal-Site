// Import necessary modules and styles
import './style.css'
import * as THREE from 'three';
import { createBlackHole } from './components/blackhole';
import { createStarField } from './components/starfield';

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

// Create space background
function createSpaceBackground(scene, camera) {
  /** 
   * Positions each vertex of the sky phere in 3D space
   * Calc world position of each vertex and passes it to the fragment shader as
   * vWorldPositon
   */
  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  /**
   * Determines each color pixel of sky sphere, uses the vWorldPosition from vertex
   * shader to calc normalized view distance. 
   * h is calc based on the y-component of the view direction, creating gradient effect
   * from bottom to top
   */
  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;
    void main() {
      vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
      float h = viewDirection.y * 0.5 + 0.5;
      gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
    }
  `;
 
  /**
   * Variables that remain constant for all vertices/fragments in a single
   * render pass
   */
  const uniforms = {
    topColor: { value: new THREE.Color(0x0077be) },  // Deep blue
    bottomColor: { value: new THREE.Color(0x000000) },  // Black
  };

  
  const skyGeo = new THREE.SphereGeometry(1000, 32, 15);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // Set to BackSide so that its visible from inside the sphere
    side: THREE.BackSide
  });

  // Mesh made to combine sphere geo and shader mat
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // To make sure that the sky always surrounds the camera, infinite background effect
  return () => {
    sky.position.copy(camera.position);
  };
}

// Create Long object
function createLong(scene) {
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
function createMoon(scene) {
  const moonTexture = new THREE.TextureLoader().load("images/Moon.png");
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(6, 32, 32),
    new THREE.MeshBasicMaterial({ map: moonTexture })
  );
  moon.position.set(-30, 0, 30);
  scene.add(moon);
  return moon;
}

function createProjectObjects(scene, camera) {
  const projects = [
    { name: 'C++ Compiler', description: 'C++ Compiler for the Rats23 language, fully functional lexer and syntax analyzer', image: "images/compiler.png", link: 'https://github.com/Bizarrespace/Compiler-Project' },
    { name: 'Location Music trend analysis app', description: 'React Native app that leverages Shazam API to provide users real time music trend analysis in specific cities.', image: 'images/cityBeats.png', link: 'https://github.com/Bizarrespace/CityBeats' },
    { name: 'Kayles Game with AI', description: 'Kayles game with competitve AI bot to play against the player', image: 'images/AI.png', link: 'https://github.com/Bizarrespace/Kayles-Game-With-AI' },
  ];

  const projectObjects = projects.map((project, index) => {
    // Create the screen
    const screenGeometry = new THREE.PlaneGeometry(8, 4.5); // 16:9 aspect ratio
    const screenTexture = new THREE.TextureLoader().load(project.image);
    const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.11; // Set the local position of the screen so that its slightly further than the frame

    // Create the frame
    const frameGeometry = new THREE.BoxGeometry(8.4, 4.9, 0.2);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);

    // Create a group to hold the screen and frame
    const tv = new THREE.Group();
    tv.add(frame);
    tv.add(screen);

    // Position the TV
    tv.position.set(
      0 + index * 1.5,  // X position: to the right of the camera path
      0,                // Y position: at the center of the view
      70 + index * 30  // Z position: slightly ahead of the camera starting point
    );

    

    scene.add(tv);

    // Create corresponding HTML element
    const projectElement = document.createElement('div');
    projectElement.className = 'project-info';
    projectElement.innerHTML = `
      <h2>${project.name}</h2>
      <p>${project.description}</p>
      <a href="${project.link}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
    `;
    projectElement.style.opacity = '0';
    document.body.appendChild(projectElement);
    
    return { 
      mesh: tv, 
      project, 
      element: projectElement
    };
  });

  // Add click event listener
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(projectObjects.flatMap(po => po.mesh.children));

    if (intersects.length > 0) {
      const clickedObject = projectObjects.find(po => po.mesh.children.includes(intersects[0].object));
      if (clickedObject) {
        window.open(clickedObject.project.link, '_blank');
      }
    }
  });

  return projectObjects;
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

  moon.rotation.y += 0.001;
  moon.rotation.x += 0.005;
  
  starField.rotation.y += 0.0003;

  
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