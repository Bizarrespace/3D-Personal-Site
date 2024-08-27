import * as THREE from 'three'

// Create space background
export function createSpaceBackground(scene, camera) {
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