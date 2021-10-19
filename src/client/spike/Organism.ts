import * as THREE from 'three';
import { BufferGeometry, Color, Group, LineCurve, LineSegments, Mesh, MeshPhongMaterial, TorusKnotGeometry, Vector2, Vector3 } from "three";
import { AnchorPoint, GeometryDetail } from "../../PByte3/IJGUtils";
import { VerletNode } from "../../PByte3/VerletNode";
import { VerletStick } from "../../PByte3/VerletStick";
import { VerletStrand } from '../../PByte3/VerletStrand';
import { VerletTetrahedron } from '../../PByte3/VerletTetrahedron';
import { Propulsion, VerletMaterials } from '../../PByte3/IJGUtils';
import { EpidermalHood } from '../../PByte3/EpidermalHood';
import { VerletSphere } from '../../PByte3/VerletSphere';

export class Organism extends Group {

    globalCounter: number = 0;
    ova?: VerletSphere;
    ovaStickColorAlpha: number = 0;
    ovaPulseIndices: number[] = [];
    isOvaBirth: boolean = false;
    isOvaCiliaBirth: boolean = false;
    ovaCiliaAlpha: number = 0
    amps: number[] = [];
    freqs: number[] = [];
    thetas: number[] = [];


    egg?: Mesh;
    eggGeometry?: TorusKnotGeometry;
    eggMaterial?: MeshPhongMaterial;
    eggWireframe?: LineSegments;
    eggCilia: VerletStrand[] = []; // do I need this?
    //eggVerts: Vector3[];
    //eggVerts = [];
    isEggBirth: boolean = false;
    tet?: VerletTetrahedron;
    tetCounter: number = 0;
    eggToTetLines: THREE.Line[] = [];
    stageCounter: number = 0;
    tendrils: VerletStrand[] = new Array(0);
    tendrilCounter: number = 0;
    cilia: VerletStrand[] = new Array(0);
    ciliaCounter: number = 0;
    epidermalCover?: EpidermalHood;
    isHoodReady: boolean = false;
    epidermalCoverAlpha: number = 0;
    nodeType?: GeometryDetail;

    finalTethers: VerletStick[] = [];
    finalTetherAlphas: number[] = [];


    // cube bounds
    const bounds: THREE.Vector3 = new Vector3(5, 5, 5);
    const tetBounds: THREE.Vector3 = new Vector3(.85, 2, .85);
    //createCubeConstraints(bounds, false);
    //createCubeConstraints(tetBounds, false);



    constructor() {
        super();
        this.hatch();
        this.addTet();
    }



    // setLighting();
    // camera.position.y = .05;
    // camera.position.z = 1;
    // let cameraTheta3D = new Vector3();

    // window.addEventListener('resize', onWindowResize, false);

    //convenience function to collect nodes for cilia attachment
    getAllTendrilNodes(): VerletNode[] {
        let allNodes: VerletNode[] = [];
        for (var i = 0; i < this.tendrils.length; i++) {
            for (var j = 0; j < this.tendrils[i].nodes.length; j++) {
                allNodes.push(this.tendrils[i].nodes[j]);
            }
        }
        return allNodes;
    }

    // Birth stage - egg
    hatch(): void {
        //test
        let vals: number[] = [0];
        //ova = new VerletSphere(new Vector3(), new Vector2(.075, .1), 18, 18);
        this.ova = new VerletSphere(new Vector3(), new Vector2(.075 * 2.5, .1 * 2.4), 18, 18);
        this.ova.setStickColor(new Color(0X7777DD), this.ovaStickColorAlpha);
        this.ova.addTendrils(12, .9);
        this.ova.setTendrilOpacity(this.ovaCiliaAlpha);
        this.ova.setNodeVisibility(true);
        this.add(this.ova);
        for (var i = 0, j = 0; i < this.ova.nodes.length; i++, j++) {
            if (i % 2 == 0) {
                this.ovaPulseIndices.push(i);
                this.amps.push(THREE.MathUtils.randFloat(.007, .04))
                this.freqs.push(THREE.MathUtils.randFloat(Math.PI / 120, Math.PI / 15))
                this.thetas.push(0);
            }
        }
        //ova.push(vals, new Vector3(.02, .003, .004));

        this.eggGeometry = new THREE.TorusKnotGeometry(.09, .05, 24, 8, 1, 2);
        //eggGeometry.dynamic = true;
        this.eggMaterial = new THREE.MeshPhongMaterial({ color: 0XBB3300, wireframe: true });
        this.eggMaterial.opacity = 0;
        this.eggMaterial.transparent = true;
        this.egg = new Mesh(this.eggGeometry, this.eggMaterial);
        this.add(this.egg);
        //eggVerts = eggGeometry.vertices;
        // eggVerts = egg.geometry.attributes.position
        // console.log("egg.geometry.attributes.position = ", egg.geometry.attributes.position)

    }

    //this.hatch();

    // stage 1 - Tetrahedral core
    addTet() {
        //pos: Vector3, radius: number, tension: number, isGrowable: boolean
        //tet = new VerletTetrahedron(new Vector3(0, -.75, 0), .3, .03, true);
        this.tet = new VerletTetrahedron(new Vector3(0, 0, 0), .6, .03, true);
        this.tet.tetraTendrils[0].setStrandMaterials(new THREE.Color(0xaa11dd), .35);
        this.tet.tetraTendrils[1].setStrandMaterials(new THREE.Color(0xFdd5522), .35);
        this.tet.tetraTendrils[2].setStrandMaterials(new THREE.Color(0xaa22ff), .35);
        this.tet.tetraTendrils[3].setStrandMaterials(new THREE.Color(0x8822ff), .35);
        this.tet.tetraTendrils[5].setStrandMaterials(new THREE.Color(0x99aa99), .35);
        this.tet.tetraTendrils[7].setStrandMaterials(new THREE.Color(0x999922), .35);
        this.tet.setNodesScale(3.4);
        this.tet.setNodesColor(new THREE.Color(0X996611));
        this.tet.setSticksColor(new THREE.Color(0XFF0000));
        this.tet.setSticksOpacity(0);
        this.add(this.tet);
        this.tet.moveNode(0, new Vector3(.02, -.006, .04))
        this.tet.moveNode(1, new Vector3(-.02, .006, -.04))
        this.add(this.tet);
    }
    //this.addTet();

    // Tendrils
    addTendril(pos: THREE.Vector3) {
        // const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), THREE.MathUtils.randFloat(.01, .1),
        //     new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);

        const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), 10,
            new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);
        let segCount = THREE.MathUtils.randInt(10, 25);
        segCount = 20;
        let tempVec = new Vector3(this.tet.nodes[0].position.x * .01, this.tet.nodes[0].position.y * .01, this.tet.nodes[0].position.z * .01);
        // let ns = new VerletStrand(tet.nodes[0].position, n.position, segCount, AnchorPoint.HEAD,
        //     THREE.MathUtils.randFloat(.001, .4), GeometryDetail.OCTA);

        let ns = new VerletStrand(this.tet.nodes[0].position, tempVec, segCount, AnchorPoint.HEAD,
            THREE.MathUtils.randFloat(.7, .9), GeometryDetail.SPHERE_LOW);
        ns.setNodesScale(THREE.MathUtils.randInt(10, 18));
        ns.setNodesColor(new THREE.Color('#5b5b3e'));
        ns.setStrandMaterials(new THREE.Color(.3, .5, 1), .3);
        this.tendrils.push(ns);
        ns.setNodeVisible(0, false);
        this.add(ns);

        ns.moveNode(ns.nodes.length - 1,
            new THREE.Vector3(THREE.MathUtils.randFloatSpread(.08),
                THREE.MathUtils.randFloatSpread(.08),
                THREE.MathUtils.randFloatSpread(.08)));
    }

    // Cilia
    addCilia(ciliaSegments: number = 0.0, cilialLength: number = 0.0, ciliaTension: number) {
        let ciliaNodes: VerletNode[] = this.getAllTendrilNodes();
        for (var i = 0; i < this.tendrils.length; i++) {
            for (var j = 0; j < this.tendrils[i].nodes.length; j++) {
                let k = this.tendrils[i].nodes.length * i + j;
                let vec = ciliaNodes[k].position.clone();
                vec.normalize();
                vec.multiplyScalar(cilialLength * .125);
                this.cilia.push(new VerletStrand(ciliaNodes[k].position,
                    new THREE.Vector3(ciliaNodes[k].position.x - vec.x,
                        ciliaNodes[k].position.y - vec.y,
                        ciliaNodes[k].position.z - vec.z),
                    ciliaSegments,
                    AnchorPoint.HEAD,
                    ciliaTension, GeometryDetail.TRI));
                //cilia[k].setNodesScale(3);
                this.cilia[k].setStrandMaterials(new Color(0XEEEEEE), .25);

                this.add(this.cilia[k]);
            }
        }
    }

    // Hood
    addHood() {
        //console.group("in addhood func");
        this.epidermalCover = new EpidermalHood(new THREE.Vector3(0, .50, 0), .59, .65, 30, 20, .675, [GeometryDetail.ICOSA, GeometryDetail.TETRA, GeometryDetail.TRI]);
        this.epidermalCover.addHangingTendrils(12, 1.2, .6);
        this.epidermalCover.addCilia(2, .05, .85);
        this.epidermalCover.setDynamics(new Propulsion(new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, -.09, 0),
            new THREE.Vector3(0, Math.PI / 500, 0)));
        this.epidermalCover.setMaterials(new VerletMaterials(
            new THREE.Color(.8, .6, 8),  /*node color*/
            new THREE.Color(.4, .6, .75), /*spine color*/
            .45,                          /*spine alpha*/
            new THREE.Color(0, .2, .4),  /*slice color*/
            .65,                          /*slice alpha*/
            new THREE.Color(1, .6, .7),  /*tendril node color*/
            new THREE.Color(.3, .1, .55),  /*tendril color*/
            1,                          /*tendril alpha*/
            new THREE.Color(.9, 1, 1),  /*cilia node color*/
            new THREE.Color(1, .6, .1),  /*cilia color*/
            .4));                        /*cilia alpha*/


        this.epidermalCover.setNodesScale(10.2, 9, 3, true);
        this.epidermalCover.setNodesVisible(true, true, true);
        this.epidermalCover.setAllOpacity(this.epidermalCoverAlpha);
        // scene.add(epidermalCover);
        this.isHoodReady = false;

        // add yellow tethers from tet nodes to top nodes of hood
        for (var i = 0; i < this.tet.nodes.length; i++) {
            this.finalTethers.push(new VerletStick(this.tet.nodes[i],
                this.epidermalCover.spines[i].nodes[this.epidermalCover.spines[i].nodes.length - 1],
                .2, AnchorPoint.TAIL));
                this.finalTethers[i].setColor(new Color(1, .6, 0));
                this.finalTetherAlphas[i] = 0;
                this.finalTethers[i].setOpacity(this.finalTetherAlphas[i]);
            //finalTethers[0].lineGeometry.elementsNeedUpdate = true;
            // scene.add(finalTethers[i]);
        }
    }
    //addHood();

    // Enables placement of nodes in world space based on mousepress (screenspace placement)
    getScreenPos(clientPos2: Vector2): Vector3 {
        // unproject algorithm from: WestLangley
        // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse

        vec.set(
            (clientPos2.x / window.innerWidth) * 2 - 1,
            - (clientPos2.y / window.innerHeight) * 2 + 1,
            0.5);

        vec.unproject(camera);
        vec.sub(camera.position).normalize();
        var distance = - camera.position.z / vec.z;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));
        return pos;
    }



    updateNodes() {
        let k = 0;
        for (var i = 0; i < this.tendrils.length; i++) {
            this.tendrils[i].verlet();
            this.tendrils[i].setHeadPosition(this.tet.nodes[i].position);
            this.tendrils[i].constrainBounds(bounds);

            if (this.cilia.length > 0) {
                for (var j = 0; j < this.tendrils[i].nodes.length; j++) {
                    k = this.tendrils[i].nodes.length * i + j;
                    this.cilia[k].verlet();
                    this.cilia[k].setHeadPosition(this.tendrils[i].nodes[j].position);
                    this.cilia[k].constrainBounds(bounds);

                }
            }
        }
    }

    live() {
        if (this.isOvaBirth) {
            this.ova.setStickColor(new Color(0X7777DD), this.ovaStickColorAlpha);
            this.ova.verlet();
            this.ova.constrain(bounds);
            this.ova.pulseIndices(this.ovaPulseIndices, this.amps, this.freqs, this.thetas);
            if (this.ovaStickColorAlpha < .3) {
                this.ovaStickColorAlpha += .01;
            }
        }

        if (this.isEggBirth) {
            let m = this.egg.material as THREE.MeshPhongMaterial;
            if (m.opacity < .3) {
                m.opacity += .01;
            }
            if (this.egg !== undefined) {
                this.egg.rotateX(Math.PI / 180);
                this.egg.rotateY(Math.PI / 45);
                this.egg.rotateZ(Math.PI / 30);
            }
        }

        if (this.isOvaCiliaBirth) {
            if (this.ovaCiliaAlpha < .35) {
                this.ovaCiliaAlpha += .01;
            }
            this.ova.setTendrilOpacity(this.ovaCiliaAlpha)
        }


        if (this.tet !== undefined) {
            this.tet.verlet();
            this.tet.pulseNode(0, .009, Math.PI / 45);
            let tetAmpsRange = new Vector2(.001, .007);
            let tetFreqs = new Vector2(Math.PI / 1400, Math.PI / 25);
            //tet.pulseNodes(tetAmps, tetFreqs);
            this.tet.constrain(this.tetBounds, new Vector3(0, -1.3, 0));

            for (var t of this.tendrils) {
                t.constrainBounds(this.tetBounds, new Vector3(0, -1.3, 0));
            }

            // move egg to center of dynamic tetrahedron
            const avgPos = new Vector3();
            for (var i = 0; i < this.tet.nodes.length; i++) {
                avgPos.add(this.tet.nodes[i].position)

                // lines between egg and tet nodes
                const points = [];
                points.push(this.egg.position);
                points.push(this.tet.nodes[i].position);
                //let eggToTetLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                if (this.eggToTetLines[i] !== undefined) {
                    this.eggToTetLines[i].geometry.setFromPoints(points);
                }
            }
            avgPos.divideScalar(this.tet.nodes.length);
            if (this.egg !== undefined) { // super unnecesary
                this.egg.position.set(avgPos.x, avgPos.y, avgPos.z);
                this.ova.position.set(avgPos.x, avgPos.y, avgPos.z);
                //eggWireframe.position.set(avgPos.x, avgPos.y, avgPos.z);
            }
        }

        if (this.epidermalCover !== undefined) {
            this.epidermalCover.pulse();
            this.epidermalCover.constrainBounds(bounds);
        }

        if (this.isHoodReady && this.ciliaCounter > 16) {
            if (this.epidermalCoverAlpha < .34) {
                this.epidermalCoverAlpha += .01;
            }
            this.epidermalCover.setAllOpacity(this.epidermalCoverAlpha);
            for (var i = 0; i < this.tet.nodes.length; i++) {
                if (this.finalTetherAlphas[i] < .2) {
                    this.finalTetherAlphas[i] += .002;
                }
                this.finalTethers[i].setOpacity(this.finalTetherAlphas[i]);
            }

        }

        for (var i = 0; i < this.tet.nodes.length; i++) {
            this.finalTethers[i].constrainLen();
        }

        controls.update()
        updateNodes();
        render();
    };


    // ADD TOUCH EVENTS
    window.addEventListener('touchstart', (event) => {
        // prevent the window from scrolling
        event.preventDefault();
        setPickPosition(event.touches[0]);
    }, { passive: false });
window.addEventListener('touchmove', (event) => {
    setPickPosition(event.touches[0]);

    globalCounter++;
    // 1st mouse press
    // egg wifreame fades in
    if (globalCounter === 1) {
        isOvaBirth = true;
        // knot core fade in
    } else if (globalCounter === 2) {
        isEggBirth = true;
        // tethers fade in
    } else if (globalCounter === 3) {
        isOvaCiliaBirth = true;
    }

    if (globalCounter > 3) {

        // stage 1 - Tetrahedron core
        if (tetCounter < 11) {
            tet.setNode();

            if (tetCounter < 5) {
                let eggToTetLineMaterial = new THREE.LineBasicMaterial({ color: 0x669966 });
                eggToTetLineMaterial.transparent = true;
                eggToTetLineMaterial.opacity = .25;
                const points = [];
                points.push(egg.position);
                points.push(tet.nodes[tetCounter].position);
                let eggToTetLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                eggToTetLines.push(new THREE.Line(eggToTetLineGeometry, eggToTetLineMaterial))
                scene.add(eggToTetLines[tetCounter]);
            }
            tetCounter++;
        }

        // stage 2 - tendrils
        if (tetCounter == 11 && tendrilCounter < 5) {
            // const pos = getScreenPos(new THREE.Vector2(event.clientX, event.clientY))
            //addTendril(pos);
            addTendril(new Vector3(tet.position.x + tet.nodes[tendrilCounter].position.x,
                tet.position.y + tet.nodes[tendrilCounter].position.y,
                tet.position.z + tet.nodes[tendrilCounter].position.z));
            tendrilCounter++;
        }

        // stage 3 - cilia
        if (ciliaCounter++ == 15) {
            addCilia(3, .09, THREE.MathUtils.randFloat(.1, .7));
            isHoodReady = true;
        }

        if (isHoodReady && ciliaCounter > 16) {
            //addHood();
        }
    }

});

window.addEventListener('touchend', clearPickPosition);

function setPickPosition(event: Touch) { }
function clearPickPosition() { }
// END Touch events

// many bad magic nums down here. shameful.
function onMouse(event: MouseEvent) {
    globalCounter++;
    // 1st mouse press
    // egg wifreame fades in
    if (globalCounter === 1) {
        isOvaBirth = true;
        // knot core fade in
    } else if (globalCounter === 2) {
        isEggBirth = true;
        // tethers fade in
    } else if (globalCounter === 3) {
        isOvaCiliaBirth = true;
    }

    if (globalCounter > 3) {

        // stage 1 - Tetrahedron core
        if (tetCounter < 11) {
            tet.setNode();

            if (tetCounter < 5) {
                let eggToTetLineMaterial = new THREE.LineBasicMaterial({ color: 0x669966 });
                eggToTetLineMaterial.transparent = true;
                eggToTetLineMaterial.opacity = .25;
                const points = [];
                points.push(egg.position);
                points.push(tet.nodes[tetCounter].position);
                let eggToTetLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                eggToTetLines.push(new THREE.Line(eggToTetLineGeometry, eggToTetLineMaterial))
                scene.add(eggToTetLines[tetCounter]);
            }
            tetCounter++;
        }

        // stage 2 - tendrils
        if (tetCounter == 11 && tendrilCounter < 5) {
            const pos = getScreenPos(new THREE.Vector2(event.clientX, event.clientY))
            //addTendril(pos);
            addTendril(new Vector3(tet.position.x + tet.nodes[tendrilCounter].position.x,
                tet.position.y + tet.nodes[tendrilCounter].position.y,
                tet.position.z + tet.nodes[tendrilCounter].position.z));
            tendrilCounter++;
        }

        // stage 3 - cilia
        if (ciliaCounter++ == 15) {
            addCilia(3, .09, THREE.MathUtils.randFloat(.1, .7));
            isHoodReady = true;
        }

        if (isHoodReady && ciliaCounter > 16) {
            //addHood();
        }
    }



}