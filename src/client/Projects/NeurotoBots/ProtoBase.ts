import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BoxGeometry, BufferGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';

export class ProtoBase {

    const scene?: Scene;
    const camera?: PerspectiveCamera;
    const renderer?: THREE.WebGLRenderer;
    const controls?: OrbitControls;
    const document?: Document;
    const bounds?: Vector3

    constructor() {
        this.scene = new Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.001, 2000);
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        document.addEventListener('click', this.onMouse, false);
        this.bounds = new Vector3(2.2, 2.2, 2.2);

        const geometry2: BoxGeometry = new BoxGeometry(this.bounds.x, this.bounds.y, this.bounds.z);
        const material2: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
        material2.transparent = true;
        material2.opacity = .08;
        const cube2: Mesh = new Mesh(geometry2, material2);
        this.scene.add(cube2);
    }

    // Custom Geometry
    // cube bounds

    // Create/add outer box

    onMouse(event: MouseEvent) {
    }


    onMouseMove(event: MouseEvent) {
    }

    animate() {
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    this.animate();
}
