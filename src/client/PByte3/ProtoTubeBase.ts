// Base class for ProtoByte Tube Geometry
// Note: skinning is a 1-dimensional chain along y-axis

import { Mesh, SkinnedMesh, Box3, Vector3, Bone, Uint16BufferAttribute, Float32BufferAttribute, MeshPhongMaterial, Skeleton, Group, Line } from "three";

export abstract class ProtoTubeBase extends Group {
    dim: Vector3;
    tubeMesh?: Mesh;
    pathVecs: Vector3[] = [];

    // temporary solution, needs to be put in a base calss eventually
    boneCount?: number;
    curveLenth?: number
    curveLengths: number[] = [];

    constructor(dim: Vector3 = new Vector3(1, 1, 1)) {
        super();
        this.dim = dim;
    }

    // requires implementation in all derived classes
    abstract create(): void;

    // createSkeletalSpine(){
    // }
    
    
    makeSkinned(mesh: Mesh, boneCount: number, curveLength: number): SkinnedMesh {
        //console.log('passed m - ', m);
        let nBones: number = boneCount;
        // console.log("pb.boneCount = ", pb.boneCount);
        // console.log("pb.pathVecs.length = ", pb.pathVecs.length);
        // console.log("m.geometry.attributes.position.count = ", m.geometry.attributes.position.count);

        var box = new Box3().setFromObject(mesh);
        let meshDim = new Vector3();
        meshDim.subVectors(box.max, box.min);
        // console.log("meshDim  ,", meshDim);

        let bones = [];
        let position = mesh.geometry.attributes.position;
        //let boneMod = Math.floor(position.count / nBones);
        let seg = curveLength / boneCount;
        let prevBone = new Bone();
        bones.push(prevBone);
        prevBone.position.y = -curveLength / 2;
        for (let i = 0; i < boneCount; i++) {
            const bone = new Bone();
            bone.position.y = seg;
            bones.push(bone);
            prevBone.add(bone);
            prevBone = bone;
        }

        //  create indices and weights
        const vertex = new Vector3();
        // get buffergeometry

        let skinIndices = [];
        let skinWeights = [];
        let weightMod = Math.floor(position.count / boneCount);

        // console.log("weightMod = ", weightMod);
        for (let i = 0, j = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);
            const y = vertex.y + curveLength / 2;
            let skinIndex = Math.floor(y / seg);
            let skinWeight = (y % seg) / seg;

            skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
            skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
        }
        mesh.geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
        mesh.geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
        let mat2 = new MeshPhongMaterial();
        let skin = new SkinnedMesh(mesh.geometry, mesh.material);
        let skeleton = new Skeleton(bones);
        let rootBone = skeleton.bones[0];
        skin.add(rootBone);
        // bind the skeleton to the mesh
        skin.bind(skeleton);
        skin.geometry.attributes.position.needsUpdate = true;
        return (skin);
    }
    abstract move(time: number): void;

}