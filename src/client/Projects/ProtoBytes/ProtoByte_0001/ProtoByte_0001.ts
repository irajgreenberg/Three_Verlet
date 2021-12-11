import { PRIORITY_HIGHEST } from "constants";
import { CatmullRomCurve3, DoubleSide, Mesh, MeshPhongMaterial, RepeatWrapping, ShaderMaterial, SkeletonHelper, SkinnedMesh, TextureLoader, Uniform, Vector3 } from "three";
import { FuncType } from "../../../PByte3/IJGUtils";
import { ProtoTubeBase } from "../../../PByte3/ProtoTubeBase";
import { ProtoTubeGeometry } from "../../../PByte3/ProtoTubeGeometry";

// knot help from http://paulbourke.net/geometry/knots/

export class ProtoByte_0001 extends ProtoTubeBase {

    skinMesh?: SkinnedMesh;
    skinMesh2?: SkinnedMesh;

    uniforms?: any;
    container: any;

    constructor(dim: Vector3 = new Vector3(.2, 1., .2)) {
        super(dim);
        this.create();
    }

    create() {
        let theta = 0;
        let phi = 0;
        let tubeSegs = 2000;
        let beta = 0;
        let betaAccum = Math.PI / (tubeSegs - 5);
        let radius = 1;

        let step = this.dim.y / tubeSegs;
        for (let i = 0; i < tubeSegs; i++) {
            // y-axis
            let x = Math.cos(phi) * Math.cos(theta) * this.dim.x;
            let y = Math.cos(phi) * Math.sin(theta) * this.dim.y * .3;
            let z = Math.sin(phi) * this.dim.z;

            // let x = Math.cos(phi) * Math.cos(theta) * radius * .1;
            // let y = Math.cos(phi) * Math.sin(theta) * radius * .1;
            // let z = Math.sin(phi) * radius * .1;

            this.pathVecs[i] = new Vector3(x, y, z);
            radius = .8 + 1.6 * Math.sin(6 * beta);
            theta = 2 * beta;
            phi = .6 * Math.PI * Math.sin(12 * beta);
            beta += betaAccum;
        }

        const path = new CatmullRomCurve3(this.pathVecs);


        const texture = new TextureLoader().load("textures/corrogated_metal2_color.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(20, 1);

        this.boneCount = 10;
        const spineGeom = new ProtoTubeGeometry(path, Math.floor(tubeSegs / 2), 6, false, { func: FuncType.SINUSOIDAL_INVERSE, min: 2, max: 10, periods: 25 }, this.boneCount);
        this.curveLenth = spineGeom.pathLen;
        this.curveLengths = spineGeom.pathSegmentLengths;

        const spineMat = new MeshPhongMaterial({ color: 0xCCBBFF, wireframe: false, side: DoubleSide, map: texture, transparent: true, opacity: .65, bumpMap: texture, bumpScale: 1, shininess: .8 });
        this.uniforms = {
            time: { value: 1.0 }
        };

        const shaderMat = new ShaderMaterial({

            uniforms: this.uniforms,
            vertexShader: this.vertexShader(),//vertexSource,//document.getElementById( 'vertShader' )!.textContent!,
            fragmentShader: this.fragmentShader(),//fragmentSource//document.getElementById( 'fragShader' )!.textContent!

        });


        this.boneCount = spineGeom.boneCount;
        this.curveLenth = spineGeom.pathLen;
        this.curveLengths = spineGeom.pathSegmentLengths


        //this.spineMesh = new Mesh(spineGeom, spineMat);
        this.spineMesh = new Mesh(spineGeom, spineMat);
        this.skinMesh = this.makeSkinned(this.spineMesh, this.boneCount, this.curveLenth);
        this.add(this.skinMesh);
        // this.add(this.spineMesh);

        // const skelHelper = new SkeletonHelper(this.skinMesh);
        // this.add(skelHelper);
    }

    move(time: number) {
        if (this.skinMesh) {
            this.skinMesh.skeleton.bones[2].rotation.y = Math.sin(-time * .2) * 15 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[8].rotation.y = Math.cos(time * 12) * 5 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[5].rotation.z = Math.sin(time * 3) * 1 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[6].rotation.x = Math.sin(time * 1) * 2 / this.skinMesh.skeleton.bones.length;
            this.skinMesh.skeleton.bones[9].rotation.y = Math.cos(time) * 12 / this.skinMesh.skeleton.bones.length;
        }
        this.uniforms['time'].value = performance.now() / 1000;
    }

    vertexShader() {
        return `
        varying vec2 vUv;
        void main()	{
            vUv = uv;
            gl_Position = vec4( position, 1.0 );
        }
        `;
    }

    fragmentShader() {
        return `
        varying vec2 vUv;
        uniform float time;
        void main()	{
            vec2 p = - 1.0 + 2.0 * vUv;
            float a = time * 40.0;
            float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;
            e = 400.0 * ( p.x * 0.5 + 0.5 );
            f = 400.0 * ( p.y * 0.5 + 0.5 );
            i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
            d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
            r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
            q = f / r;
            e = ( r * cos( q ) ) - a / 2.0;
            f = ( r * sin( q ) ) - a / 2.0;
            d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
            h = ( ( f + d ) + a / 2.0 ) * g;
            i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
            h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
            h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
            i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
            i = mod( i / 5.6, 256.0 ) / 64.0;
            if ( i < 0.0 ) i += 4.0;
            if ( i >= 2.0 ) i = 4.0 - i;
            d = r / 350.0;
            d += sin( d * d * 8.0 ) * 0.52;
            f = ( sin( a * g ) + 1.0 ) / 2.0;
            gl_FragColor = vec4( vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x + vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x ), 1.0 );
        }
        `;
    }
}




