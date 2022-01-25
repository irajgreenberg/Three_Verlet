// ToneExperiment
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

import { Group, Vector3 } from "three";
import { FuncType } from "../../../PByte3/IJGUtils";
import * as Tone from 'tone'

export class ToneExperiment extends Group {

    constructor() {
        super();
        this.create();
    }

    create() {

        //create a synth and connect it to the main output (your speakers)
        const synth = new Tone.Synth().toDestination();

        //play a middle 'C' for the duration of an 8th note
        synth.triggerAttackRelease("C4", "8n");
    }

    move(time: number) {
    }

}


