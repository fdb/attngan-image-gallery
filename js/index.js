function random(min, max) {
    return min + Math.random() * (max - min);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minPolarAngle = Math.PI / 2 - 0.6;
controls.maxPolarAngle = Math.PI / 2 + 0.1;
controls.target.y = 2;

const ambientLight = new THREE.AmbientLight(0x202020);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
hemiLight.color.setHSL(0.6, 1, 0.1);
hemiLight.groundColor.setHSL(0.1, 0.2, 0.1);
scene.add(hemiLight);

const gridHelper = new THREE.GridHelper(100, 20);
scene.add(gridHelper);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 10, 5);
scene.add(pointLight);

const groundGeo = new THREE.PlaneBufferGeometry(105, 105);
const groundMat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
groundMat.color.setHSL(0.095, 1, 0.75);
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const textureLoader = new THREE.TextureLoader();

function addBox(imageUrl) {
    const texture = textureLoader.load(imageUrl);
    const geometry = new THREE.BoxGeometry(5, 5, 0.2);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
    const cube = new THREE.Mesh(geometry, material);
    //cube.position.y = 2.5;
    cube.position.setFromCylindricalCoords(random(15, 25), random(-Math.PI * 2, Math.PI * 2), 2.5);
    cube.lookAt(0, 2, 0);
    scene.add(cube);

    const lookAtPosition = new THREE.Vector3(0, 2, 0);
    lookAtPosition.lerp(cube.position, 0.3);
    controls.target.copy(lookAtPosition);
}

// for (let i = 0; i < 100; i++) {
//     addBox('img/attngan-test-image.jpg')
// }

camera.position.z = 5;

function generateImage(caption) {
    const inputs = {
        "caption": caption
    };

    fetch('http://localhost:8001/query', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs)
    })
        .then(response => response.json())
        .then(outputs => {
            const { result } = outputs;
            console.log(result);
            addBox(result);
        })
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

document.getElementById('caption').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const caption = e.currentTarget.value;
        generateImage(caption);
        e.currentTarget.value = '';
    }
})

generateImage('a boat');