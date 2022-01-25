import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BoxGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three';

const app = document;
const win = window;
export class ProtoBase{

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    bounds: Vector3

    constructor() {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(
            75, win.innerWidth / win.innerHeight, 0.001, 2000);
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(win.innerWidth, win.innerHeight);
        app.body.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        app.addEventListener('click', this.onMouse, false);
        this.bounds = new Vector3(2.2, 2.2, 2.2);

        const geometry2: BoxGeometry = new BoxGeometry(this.bounds.x, this.bounds.y, this.bounds.z);
        const material2: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
        material2.transparent = true;
        material2.opacity = .08;
        const cube2: Mesh = new Mesh(geometry2, material2);
        this.scene.add(cube2);

        // Simple lighting calculations
        const color = 0xEEEEFF;
        const intensity = .85;
        const light = new THREE.AmbientLight(color, intensity);
        this.scene.add(light);

        const color2 = 0xFFFFDD;
        const intensity2 = 1;
        const light2 = new THREE.DirectionalLight(color, intensity);
        light2.position.set(-2, 6, 1);

        this.scene.add(light2);

        this.camera.position.y = .8;
        this.camera.position.z = 3;

        win.addEventListener('resize', this.onWindowResize, false);
        win.addEventListener('mousemove', this.onMouseMove, false);


    }

    add(anything: Mesh):void {
        console.log("In add");
        this.scene.add(anything);
    }

    onWindowResize() {
        this.camera.aspect = win.innerWidth / win.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(win.innerWidth, win.innerHeight);
        this.render();
    }

    onMouse(event: MouseEvent) {
    }

    onMouseMove(event: MouseEvent) {
    }

   setup():void{}

    run(): void { }

    render(): void {
        this.renderer.render(this.scene, this.camera);
    }
}

function animate() {
    win.requestAnimationFrame(animate);
    p.controls.autoRotate = true;
    p.camera.lookAt(p.scene.position); //0,0,0

    // custom
    p.run();

    p.controls.update();
    p.render();
}


// begin app
let p = new ProtoBase();
p.setup();
animate();
