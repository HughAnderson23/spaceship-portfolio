// Assuming you have Three.js and other required libraries loaded in your HTML file

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Variables for scene, camera, renderer
let scene, camera, renderer;
let playerMesh;

// Movement and mouse control variables
const playerSpeed = 0.05;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Mouse position
const mouse = new THREE.Vector2();

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

    // Add lights to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 50, 10);
    scene.add(directionalLight);

    // Load the custom spaceship model
    const loader = new GLTFLoader();
    loader.load(
        'assets/models/spaceship.glb',
        function (gltf) {
            playerMesh = gltf.scene;
            playerMesh.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
            playerMesh.position.set(0, 1, 0);
            
            // Rotate the ship 90 degrees around the X-axis
            playerMesh.rotation.x = Math.PI / 2;
            
            scene.add(playerMesh);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened', error);
        }
    );

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

    // Add event listeners
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('keypress', onKeyPress, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('wheel', onMouseWheel, false);
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}

function onKeyPress(event) {
    if (event.code === 'Enter') {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('canvas-container').style.display = 'flex';
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseWheel(event) {
    const zoomAmount = event.deltaY * 0.01;
    camera.zoom = Math.max(1, Math.min(100, camera.zoom - zoomAmount));
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -20 * aspect;
    camera.right = 20 * aspect;
    camera.top = 20;
    camera.bottom = -20;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updatePlayerMovement() {
    if (!playerMesh) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectPoint);

    // Calculate direction to mouse
    const directionToMouse = new THREE.Vector3().subVectors(intersectPoint, playerMesh.position).normalize();
    
    // Calculate perpendicular directions
    const perpendicularLeft = new THREE.Vector3(-directionToMouse.z, 0, directionToMouse.x).normalize();
    const perpendicularRight = perpendicularLeft.clone().negate();

    let moveDirection = new THREE.Vector3(0, 0, 0);

    if (moveForward) moveDirection.add(directionToMouse);
    if (moveBackward) moveDirection.sub(directionToMouse);
    if (moveLeft) moveDirection.add(perpendicularLeft);
    if (moveRight) moveDirection.add(perpendicularRight);

    moveDirection.normalize().multiplyScalar(playerSpeed);

    playerMesh.position.add(moveDirection);

    // Update player rotation
    if (intersectPoint) {
        playerMesh.lookAt(intersectPoint.x, playerMesh.position.y, intersectPoint.z);
        playerMesh.rotateX(Math.PI / 2); // Correct the rotation after lookAt
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (playerMesh) {
        updatePlayerMovement();

        camera.position.x = playerMesh.position.x;
        camera.position.z = playerMesh.position.z + 20;
        camera.lookAt(playerMesh.position);
    }

    renderer.render(scene, camera);
}

init();