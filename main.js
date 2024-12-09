import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ColorCorrectionShader } from 'three/examples/jsm/shaders/ColorCorrectionShader.js';
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();


//scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 0);
camera.position.z = 5;
scene.add(camera);

//hdri
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./sdlight.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
});

//model loader
let model;
const loader = new GLTFLoader();
loader.load(
    './DamagedHelmet.gltf', // Path to your GLTF file in public folder
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error occurred loading the model:', error);
    }
);

//renderer
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add color correction pass for blue tint
const colorCorrectionPass = new ShaderPass(ColorCorrectionShader);
colorCorrectionPass.uniforms['powRGB'].value = new THREE.Vector3(1, 1, 1);
colorCorrectionPass.uniforms['mulRGB'].value = new THREE.Vector3(0.3, 0.7, 1.4); // Deeper ocean blue tint
composer.addPass(colorCorrectionPass);

// Existing RGB shift pass
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0015;
composer.addPass(rgbShiftPass);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

window.addEventListener("mousemove", (e)=>{
    if(model){
        const rotationX = (e.clientX/innerWidth - 0.5) * (Math.PI * 0.12)
        const rotationY = (e.clientY/innerHeight - 0.5) * (Math.PI * 0.12)
        gsap.to(model.rotation, {
            x: rotationY,
            y: rotationX,
            duration: 0.5,
            ease: "power2.out"
        });
    }
    console.log(e.clientX, e.clientY);
})
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});


//animation
function animate(){
    requestAnimationFrame(animate);
    // controls.update();
    composer.render();
}
animate();
