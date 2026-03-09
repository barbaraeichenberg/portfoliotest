const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2, 4, 4, 4);
const material = new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.6 });
const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), material);
scene.add(wireframe);

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let momentum = { x: 0.005, y: 0.005 }; 

const startDrag = (e) => {
    isDragging = true;
    document.body.classList.add('dragging');
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    previousMousePosition = { x: clientX, y: clientY };
};

const stopDrag = () => {
    isDragging = false;
    document.body.classList.remove('dragging');
};

const drag = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaMove = {
        x: clientX - previousMousePosition.x,
        y: clientY - previousMousePosition.y
    };

    momentum.x = deltaMove.x * 0.005;
    momentum.y = deltaMove.y * 0.005;

    wireframe.rotation.y += momentum.x;
    wireframe.rotation.x += momentum.y;

    previousMousePosition = { x: clientX, y: clientY };
};

container.addEventListener('mousedown', startDrag);
window.addEventListener('mouseup', stopDrag);
window.addEventListener('mousemove', drag);

container.addEventListener('touchstart', startDrag, { passive: false });
window.addEventListener('touchend', stopDrag);
window.addEventListener('touchmove', drag, { passive: false });

const animate = () => {
    requestAnimationFrame(animate);
    
    if (!isDragging) {
        wireframe.rotation.y += momentum.x;
        wireframe.rotation.x += momentum.y;
        
        momentum.x *= 0.95;
        momentum.y *= 0.95;
        
        if (Math.abs(momentum.x) < 0.001) momentum.x = 0.002;
        if (Math.abs(momentum.y) < 0.001) momentum.y = 0.002;
    }

    renderer.render(scene, camera);
};

animate();

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
