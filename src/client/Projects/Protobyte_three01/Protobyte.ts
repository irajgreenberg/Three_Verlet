import { trace } from "console";
import * as THREE from "three";
import { Bone, CatmullRomCurve3, Curve, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Skeleton, SkeletonHelper, SkinnedMesh, TubeBufferGeometry, TubeGeometry, Uint16BufferAttribute, Vector3 } from "three";
import { FuncType, PBMath } from "../../PByte3/IJGUtils";
import { ProtoTubeGeometry } from "../../PByte3/ProtoTubeGeometry";

export class Protobyte extends Group {

    constructor() {
        super();
        class CustomSinCurve extends Curve<Vector3> {
            scale: number;
            constructor(scale: number = 1) {

                super();

                this.scale = scale;

            }

            getPoint(t: number, optionalTarget = new Vector3()) {
                console.log(t);
                const tx = Math.sin(2 * Math.PI * t * 3) * .4;
                const ty = -1 + t * 2 - Math.cos(3 * Math.PI * t) * .4
                const tz = Math.cos(2 * Math.PI * t * 3) * .4;

                return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);

            }

        }

        const tubeSegs = 400;
        const path = new CustomSinCurve(100);
        //let curveSegs = 10;
        let radii: number[] = [];
        for (let i = 0; i < tubeSegs; i++) {
            radii[i] = PBMath.rand(23.2, 38.8);
        }

        const texture = new THREE.TextureLoader().load("textures/corroded_red.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 1);

        // constructor(path: Curve<Vector3>, tubularSegments, radialSegments, closed, radExpr})
        //const geometry = new ProtoTubeGeometry(path, tubeSegs, 20, false, { func: FuncType.SINUSOIDAL, min: 10, max: 90, periods: 12 });
        const geometry = new ProtoTubeGeometry(path, tubeSegs, 20, false, { func: FuncType.LINEAR, min: 0, max: 30, periods: 32 });
        const geometry2 = new ProtoTubeGeometry(path, tubeSegs / 10, 20, false, { func: FuncType.SINUSOIDAL, min: 1, max: 8, periods: 4 });
        const material = new MeshPhongMaterial({ color: 0xff8888, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: .5, bumpMap: texture, bumpScale: 0, shininess: .8 });
        const mesh = new Mesh(geometry, material);
        this.add(mesh);

        const material2 = new MeshPhongMaterial({ color: 0xFF0000, wireframe: true, side: DoubleSide, map: texture, transparent: true, opacity: .4, bumpMap: texture, bumpScale: 0, shininess: .75 });
        const mesh2 = new Mesh(geometry2, material2);
        this.add(mesh2);

        const spineGeom = new ProtoTubeGeometry(path, tubeSegs / 10, 20, false, { func: FuncType.SINUSOIDAL, min: 0, max: 4, periods: 4 });
        const spineMat = new MeshPhongMaterial({ color: 0xFF7700, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: .8, bumpMap: texture, bumpScale: 0, shininess: .8 });
        const spineMesh = new Mesh(spineGeom, spineMat);
        this.add(spineMesh);


        // //mesh2.scale.multiplyScalar(1.0001)
        // this.add(mesh2);

        // let s = this.makeSkinned(mesh2); // pass in a completed protoTube with geom and material and receive a skinned version
        // this.add(s);

    }

    // From Dave to create bone driven animation
    // not currently used
    makeSkinned(tube: any): SkinnedMesh {
        let nBones = tube.tubularSegments;
        let bones = new Array(nBones);
        // make bones
        for (let i = 0; i < nBones; i++) {
            bones[i] = new Bone();
            if (i == 0) {
                bones[i].position.y = tube.path.getPointAt(i / tube.tubularSegments).y;
            } else {
                bones[i].position.y = nBones;
                bones[i - 1].add(bones[i]);
            }
        }

        //  traverses position index assigning a bone index and influence factor to each point
        let position = tube.position;
        let segmentHeight = position.count / nBones / tube.rdialSegments;
        let segmentCount = nBones;
        let totalHeight = segmentCount * segmentHeight;

        //  const position = geometry.attributes.position;
        let vertex = new Vector3();
        let skinIndices = [];
        let skinWeights = [];
        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);
            let y = (vertex.y + totalHeight / 2);
            let skinIndex = Math.floor(y / segmentHeight);
            let skinWeight = (y % segmentHeight) / segmentHeight;
            skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
            skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
        }
        tube.geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
        tube.geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
        console.log(skinIndices, skinWeights);

        let skin = new SkinnedMesh(tube.goemetry, tube.material);
        let skeleton = new Skeleton(bones);
        let rootBone = skeleton.bones[0];
        skin.add(rootBone);
        // bind the skeleton to the mesh
        skin.bind(skeleton);
        //  scene.add(skin);

        //  scene.add(this.ns);
        // let skelHelper = new SkeletonHelper(skin);
        // this.add(skelHelper);
        return skin;
    }

    move() {
        // //put this in render:
        // const time = Date.now() * 0.001;
        // for (let i = 0; i < mm.skeleton.bones.length; i++) {
        //  s.skeleton.bones[i].rotation.x = Math.sin(time) * 2 / s.skeleton.bones.length;
        //  s.skeleton.bones[i].rotation.y = Math.sin(time) * 3 / s.skeleton.bones.length;
        //  s.skeleton.bones[i].rotation.z = Math.sin(time) * 4 / s.skeleton.bones.length;
        // }

    }
}