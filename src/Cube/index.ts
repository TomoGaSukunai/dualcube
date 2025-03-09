import CubeDefine from "./define";
import mat4 from "./math";




interface ColorMesh {
    coordinates: number[];
    indices: number[];
    colors: number[];
}

interface TexuredMesh {
    coordinates: number[];
    uvs: number[];
    indices: number[];
    textureIdx: number;
}

interface CubeBlock {
    innerFaces: ColorMesh;
    outerFaces: TexuredMesh[];
}

interface BufferedCubeBlock extends CubeBlock {
    colorProgramBuffers: {
        coordinatesBuffer: WebGLBuffer | null,
        colorsBuffer: WebGLBuffer | null,
        indicesBuffer: WebGLBuffer | null,
    };
    texProgramBuffers: {
        coordinatesBuffer: WebGLBuffer | null,
        indicesBuffer: WebGLBuffer | null,
        uvsBuffer: WebGLBuffer | null,
        textureIdx: number,
    }[];
    moveMatrix: mat4;
}



const background = [.8, .8, .8];
const zero = [0, 0, 0];
const cubeBlocks: CubeBlock[] = [];

const vec3Sum = (a: number[], b: number[]) => a.map((x, i) => x + b[i]);
for (const i in CubeDefine.BLOCKS) {

    const v0 = CubeDefine.BLOCKS[i]; // block farest point
    const f0 = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][0]];
    const f1 = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][1]];
    const f2 = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][2]];
    const f01 = vec3Sum(f0, f1);
    const f12 = vec3Sum(f1, f2);
    const f20 = vec3Sum(f2, f0);

    const innerVertices = [zero, f20, f0, f01, f1, f12, f2];
    const coordinates = innerVertices.flat();
    const colors = innerVertices.map(() => background).flat();
    const indices = CubeDefine.CONNER_INDICES.flat();
    const aCubeBlock: CubeBlock = {
        innerFaces: {
            coordinates,
            indices,
            colors,
        },
        outerFaces: [] as TexuredMesh[],
    };

    for (let j = 0; j < 3; j++) {
        const face = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][j]];
        const face_next = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][(j + 1) % 3]];
        const face_prev = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][(j + 2) % 3]];

        // rest 3 points of face
        const v1 = face_prev.map((v, i) => face[i] + v);
        const v2 = face;
        const v3 = face_next.map((v, i) => face[i] + v);

        const vertices = [v0, v1, v2, v3];
        const xyz = face.indexOf(face.reduce((a, b) => a + b, 0));// the index of non-zero in face

        const indices = CubeDefine.QUAD_INDICES.map(x => x); //copy            
        const uvs = vertices.map(x => x.slice(0, xyz).concat(x.slice(xyz + 1))).flat().map(x => (1 - x) / 2);

        const texFace: TexuredMesh = {
            coordinates: vertices.flat(),
            uvs,
            indices,
            textureIdx: CubeDefine.BLOCKS_FACES[i][j],
        };

        aCubeBlock.outerFaces.push(texFace);
    }

    cubeBlocks.push(aCubeBlock);
}




export { CubeDefine, mat4, cubeBlocks };
export type { CubeBlock, BufferedCubeBlock };