import * as THREE from 'three'

export function createProjectObjects(scene, camera) {
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