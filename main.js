import * as THREE from 'three';
import * as CANNON from 'cannon-es';
//import CannonUtils from './cannonUtils.js';
import CannonDebugRenderer from './CannonDebugRenderer.js';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControlsCannon } from './PointerLockControlsCannon.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// ThreeJS variables
let camera, scene, renderer, controls;
let material;
let listener;

// Player Sounds
let walkSound;
let jumpSound;
let music;
let stompSound;

let enemyHit;
let playerHit;

let gameOverSound;

let highScore = 0;
let currScore = 0;

let playerHealth = 100;

let enemySpeed = 6;//6;

let isDead = false;

// Guns variables
const maxSpin = 0.1;
const maxHeat = 100;
const minHeat = 20;

// Left Gun
let lminigun;
let lGunMesh;

let lmb = false;
let lFired = false;
let lClicked = false;
let lOverheated = false;

let lCurSpin = 0.0;
let lHeat =0;

// LGun Sounds
let lGunSound;
let lWindUp;
let lWindDown;
let lClickSound;
let lcasing;
let lOverheatSound;

//Right Gun
let rminigun;
let rGunMesh;

let rmb = false;
let rFired = false;
let rClicked = false;
let rOverheated = false;

let rCurSpin = 0.0;
let rHeat =0;

// RGun Sounds
let rGunSound;
let rWindUp;
let rWindDown;
let rClickSound;
let rcasing;
let rOverheatSound;

let  glitchTemp = 0;

let dome;
let city;

let canJump = false;
let stomped = false;

let particles = [];
let particleBodies = [];
let particleMeshes = [];
let triangles = [];

let prevTime = performance.now();
//------------------------------

// CannonJS variables

const GROUP1 = 1
const GROUP2 = 2
const GROUP3 = 4

let world;
let playerShape;
let playerBody;
let physicsMaterial;

let islandMesh;
let islandShape;
let islandBody;
let islandGeometry;

// Enemy variables


//gui.add(shells, 'length', 0, 1000).name('Shells').listen();
//------------------------------

// GUI
// const gui = new GUI({closed: true});

const objects = [];

const loaded = document.getElementById('loader');
const instructions = document.getElementById('instructions');
const blocker = document.getElementById('blocker');
const crosshair = document.getElementById('crosshair');
const sprint = document.getElementById('sprint');
const glitch = document.getElementById('glitch');
const gameOver = document.getElementById('gameOver');

//const cannonDebugRenderer = new CannonDebugRenderer(scene, world);

gameOver.style.display = 'none';
initCannon();
initThree();
initPointerLock();
animate();

function initThree()
{
    crosshair.style.display = 'none';
    sprint.style.display = 'none';
    gameOver.style.display = 'none';

    // Init audio
    listener = new THREE.AudioListener();

    music = new THREE.Audio(listener);

    walkSound = new THREE.Audio(listener);
    jumpSound = new THREE.Audio(listener);
    stompSound = new THREE.Audio(listener);

    lGunSound = new THREE.Audio(listener);
    lWindDown = new THREE.Audio(listener);
    lWindUp = new THREE.Audio(listener);
    lClickSound = new THREE.Audio(listener);
    lOverheatSound = new THREE.Audio(listener);

    rGunSound = new THREE.Audio(listener);
    rWindDown = new THREE.Audio(listener);
    rWindUp = new THREE.Audio(listener);
    rClickSound = new THREE.Audio(listener);
    rOverheatSound = new THREE.Audio(listener);

    playerHit = new THREE.Audio(listener);
    enemyHit = new THREE.Audio(listener);
    enemyHit = new THREE.Audio(listener);

    gameOverSound = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();

    audioLoader.load( 'audio/musicLoop.mp3', function( buffer ) {
        music.setBuffer( buffer );
        music.setLoop( true );
        music.setVolume( 0.15 );
    });

    audioLoader.load( 'audio/mechStep.mp3', function( buffer ) {
        walkSound.setBuffer( buffer );
        walkSound.setLoop( false );
        walkSound.setVolume( 0.35 );
        walkSound.playbackRate = 1;//1.2
    });

    audioLoader.load( 'audio/mechJump2.mp3', function( buffer ) {
        jumpSound.setBuffer( buffer );
        jumpSound.setLoop( false );
        jumpSound.setVolume( 0.35 );
        jumpSound.playbackRate = 1;
    });

    audioLoader.load( 'audio/mechStomp.mp3', function( buffer ) {
        stompSound.setBuffer( buffer );
        stompSound.setLoop( false );
        stompSound.playbackRate = 1;
        stompSound.setVolume( 0.35 );
    });

    //Left Gun
    audioLoader.load( 'audio/lgunSound.mp3', function( buffer ) {
        lGunSound.setBuffer( buffer );
        lGunSound.setLoop( false );
        lGunSound.playbackRate = 1;
        lGunSound.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/lWindDown.mp3', function( buffer ) {
        lWindDown.setBuffer( buffer );
        lWindDown.setLoop( false );
        lWindDown.playbackRate = 1;
        lWindDown.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/lWindUp.mp3', function( buffer ) {
        lWindUp.setBuffer( buffer );
        lWindUp.setLoop( false );
        lWindUp.playbackRate = 1;
        lWindUp.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/lClickSound.mp3', function( buffer ) {
        lClickSound.setBuffer( buffer );
        lClickSound.setLoop( false );
        lClickSound.playbackRate = 1;
        lClickSound.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/lOverheat.mp3', function( buffer ) {
        lOverheatSound.setBuffer( buffer );
        lOverheatSound.setLoop( false );
        lOverheatSound.playbackRate = 1;
        lOverheatSound.setVolume( 0.35 );
    });

    //Right Gun
    audioLoader.load( 'audio/rgunSound.mp3', function( buffer ) {
        rGunSound.setBuffer( buffer );
        rGunSound.setLoop( false );
        rGunSound.playbackRate = 1;
        rGunSound.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/rWindDown.mp3', function( buffer ) {
        rWindDown.setBuffer( buffer );
        rWindDown.setLoop( false );
        rWindDown.playbackRate = 1;
        rWindDown.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/rWindUp.mp3', function( buffer ) {
        rWindUp.setBuffer( buffer );
        rWindUp.setLoop( false );
        rWindUp.playbackRate = 1;
        rWindUp.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/rClickSound.mp3', function( buffer ) {
        rClickSound.setBuffer( buffer );
        rClickSound.setLoop( false );
        rClickSound.playbackRate = 1;
        rClickSound.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/rOverheat.mp3', function( buffer ) {
        rOverheatSound.setBuffer( buffer );
        rOverheatSound.setLoop( false );
        rOverheatSound.playbackRate = 1;
        rOverheatSound.setVolume( 0.35 );
    });

    audioLoader.load( 'audio/metalHit.mp3', function( buffer ) {
        playerHit.setBuffer( buffer );
        playerHit.setLoop( false );
        playerHit.playbackRate = 1;
        playerHit.setVolume( 0.45 );
    });

    audioLoader.load( 'audio/fleshHit.mp3', function( buffer ) {
        enemyHit.setBuffer( buffer );
        enemyHit.setLoop( false );
        enemyHit.playbackRate = 1;
        enemyHit.setVolume( 0.45 );
    });

    audioLoader.load( 'audio/gameOver.mp3', function( buffer ) {
        gameOverSound.setBuffer( buffer );
        gameOverSound.setLoop( false );
        gameOverSound.playbackRate = 1;
        gameOverSound.setVolume( 0.85 );
    });


    //-----------------------------------------------------------

    // init scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1d002d);// 0x412c4d 0x1d002d
    scene.fog = new THREE.Fog(0x1d002d, 0, 750);
    

    // Init camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.near = .015;

    camera.add(listener);
    scene.add(camera);
    
    // Init Renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    // init Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.035);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xf0e6f5, 0.95); // Use a slightly bluish/grayish color // 
    sunLight.position.set(55, 100, 95); // Adjust the light direction as needed 45, 100, 85
    scene.add(sunLight);

    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 5120 // default
    sunLight.shadow.mapSize.height = 5120 // default
    sunLight.shadow.camera.near = 1 // default
    sunLight.shadow.camera.far = 800 // default
    sunLight.shadow.camera.top = -50 // default
    sunLight.shadow.camera.right = 50 // default
    sunLight.shadow.camera.left = -50 // default
    sunLight.shadow.camera.bottom = 50 // default
    sunLight.shadow.bias = 0.0001;
    sunLight.shadow.normalBias = 0.0001;

    // Default Material
    material = new THREE.MeshLambertMaterial({ color: 0xdddddd });

    // Create and Add SkyBox
    const skyLoader = new THREE.CubeTextureLoader();
    const skyTexture = skyLoader.load([
        'images/skybox2/ft2.png',//pos-x
        'images/skybox2/bk2.png',//neg-x
        'images/skybox2/up2.png',//pos-y
        'images/skybox2/dn2.png',//neg-y
        'images/skybox2/rt2.png',//pos-z
        'images/skybox2/lf2.png',//neg-z
      ]);
      scene.background = skyTexture;

    // Ground plane mesh
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    groundGeometry.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeometry, material);
    ground.receiveShadow = true;
    scene.add(ground);

    // Add center test cube
    const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
    cube.castShadow = true;
    scene.add( cube );

    // Create simple gun meshes
    const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 1);

    lGunMesh = new THREE.Mesh(gunGeometry, material);
    lGunMesh.position.set(-1, 1.6, -0.5);
    lGunMesh.receiveShadow = true;
    scene.add(lGunMesh);

    rGunMesh = new THREE.Mesh(gunGeometry, material);
    rGunMesh.position.set(1, 1.6, -0.5);
    rGunMesh.receiveShadow = true;
    scene.add(rGunMesh);

    // const meshFolder = gui.addFolder('Left Gun')
    // meshFolder.add(lGunMesh.position, 'x', -100, 100).name('X pos').listen();
    // meshFolder.add(lGunMesh.position, 'y', -100, 100).name('Y pos').listen();
    // meshFolder.add(lGunMesh.position, 'z', -100, 100).name('Z pos').listen();
    // meshFolder.add(lGunMesh.quaternion, 'z', 0, Math.PI).name('Y Rotation').listen();

    // Load minigun model
    let loader = new GLTFLoader();
    loader.load('models/minigun/scene2.gltf', function (gltf) 
    {
        //gltf.scene.scale.set(.1, .1, .1)

        // Set the cube's position to be equal to the camera's position
        gltf.scene.position.set(camera.position.x, camera.position.y, camera.position.z);
        lminigun = gltf.scene;;
        //scene.add(gltf.scene)
        
        // Attach model to mesh
        lGunMesh.add(lminigun);
    });

    loader.load('models/minigun/scene2.gltf', function (gltf) 
    {
        //gltf.scene.scale.set(.1, .1, .1)

        // Set the cube's position to be equal to the camera's position
        gltf.scene.position.set(camera.position.x, camera.position.y, camera.position.z);
        rminigun =gltf.scene;
        //scene.add(gltf.scene)
        
        // Attach model to mesh
        rGunMesh.add(rminigun);
    });

    // Load Dome
    loader.load('models/dome/scene2.gltf', function (gltf) 
    {
        gltf.scene.scale.set(100, 100, 100)

        gltf.scene.traverse( function( node ) {

            if ( node.isMesh && node.material.name != "Glass") { node.castShadow = true; }
    
        } );

        dome =gltf.scene;
        
        // Attach model to mesh
        scene.add(dome);
    });

    // Load Walls
    const wallGeometry = new THREE.BoxGeometry( 22, 6, 2 );
    const wallMaterial = new THREE.MeshLambertMaterial( { color: 0x6a6a6a } );
    const wall = new THREE.Mesh( wallGeometry, wallMaterial );
    cube.castShadow = true;
    wall.position.set(-4.5,3,-30);
    wall.rotation.set(0, 0.5, 0);
    scene.add( wall );

    const wallGeometry1 = new THREE.BoxGeometry( 16, 4, 2 );
    const wallMaterial1 = new THREE.MeshLambertMaterial( { color: 0x7a7a7a } );
    const wall1 = new THREE.Mesh( wallGeometry1, wallMaterial1 );
    cube.castShadow = true;
    wall1.position.set(0,2,-50);
    wall1.rotation.set(0, -0.9, 0);
    scene.add( wall1 );

    const wallGeometry2 = new THREE.BoxGeometry( 22, 10, 2 );
    const wallMaterial2 = new THREE.MeshLambertMaterial( { color: 0x5a5a5a } );
    const wall2 = new THREE.Mesh( wallGeometry2, wallMaterial2 );
    cube.castShadow = true;
    wall2.position.set(4,5,-70);
    wall2.rotation.set(0, 0.45, 0);
    scene.add( wall2 );

    const wallGeometry3 = new THREE.BoxGeometry( 26, 6, 2 );
    const wallMaterial3 = new THREE.MeshLambertMaterial( { color: 0x4a4a4a } );
    const wall3 = new THREE.Mesh( wallGeometry3, wallMaterial3 );
    cube.castShadow = true;
    wall3.position.set(-29,3,-55);
    wall3.rotation.set(0, 0.45, 0);
    scene.add( wall3 );

    // Load City
    loader.load('models/city/scene.gltf', function (gltf) 
    {
        //gltf.scene.scale.set(100, 100, 100)
 
        gltf.scene.traverse( function( node ) {
 
            if ( node.isMesh && node.material.name != "Glass") { node.castShadow = true; }
     
        } );
 
        city = gltf.scene;
         
        // Attach model to mesh
        scene.add(city);

        loaded.style.display = 'none';
    });

    //Load terrain
    loader.load('models/island/scene4.gltf', function (gltf) 
    {
        islandMesh = gltf.scene.children[0];
        console.log("Island Mesh Children:", islandMesh.children);

        // Traverse the children to find the actual geometry
        let found = false;
        islandMesh.traverse(child => {
            if (!found && child.isMesh) {
                islandMesh = child;
                found = true;
            }
        });
        console.log("Actual Island Mesh:", islandMesh);

        islandGeometry = islandMesh.geometry;
        console.log("Island Geometry:", islandGeometry);

        islandShape = threeToCannon(islandMesh, {type: ShapeType.CONVEXPOLYHEDRON});
        console.log(islandShape);

        scene.add( islandMesh );
    });

    //------------------------------

    window.addEventListener('resize', onWindowResize);
}

function initCannon()
{
    // Init  phys world
    world = new CANNON.World();

    // Tweak contact properties.
    // Contact stiffness - use to make softer/harder contacts
    world.defaultContactMaterial.contactEquationStiffness = 1e9

    // Stabilization time in number of timesteps
    world.defaultContactMaterial.contactEquationRelaxation = 4

    const solver = new CANNON.GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;
    world.solver = new CANNON.SplitSolver(solver);
    // use this to test non-split solver
    // world.solver = solver;

    world.gravity.set(0, -20, 0)

    // Creating a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material('physics');
    const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
      friction: 1,
      restitution: 0.2,
    });

    // Adding contact materials to the world
    world.addContactMaterial(physics_physics);

    // Create ground plane collider
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Create Dome collider
    // const domeShape = new CANNON.Cylinder(1,5,20,20);
    // const domeBody = new CANNON.Body({ mass: 0, material: physicsMaterial});
    // domeBody.addShape(domeShape);
    // groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    // world.addBody(domeBody);

    const cubeShape = new CANNON.Box(new CANNON.Vec3(1,1,1))
    const cubeBody = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    cubeBody.addShape(cubeShape);
    //groundBody2.position.set(0,0,-185);
    //groundBody2.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(cubeBody);

    // Create player collider
    const radius = 1.76;
    playerShape = new CANNON.Sphere(radius);
    playerBody = new CANNON.Body({mass: 100, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    playerBody.addShape(playerShape);
    playerBody.position.set(0,5,0);
    playerBody.linearDamping = 0.9;
    world.addBody(playerBody);

    // Add playerbody pos to GUI
    // const bodyFolder = gui.addFolder('Player Body')
    // bodyFolder.add(playerBody.position, 'x', -200, 200).name('X pos').listen();
    // bodyFolder.add(playerBody.position, 'y', -200, 200).name('Y pos').listen();
    // bodyFolder.add(playerBody.position, 'z', -200, 200).name('Z pos').listen();

    // Adding Building Colliders
    //const buildShape = new CANNON.Box(new CANNON.Vec3(5,50,5))
    const buildShape = new CANNON.Cylinder(6,6,50,12);
    const buildBody = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody.addShape(buildShape);
    buildBody.position.set(-30,25,30);
    buildBody.quaternion.setFromEuler(0, -0.3, 0);
    world.addBody(buildBody);

    //const buildShape1 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape1 = new CANNON.Cylinder(6,6,50,12);
    const buildBody1 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody1.addShape(buildShape1);
    buildBody1.position.set(10,25,-40);
    buildBody1.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody1);

    //const buildShape2 = new CANNON.Box(new CANNON.Vec3(5,50,5))
    const buildShape2 = new CANNON.Cylinder(6.5,6.5,50,12);
    const buildBody2 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody2.addShape(buildShape2);
    buildBody2.position.set(30,25,-20);
    buildBody2.quaternion.setFromEuler(0, -0.25, 0);
    world.addBody(buildBody2);
    
    //const buildShape3 = new CANNON.Box(new CANNON.Vec3(7,50,7))
    const buildShape3 = new CANNON.Cylinder(8,8,50,12);
    const buildBody3 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody3.addShape(buildShape3);
    buildBody3.position.set(-20.5,25,-20.5);
    buildBody3.quaternion.setFromEuler(0, 0.83, 0);
    world.addBody(buildBody3);

    //const buildShape4 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape4 = new CANNON.Cylinder(6,6,50,12);
    const buildBody4 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody4.addShape(buildShape4);
    buildBody4.position.set(-50,25,0);
    buildBody4.quaternion.setFromEuler(0, 0, 0);
    world.addBody(buildBody4);

    //const buildShape5 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape5 = new CANNON.Cylinder(6,6,50,12);
    const buildBody5 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody5.addShape(buildShape5);
    buildBody5.position.set(50,25,10);
    buildBody5.quaternion.setFromEuler(0, 0, 0);
    world.addBody(buildBody5);

    //const buildShape6 = new CANNON.Box(new CANNON.Vec3(7.5,50,7.5))
    const buildShape6 = new CANNON.Cylinder(7.5,7.5,50,12);
    const buildBody6 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody6.addShape(buildShape6);
    buildBody6.position.set(20,25,30);
    buildBody6.quaternion.setFromEuler(0, 0.84, 0);
    world.addBody(buildBody6);

    //const buildShape7 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape7 = new CANNON.Cylinder(6,6,50,12);
    const buildBody7 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody7.addShape(buildShape7);
    buildBody7.position.set(-10,25,50);
    buildBody7.quaternion.setFromEuler(0, 0.8, 0);
    world.addBody(buildBody7);

    //const buildShape8 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape8 = new CANNON.Cylinder(6,6,50,12);
    const buildBody8 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody8.addShape(buildShape8);
    buildBody8.position.set(-10,25,-60);
    buildBody8.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody8);

    //const buildShape9 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape9 = new CANNON.Cylinder(9,9,50,12);
    const buildBody9 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody9.addShape(buildShape9);
    buildBody9.position.set(-49,25,-49);
    buildBody9.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody9);

    //const buildShape10 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape10 = new CANNON.Cylinder(8,8,50,12);
    const buildBody10 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody10.addShape(buildShape10);
    buildBody10.position.set(20,25,-81);
    buildBody10.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody10);

    //const buildShape11 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape11 = new CANNON.Cylinder(7,7,50,12);
    const buildBody11 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody11.addShape(buildShape11);
    buildBody11.position.set(50,25,-48);
    buildBody11.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody11);

    //const buildShape12 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape12 = new CANNON.Cylinder(8,8,50,12);
    const buildBody12 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody12.addShape(buildShape12);
    buildBody12.position.set(80,25,-40);
    buildBody12.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody12);

    //const buildShape13 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape13 = new CANNON.Cylinder(8,8,50,12);
    const buildBody13 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody13.addShape(buildShape13);
    buildBody13.position.set(100,25,0);
    buildBody13.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody13);

    //const buildShape14 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape14 = new CANNON.Cylinder(8,8,50,12);
    const buildBody14 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody14.addShape(buildShape14);
    buildBody14.position.set(80,25,30);
    buildBody14.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody14);

    //const buildShape15 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape15 = new CANNON.Cylinder(9,9,50,12);
    const buildBody15 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody15.addShape(buildShape15);
    buildBody15.position.set(49,25,60);
    buildBody15.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody15);

    //const buildShape16 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape16 = new CANNON.Cylinder(8.5,8.5,50,12);
    const buildBody16 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody16.addShape(buildShape16);
    buildBody16.position.set(-49,25,59);
    buildBody16.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody16);

    //const buildShape17 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape17 = new CANNON.Cylinder(9,9,50,12);
    const buildBody17 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody17.addShape(buildShape17);
    buildBody17.position.set(-80,25,50);
    buildBody17.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody17);

    //const buildShape18 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape18 = new CANNON.Cylinder(8,8,50,12);
    const buildBody18 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody18.addShape(buildShape18);
    buildBody18.position.set(-100,25,10);
    buildBody18.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody18);

    //const buildShape19 = new CANNON.Box(new CANNON.Vec3(5.5,50,5.5))
    const buildShape19 = new CANNON.Cylinder(8,8,50,12);
    const buildBody19 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    buildBody19.addShape(buildShape19);
    buildBody19.position.set(-80,25,-20);
    buildBody19.quaternion.setFromEuler(0, -0.65, 0);
    world.addBody(buildBody19);

    // Adding Walls Mesh & Colliders
    //const buildShape19 = new CANNON.Cylinder(8,8,50,12);
    const wallShape = new CANNON.Box(new CANNON.Vec3(10,3,0.5))
    const wallBody = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    wallBody.addShape(wallShape);
    wallBody.position.set(-5,3,-30);
    wallBody.quaternion.setFromEuler(0, 0.5, 0);
    world.addBody(wallBody);

    const wallShape1 = new CANNON.Box(new CANNON.Vec3(8,2,0.5))
    const wallBody1 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    wallBody1.addShape(wallShape1);
    wallBody1.position.set(0,2,-50);
    wallBody1.quaternion.setFromEuler(0, -0.9, 0);
    world.addBody(wallBody1);

    const wallShape2 = new CANNON.Box(new CANNON.Vec3(11,5,0.5))
    const wallBody2 = new CANNON.Body({ mass: 0, material: physicsMaterial, collisionFilterGroup: GROUP1, collisionFilterMask: GROUP1 | GROUP3});
    wallBody2.addShape(wallShape2);
    wallBody2.position.set(4,5,-70);
    wallBody2.quaternion.setFromEuler(0, 0.45, 0);
    world.addBody(wallBody2);
}

function initPointerLock()
{
    controls = new PointerLockControlsCannon(camera,playerBody);
    scene.add(controls.getObject());

    camera.attach(lGunMesh);
    camera.attach(rGunMesh);

    // const controlFolder = gui.addFolder('Player Controls')
    // controlFolder.add(controls.quaternion, 'y', 0, Math.PI).name('Y Rotation').listen();

    instructions.addEventListener('click', function ()
    {
        controls.lock();
        //walkSound.play();
        music.play();
    });

    gameOver.addEventListener('click', function ()
    {
        controls.lock();
        //walkSound.play();
        //music.play();
        restart();
    });

    controls.addEventListener('lock', function ()
    {
        controls.enabled = true
        gameOver.style.display = 'none';
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        crosshair.style.display = '';
    });

    controls.addEventListener('unlock', function ()
    {
        controls.enabled = false

        //walkSound.stop();
        music.stop();

        if(!isDead)
        {
            setTimeout(() => {
                blocker.style.display = 'block';
                instructions.style.display = '';
                crosshair.style.display = 'none';
            }, 1000);
        }
        else
        {
            gameOver.style.display = '';
            gameOverSound.play();
        }
    });

    const onKeyDown = function (event) {

        //if(isPaused) return;

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                //moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                //moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                //moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                //moveRight = true;
                break;

            case 'Space':
                if (canJump === true) jumpSound.play();
                canJump = false;
                //if(stomped) stompSound.stop();
                stomped = false;
                break;
            
            case 'ShiftLeft':
            case 'ShiftRight':
                //canSprint = true;
                break;

        }
    };

    const onKeyUp = function (event) {

        //if(isPaused) return;

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                //moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                //moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                //moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                //moveRight = false;
                break;

            case 'ShiftLeft':
            case 'ShiftRight':
                //canSprint = false;
                break;

        }
    };

    const onMouseDown = function (event) {
        if(controls.enabled)
        {
            switch (event.which) {
                case 1: // if left click
                  lmb = true;
                  //shootShell();
                  break;
                case 3: // if right click
                  rmb = true;
                  break;
              }
        }
    }

    const onMouseUp = function (event) {
        if(controls.enabled)
        {
            switch (event.which) {
                case 1: // if left click
                  lmb = false;
                  break;
                case 3: // if right click
                  rmb = false;
                  break;
              }
        }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
}

function removeParticle(particle, particleBody) {
    // world.remove(particleBody);
    // particleBodies.splice(particleBodies.indexOf(particleBody), 1);

    // scene.remove(particle);
    // particles.splice(particles.indexOf(particle), 1);

    const index = particles.indexOf(particle);

    if (index !== -1) 
    {
        //console.log(typeof world);
        //console.log(world);
        //console.log(world.remove);
        console.log('Removing particle at index:', index);
        console.log(particleBody);
        console.log(particleBodies.length);
        console.log(world.bodies.length);
        
        //world.remove(particleBody);
        world.bodies.splice(37 + index - 1, 1);//max init colliders -1 + index // 21 + index
        particleBodies.splice(index, 1);

        scene.remove(particle);
        particles.splice(index, 1);
    }
    else 
    {
        console.warn('Particle not found in array.');
    }
}

function createParticle(gunMesh) {
    
    let particleShape = new CANNON.Sphere(0.0375);
    let particleBody = new CANNON.Body({mass: 0, shape: particleShape, collisionFilterGroup: GROUP2, collisionFilterMask: GROUP3});

    let geometry = new THREE.SphereGeometry(0.075, 8, 8);

    //geometry.rotateZ(Math.PI/2);
    //geometry.scale(1, 1, 4);

    particleBody.position.copy(gunMesh.getWorldPosition(new THREE.Vector3()));
    particleBody.initialDirection = camera.getWorldDirection(new THREE.Vector3());
    particleBody.velocity = particleBody.initialDirection.clone().multiplyScalar(0.95);

    
    let material = new THREE.MeshBasicMaterial({ color: 0xffbb3d });
    let particle = new THREE.Mesh(geometry, material);
    particle.position.copy(gunMesh.getWorldPosition(new THREE.Vector3()));
    particle.initialDirection = camera.getWorldDirection(new THREE.Vector3());
    particle.velocity = particle.initialDirection.clone().multiplyScalar(0.95);

    world.addBody(particleBody)
    particleBodies.push(particleBody)

    scene.add(particle);
    particles.push(particle);
}

function updateParticles() {
    let distanceThreshold = 200;
    let particlesToRemove = [];

    for (let i = particles.length - 1; i >= 0; i--) {
        let particle = particles[i];
        particle.position.add(particle.velocity);

        let particleBody = particleBodies[i];
        particleBody.position.copy(particle.position);
        // particleBody.position.x += particle.velocity.x
        // particleBody.position.y += particle.velocity.y
        // particleBody.position.z += particle.velocity.z

        let distance = particle.position.distanceTo(camera.getWorldPosition(new THREE.Vector3()));
        if (distance > distanceThreshold) {
            //removeParticle(particle, particleBody);
            particlesToRemove.push(i);
        }
    }

    for (let i of particlesToRemove) {
        removeParticle(particles[i], particleBodies[i]);
    }

}

//---------------------------------------------------------------
// Enemy Class

class Enemy {
    constructor(scene, world, playerBody) {
      // Create enemy
      //const enemyGeometry = new THREE.BoxGeometry(2, 2, 2);
      const enemyGeometry = new THREE.SphereGeometry(2, 16, 8);
      const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      this.enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
      scene.add(this.enemyMesh);

      this.enemyHealth = 100;

      // Load custom 3D model using GLTF loader
      const loader = new GLTFLoader();
      loader.load('models/beholder/scene3.gltf', (gltf) => {
          // Access the mesh from the loaded model
          const customModel = gltf.scene;

          // Set the position of the custom model relative to the base mesh
          customModel.position.set(0, 0, 0); // Adjust as needed
          //ltf.scene.scale.set(1.5, 1.5, 1.5);

          // Attach the custom model as a child to the base mesh
          this.enemyMesh.add(customModel);
      });

      // Create enemy physics body
      //const enemyShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      const enemyShape = new CANNON.Sphere(2);
      this.enemyBody = new CANNON.Body({ mass: 1 , collisionFilterGroup: GROUP3, collisionFilterMask: GROUP1 | GROUP2 | GROUP3});
      this.enemyBody.addShape(enemyShape);
      world.addBody(this.enemyBody);
  
      // Reference to player body
      this.playerBody = playerBody;
  
      // Initial position (you can set this based on your needs)
      this.enemyBody.position.set(0, 25, 0);
  
      // Speed at which the enemy follows the player
      //this.followSpeed = 8;
    }

    playSound(){
        //this.sound.play();
    }
  
    update() {
      // Calculate direction to the player
      const direction = new CANNON.Vec3();
      this.playerBody.position.vsub(this.enemyBody.position, direction);
      direction.normalize();
  
      // Move the enemy towards the player
      const velocity = direction.scale(enemySpeed);//followspeed
      this.enemyBody.velocity.copy(velocity);
  
      // Update the visual position
      this.enemyMesh.position.copy(this.enemyBody.position);
      
    }

    setPos()
    {
        // Calculate random radius within the specified range
        //const spawnRadiusX = Math.random() * (90 - 45) + 45;
        //const spawnRadiusZ = Math.random() * (90 - 45) + 45;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (150 - 75) + 75;
        const x = playerBody.position.x + Math.cos(angle) * radius;
        const z = playerBody.position.z + Math.sin(angle) * radius;

        // Calculate enemy position relative to the player
        let xPos = Math.random() * x;
        let zPos = Math.random() * z;

        this.enemyBody.position.set(xPos, 35, zPos);
    }
  
    // Call this function when the enemy is hit by a bullet
    onHit() {
      // Remove the enemy from the scene and world
      scene.remove(this.enemyMesh);
      world.remove(this.enemyBody);
    }
}

// Create an explosion of small triangles
function explosion(object) {

    //playExplosionSound();

    let explosionCount = 18;

    for (let i = 0; i < explosionCount; i++) {
        let triangle = createTriangle(object);
        scene.add(triangle);
        triangles.push(triangle); // Add the triangle to the triangles array

        triangle.userData = {
            direction: new THREE.Vector3(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            ).normalize(),
            speed: Math.random() * 0.05 + 0.01, // Random speed
            rotationAxis: new THREE.Vector3(
                Math.random(),
                Math.random(),
                Math.random()
            ).normalize(),
            rotationSpeed: Math.random() * 0.1 + 0.005, // Random rotation speed
            distance: 0, // Distance traveled by the triangle
            remove: false, // Flag to mark if the triangle should be removed
            parentObject: object, // Reference to the collided cube
        };
    }
}

// Create a small triangle
function createTriangle(object) {
    let geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array([
        -0.75, 0, 0,
        0.75, 0, 0,
        0, 0.75, 0
    ]);
    let indices = new Uint16Array([0, 1, 2]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    let material = new THREE.MeshBasicMaterial({ color: 0xff8000, side: THREE.DoubleSide });

    let triangle = new THREE.Mesh(geometry, material);

    // Set initial position at the center of the collided cube
    triangle.position.copy(object.enemyMesh.position);

    // Set the rotation to face the camera
    triangle.lookAt(camera.position);

    // Set random scale
    let scale = Math.random() * 1 + 0.5; // Adjust the scale range as desired
    triangle.scale.set(scale, scale, scale);

    return triangle;
}

// Update the triangles' positions, rotations, and remove them if necessary
function updateTriangles() {
    for (var i = 0; i < triangles.length; i++) {
        var triangle = triangles[i];
        var userData = triangle.userData;

        // Move the triangle in its direction at a random speed
        var speed = userData.speed;
        triangle.position.add(userData.direction.clone().multiplyScalar(speed));

        // Rotate the triangle around its rotation axis at a random speed
        var rotationSpeed = userData.rotationSpeed;
        triangle.rotateOnWorldAxis(userData.rotationAxis, rotationSpeed);

        // Update the distance traveled by the triangle
        userData.distance += speed;

        // If the triangle has traveled a certain distance, mark it for removal
        if (userData.distance >= 2) {
            userData.remove = true;
        }
    }

    // Remove triangles that are marked for removal
    for (var i = triangles.length - 1; i >= 0; i--) {
        if (triangles[i].userData.remove) {
            scene.remove(triangles[i]);
            triangles.splice(i, 1);
        }
    }
}

function bulletHitEnemy(enemy, particleBodies) {
    // Check for a collision between the enemy and the bullet
    //const contactResult = new CANNON.ContactResult();
    for (let i = particleBodies.length - 1; i >= 0; i--) 
    {
        world.contacts.forEach((contact) => {
            if ((contact.bi === enemy.enemyBody && contact.bj === particleBodies[i]) || (contact.bi === particleBodies[i] && contact.bj === enemy.enemyBody)) {
              // The bullet hit the enemy

              if(enemy.enemyHealth > 0) enemy.enemyHealth -= 25;
              else 
              {
                explosion(enemy);

                enemySpeed += 0.06;
                enemyHit.play();
                enemy.setPos();
                enemy.enemyHealth = 100;

                currScore += 10 * enemySpeed;
                document.getElementById('scoreText').innerText = Math.abs(currScore.toFixed(0));
              }
            }
          }); 
    }
}

function enemyHitPlayer(enemy, playerBody) {
    // Check for a collision between the enemy and the bullet
    //const contactResult = new CANNON.ContactResult();
    world.contacts.forEach((contact) => {
      if ((contact.bi === enemy.enemyBody && contact.bj === playerBody) || (contact.bi === playerBody && contact.bj === enemy.enemyBody)) {
        // The enemy hit the player

        explosion(enemy);

        if(playerHealth > 0.1)
        {
            if(playerHealth < 4) playerHealth -= playerHealth + 0.5;
            else playerHealth -= 4.0;
            document.getElementById('healthText').innerText = Math.abs(playerHealth.toFixed(0));
        }
        else
        {
            isDead = true;
            if(currScore > highScore) 
            {
                highScore = currScore;
                document.getElementById('highScoreText').innerText = Math.abs(highScore.toFixed(0));
            }
            controls.unlock();
        } 

        glitch.style.opacity = 0.70;
        glitchTemp = 0.70;

        playerHit.play();
        //enemyHit.play();
        enemy.setPos();
        enemy.enemyHealth = 100;
      }
    });
}


// Create an instance of the Enemy class
let enemy1 = new Enemy(scene, world, playerBody);
enemy1.setPos();
let enemy2 = new Enemy(scene, world, playerBody);
enemy2.setPos();
let enemy3 = new Enemy(scene, world, playerBody);
enemy3.setPos();
let enemy4 = new Enemy(scene, world, playerBody);
enemy4.setPos();
let enemy5 = new Enemy(scene, world, playerBody);
enemy5.setPos();
let enemy6 = new Enemy(scene, world, playerBody);
enemy6.setPos();
let enemy7 = new Enemy(scene, world, playerBody);
enemy7.setPos();
let enemy8 = new Enemy(scene, world, playerBody);
enemy8.setPos();
let enemy9 = new Enemy(scene, world, playerBody);
enemy9.setPos();
let enemy10 = new Enemy(scene, world, playerBody);
enemy10.setPos();


let enemies = [];
const enemyRadiusMin = 20;
const enemyRadiusMax = 50;
const maxEnemies = 5;

// Restart Function
function restart()
{
    isDead = false;

    controls.moveForward = false;
    controls.moveLeft = false;
    controls.moveBackward = false;
    controls.moveRight = false;
    controls.canSprint = false;

    music.play();

    playerHealth = 100;
    controls.stamina = 100;
    playerBody.position.set(0,5,0);

    lmb = false;
    lFired = true;
    lHeat = 0;
    document.getElementById('lText').innerText = Math.abs(lHeat.toFixed(0));
    lCurSpin = 0;

    rmb = false;
    rFired = true;
    rHeat = 0;
    document.getElementById('rText').innerText = Math.abs(rHeat.toFixed(0));
    rCurSpin = 0;

    currScore = 0;
    document.getElementById('scoreText').innerText = Math.abs(currScore.toFixed(0));
    
    enemySpeed = 6;

    enemy1.setPos();
    enemy2.setPos();
    enemy3.setPos();
    enemy4.setPos();
    enemy5.setPos();
    enemy6.setPos();
    enemy7.setPos();
    enemy8.setPos();
    enemy9.setPos();
    enemy10.setPos();
}

//---------------------------------------------------------------
//const enemy = new Enemy(scene, world, playerBody);

// Rendering Loop
function animate()
{
    requestAnimationFrame(animate);

    const time = performance.now();

    const delta = (time - prevTime) / 1000;

    if(controls.enabled)
    {
        world.step(delta);

        updateParticles();

        //enemy.update();

        enemy1.update();
        enemyHitPlayer(enemy1, playerBody);
        bulletHitEnemy(enemy1, particleBodies);
        enemy2.update();
        enemyHitPlayer(enemy2, playerBody);
        bulletHitEnemy(enemy2, particleBodies);
        enemy3.update();
        enemyHitPlayer(enemy3, playerBody);
        bulletHitEnemy(enemy3, particleBodies);
        enemy4.update();
        enemyHitPlayer(enemy4, playerBody);
        bulletHitEnemy(enemy4, particleBodies);
        enemy5.update();
        enemyHitPlayer(enemy5, playerBody);
        bulletHitEnemy(enemy5, particleBodies);
        enemy6.update();
        enemyHitPlayer(enemy6, playerBody);
        bulletHitEnemy(enemy6, particleBodies);
        enemy7.update();
        enemyHitPlayer(enemy7, playerBody);
        bulletHitEnemy(enemy7, particleBodies);
        enemy8.update();
        enemyHitPlayer(enemy8, playerBody);
        bulletHitEnemy(enemy8, particleBodies);
        enemy9.update();
        enemyHitPlayer(enemy9, playerBody);
        bulletHitEnemy(enemy9, particleBodies);
        enemy10.update();
        enemyHitPlayer(enemy10, playerBody);
        bulletHitEnemy(enemy10, particleBodies);

        if(glitchTemp > 0)
        {
            glitchTemp = glitchTemp - 0.015;
            glitch.style.opacity = glitchTemp;
            //console.log("Glitch Opacity:",glitch.opacity);
        }

        if(playerHealth < 100)
        {
            playerHealth += 0.005;
            document.getElementById('healthText').innerText = Math.abs(playerHealth.toFixed(0));
        }

        if(controls.stamina < 100)
        {
            if(controls.stamina < 0)
            {
                controls.exhausted = true;
                document.getElementById('staminaText').style.color = 'red';
            }
            else if(controls.stamina > 20)
            {
                controls.exhausted = false;
                document.getElementById('staminaText').style.color = 'white';
            }
            controls.stamina += 0.05;
            document.getElementById('staminaText').innerText = Math.abs(controls.stamina.toFixed(0));
        }


        //Audio controls
        // Set walksound based on sprint
        if(controls.canSprint && !controls.exhausted) walkSound.playbackRate = 1.3;//1.5
        else walkSound.playbackRate = 1;//1.2

        // Play walksound
        if((controls.moveForward || controls.moveBackward || controls.moveLeft || controls.moveRight) && controls.canJump) walkSound.play();
        else if(!walkSound.isPlaying) walkSound.stop();

        // Display spritn lines
        if((controls.moveForward || controls.moveBackward || controls.moveLeft || controls.moveRight) && controls.canSprint && !controls.exhausted) sprint.style.display = '';
        else sprint.style.display = 'none';

        // Stomp and Jump sounds
        if(controls.canJump)
        {
            if(!stomped)
            {
                stompSound.play();
                stomped = true;
            }
            canJump = true;
        }

        // Left Gun
        if(lmb)
        {
            if(lCurSpin < maxSpin)
            {
                lCurSpin += 0.001;
                lWindUp.play();
            }
            else
            {
                lWindUp.stop();

                if(lGunSound.isPlaying && !lFired && lHeat < maxHeat)
                {
                    lHeat += 1.0;
                    //let lColor = lHeat / 10.0;
                    document.getElementById('lText').innerText = Math.abs(lHeat.toFixed(0));
                    //document.getElementById('lText').setr
                    lFired = true;
                    createParticle(lGunMesh);
                    
                }
                else if(!lGunSound.isPlaying) lFired = false;

                if(lHeat < maxHeat && !lOverheated) lGunSound.play();
                else
                {
                    if(!lOverheated) lOverheatSound.play();
                    lOverheated = true;

                    document.getElementById('lText').style.color = 'red';

                    if(lClickSound.isPlaying && !lClicked)
                    {
                        lHeat -= 0.5;
                        document.getElementById('lText').innerText = Math.abs(lHeat.toFixed(0));
                        lClicked = true;
                    }
                    else if(!lClickSound.isPlaying) lClicked = false;
                    
                    if(lHeat <= minHeat)
                    {
                        lOverheated = false;
                        document.getElementById('lText').style.color = 'white';
                    } 

                    lClickSound.play();
                }
            } 
            lGunMesh.rotation.z -= lCurSpin;
        }
        else
        {
            if(lCurSpin > 0)
            {
                lCurSpin -= 0.001;
                lGunMesh.rotation.z -= lCurSpin;
                lWindDown.play();
            }

            if(lHeat > 0)
            {
                lHeat -= 0.15;
                document.getElementById('lText').innerText = Math.abs(lHeat.toFixed(0));
                if(lHeat <=minHeat) document.getElementById('lText').style.color = 'white';
            }
        }

        //-----------------------------

        // Right Gun
        if(rmb)
        {
            if(rCurSpin < maxSpin)
            {
                rCurSpin += 0.001;
                rWindUp.play();
            }
            else
            {
                rWindUp.stop();

                if(rGunSound.isPlaying && !rFired && rHeat < maxHeat)
                {
                    rHeat += 1.0;
                    document.getElementById('rText').innerText = Math.abs(rHeat.toFixed(0));
                    rFired = true;
                    createParticle(rGunMesh);
                    
                }
                else if(!rGunSound.isPlaying) rFired = false;

                if(rHeat < maxHeat && !rOverheated) rGunSound.play();
                else
                {
                    if(!rOverheated) rOverheatSound.play();
                    rOverheated = true;

                    document.getElementById('rText').style.color = 'red';

                    if(rClickSound.isPlaying && !rClicked)
                    {
                        rHeat -= 0.5;
                        document.getElementById('rText').innerText = Math.abs(rHeat.toFixed(0));
                        rClicked = true;
                    }
                    else if(!rClickSound.isPlaying) rClicked = false;
                    
                    if(rHeat <= minHeat)
                    {
                        rOverheated = false;
                        document.getElementById('rText').style.color = 'white';
                    } 

                    rClickSound.play();
                }
            } 
            rGunMesh.rotation.z -= rCurSpin;
        }
        else
        {
            if(rCurSpin > 0)
            {
                rCurSpin -= 0.001;
                rGunMesh.rotation.z -= rCurSpin;
                rWindDown.play();
            }

            if(rHeat > 0)
            {
                rHeat -= 0.15;
                document.getElementById('rText').innerText = Math.abs(rHeat.toFixed(0));
                if(rHeat <=minHeat) document.getElementById('rText').style.color = 'white';
            }
        }

        updateTriangles();
    }

    //. . .

    prevTime = time;

    controls.update(delta);
    renderer.render(scene, camera);
    //cannonDebugRenderer.update();
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}