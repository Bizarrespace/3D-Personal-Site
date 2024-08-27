import * as THREE from 'three';


// Positions each star, calculates its size based on distance, and passes color info to fragment shader
const starVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Determines color & appearance of each pixel of the star
// Combines the color passed from vertex shader (vColor) with a texture to create
// the final star appearance, allowing for custom star colors and shapes
const starFragmentShader = `
  uniform sampler2D pointTexture;
  varying vec3 vColor;
  void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 color = vec4(vColor, 1.0) * texture2D(pointTexture, uv);
    gl_FragColor = color;
  }
`;

// Create a star field, function generates a large # of stars with varying positions
// colors, and sizes, and uses custom material for efficient rendering
// Stars are randomly distributed within a cubic volumne and assigned colors based
// palette
export function createStarField(scene, numStars = 5000) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];

  const colorPalette = [
    new THREE.Color(0xffff00), // yellow
    new THREE.Color(0xffffff), // white
    new THREE.Color(0x00ffff), // cyan
    new THREE.Color(0xff8080)  // light red
  ];

  // Create arrays that hold position, color, and sizes for each star
  for (let i = 0; i < numStars; i++) {
    positions.push(THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000));

    // Gets the color object that represents the color that we want to use
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

    // Get the red, green and blue values from the color object
    colors.push(color.r, color.g, color.b);
    sizes.push(Math.random() * 15 + 2);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const starTexture = createStarTexture();
  const material = createStarMaterial(starTexture);

  const starField = new THREE.Points(geometry, material);
  scene.add(starField);

  return starField;
}

// Create a texture for stars
function createStarTexture() {
  // Make canvas in memory
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;

  // Get 2d rendering context to get access to variety of methods and property to draw
  const ctx = canvas.getContext('2d');

  // Creates a gradient that radiates from cetner to the edges of canvas
  // Using color stops to generate smooth transition between colors
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// Create custom shaderMat for stars using the CanvasTexture from createStarTexture()
// This material has custom vertex and fragment shaders to render star particles
// with specific visual properties (e.g., color, size glow effect)
function createStarMaterial(starTexture) {
    return new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: starTexture }
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
    });
  }