// Assuming you already have Three.js and other required libraries loaded in your HTML file

import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Variables for scene, camera, renderer
let scene, camera, renderer;
let playerMesh;

// Movement and mouse control variables
const playerSpeed = 0.05;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Initialize the scene
function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Set up the camera - Orthographic Camera
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
    camera.position.set(0, 50, 0);
    camera.lookAt(0, 0, 0);

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('webgl-canvas') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // Set background color to black

    // Add a light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 50, 10);
    scene.add(directionalLight);

    // Create the spaceship mesh (replace the player mesh)
    const spaceshipGeometry = new THREE.ConeGeometry(1, 2, 32);
    const spaceshipMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    playerMesh = new THREE.Mesh(spaceshipGeometry, spaceshipMaterial);
    playerMesh.rotation.x = Math.PI / 2; // Rotate to make it look like a spaceship
    playerMesh.position.set(0, 1, 0);
    scene.add(playerMesh);

    // Create fake stars in the background
    const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 200; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(
            (Math.random() - 0.5) * 500,
            (Math.random() - 0.5) * 500,
            (Math.random() - 0.5) * 500
        );
        scene.add(star);
    }

    // Add event listeners for key presses
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('keypress', onKeyPress, false);

    // Add mouse move listener
    document.addEventListener('mousemove', onMouseMove, false);

    // Add scroll listener for zooming in and out
    document.addEventListener('wheel', onMouseWheel, false);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// Handle key down events
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
    }
}

// Handle key up events
function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
    }
}

// Handle key press events
function onKeyPress(event) {
    if (event.code === 'Enter') {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('canvas-container').style.display = 'flex';
    }
}

// Handle mouse movement
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting to find the point on the ground where the mouse is pointing
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectPoint);

    if (intersectPoint) {
        playerMesh.lookAt(intersectPoint.x, playerMesh.position.y, intersectPoint.z);
    }
}

// Handle mouse wheel events for zooming in and out
function onMouseWheel(event) {
    const zoomAmount = event.deltaY * 0.01;
    camera.zoom = Math.max(1, Math.min(100, camera.zoom - zoomAmount));
    camera.updateProjectionMatrix();
}

// Handle window resizing
function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -20 * aspect;
    camera.right = 20 * aspect;
    camera.top = 20;
    camera.bottom = -20;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    // Update player movement
    let moveX = 0;
    let moveZ = 0;

    if (moveForward) moveZ -= playerSpeed;
    if (moveBackward) moveZ += playerSpeed;
    if (moveLeft) moveX -= playerSpeed;
    if (moveRight) moveX += playerSpeed;

    playerMesh.position.x += moveX;
    playerMesh.position.z += moveZ;

    // Make the camera follow the player
    camera.position.x = playerMesh.position.x;
    camera.position.z = playerMesh.position.z + 20;
    camera.lookAt(playerMesh.position);

    // Render the scene
    renderer.render(scene, camera);
}

// Run the init function to set everything up
init();