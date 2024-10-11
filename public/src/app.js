import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, spaceship, controls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Set background color to black

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load spaceship
    const loader = new GLTFLoader();
    loader.load('/assets/models/spaceship.glb', (gltf) => {
        spaceship = gltf.scene;
        //
        // Apply flat shading to all meshes in the model
        spaceship.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: child.material.color,
                    flatShading: true,
                    shininess: 0 // Reduce shininess for a more flat appearance
                });
            }
        });

        // Center the spaceship
        const box = new THREE.Box3().setFromObject(spaceship);
        const center = box.getCenter(new THREE.Vector3());
        spaceship.position.sub(center);

        scene.add(spaceship);
    });

    camera.position.z = 5;
    
    // Add OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add smooth damping effect
    controls.dampingFactor = 0.05;

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls in the animation loop
    renderer.render(scene, camera);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('canvas-container').style.display = 'block';
        init();
        animate();
        // Remove the event listener after it's been triggered
        window.removeEventListener('keydown', handleKeyPress);
    }
}

// Add the event listener
window.addEventListener('keydown', handleKeyPress);

console.log('app.js loaded and running');