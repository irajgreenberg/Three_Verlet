// Parisitic Cleavage, 2022
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from "three";
import { randFloat } from "three/src/math/MathUtils";
import { Parasite } from "./Parasite";


export class ParasiticEmission extends Group {

    orbMesh: Mesh
    orbRad = 0;
    orbRadMax = 700

    // parisite0: Parisite;
    // parisite1: Parisite;
    // parisite2: Parisite;

    parisitePopulation = Math.round(randFloat(10, 15));
    parisites: Parasite[] = [];

    skins = ["bronze_fans", "brown_tile", "brushed_metal", "bumpySand", "chains", "corroded_metal", "corroded_red", "corroded_shipPlate", "corroded", "corrogated_metal_colored", "corrogated_metal2", "cross_hatch", "dirt", "fabric", "fur1", "giraffe", "gold_foil", "gold_foil2", "goldGate", "greenCrocSkin", "grime", "humanSkin01", "humanSkin02", "jellySkin", "leather_skin", "leather2", "lentils", "linen", "meat01", "metal_blue", "metal_chambers01", "metal_dirty01", "metal_flaky_blue", "metal_flaky_red", "metal_grate", "metalTiles01", "moss", "ornateTile", "reptile1", "pitted", "pebbles", "pink_folds", "redFire", "reptile1", "reptile2_invert", "reptile2", "reptile3", "reptile4", "reptile5", "reptile6", "rockWall", "rust01", "rusty_metal", "skin01", "skin02", "skin03", "stoneWall", "vascular", "vascular2", "vascular3", "vascular4", "vascular5", "vascular6"];

    constructor() {
        super();

        // creaate outer orb
        let orbGeom = new SphereGeometry(this.orbRad, 70, 70);
        const col = Math.random() * 0xffffff
        let orbMat = new MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .1 });
        this.orbMesh = new Mesh(orbGeom, orbMat);
        // this.add(this.orbMesh);

        let pc = 0;
        let skinIndex = 0;
        let skinName = ""
        let tubeMin = 0;
        let tubeMax = 0;
        let tubePeriods = 0;

        for (let i = 0; i < this.parisitePopulation; i++) {
            pc = Math.round(randFloat(10, 70));
            tubeMin = randFloat(2, 12);
            tubeMax = randFloat(12, 100);
            tubePeriods = Math.round(randFloat(1, 100));

            skinIndex = Math.floor(Math.random() * this.skins.length);
            skinName = "textures/" + this.skins[skinIndex] + ".jpg";
            console.log("skinIndex = ", skinIndex);

            this.parisites[i] = new Parasite(pc, new Vector2(tubeMin, tubeMax), tubePeriods, new Vector2(1, this.orbRadMax * randFloat(.25, .9)), skinName);
            this.parisites[i], this.castShadow = true;
            this.parisites[i], this.receiveShadow = true;
            this.add(this.parisites[i]);
        }
    }

    move(time: number) {
        for (let i = 0; i < this.parisitePopulation; i++) {
            this.parisites[i].move(time);
        }
    }
}


