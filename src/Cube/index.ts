import CubeDefine from "./define";
import mat4 from "./math";

interface Mesh {
    colorVertices: number[];
    colorIndices: number[];
    colors: number[];
    texVertices: number[];
    texUvs: number[];
    texIndices: number[];
    idx: number;
}

interface bufferdMesh extends Mesh {
    colorVertexBuffer: WebGLBuffer | null,
    colorIndexBuffer: WebGLBuffer | null,
    colorsBuffer: WebGLBuffer | null,
    texVertexBuffer: WebGLBuffer | null,
    texIndexBuffer: WebGLBuffer | null,
    texUvBuffer: WebGLBuffer | null,
    moveMatrix: mat4 | null,
}

const background = [.8, .8, .8];


const CubeMesh: bufferdMesh[] = [];
const zero = [0, 0, 0];
const faceTex = [false, false, false, false, false, true];
const outRate = 0.02;
for (const i in CubeDefine.BLOCKS) {

    const vertices = [];
    const indices = [];
    const colors = [];



    const verticesTex = [];
    const uvs = [];
    const indicesTex = [];


    let indexOffset = 0;
    let indexTexOffset = 0;
    const v0 = CubeDefine.BLOCKS[i]; // block farest point

    //3 outer faces 
    for (let j = 0; j < 3; j++) {
        const face = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][j]];
        const face_next = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][(j + 1) % 3]];
        const face_prev = CubeDefine.FACES[CubeDefine.BLOCKS_FACES[i][(j + 2) % 3]];

        // rest 3 points of face
        const v1 = face_prev.map((v, i) => face[i] + v);
        const v2 = face;
        const v3 = face_next.map((v, i) => face[i] + v);

        vertices.push(v0, v1, v2, v3);

        // TODO divide pieces by texture(face)
        if (faceTex[CubeDefine.BLOCKS_FACES[i][j]]) {

            const xyz = face.indexOf(face.reduce((a, b) => a + b, 0));// the index of non-zero in face

            indicesTex.push(...CubeDefine.QUAD_INDICES.map(idx => idx + indexTexOffset));
            verticesTex.push(v0, v1, v2, v3);
            uvs.push(...(verticesTex.slice(-4).map(x => x.slice(0, xyz).concat(x.slice(xyz + 1)))));
            indexTexOffset += 4;
        } else {
            indices.push(...CubeDefine.QUAD_INDICES.map(idx => idx + indexOffset));
        }

        indexOffset += 4;
        const color = CubeDefine.FACES_COLORS[CubeDefine.BLOCKS_FACES[i][j]];
        colors.push(...[color, color, color, color]);
    }

    // inner faces
    indices.push(...CubeDefine.CONNER_INDICES.map(idx => idx + indexOffset));
    vertices.push(zero);
    for (let j = 0; j < 3; j++) {
        vertices.push(vertices[4 * j + 1]);
        vertices.push(vertices[4 * j + 2]);
    }
    indexOffset += 3;

    colors.push(...[background, background, background, background, background, background, background]);
    vertices.forEach((p, j) => vertices[j] = p.map((k, l) => k + v0[l] * outRate));
    verticesTex.forEach((p, j) => verticesTex[j] = p.map((k, l) => k + v0[l] * outRate));

    const block: bufferdMesh = {
        idx: parseInt(i),
        colorVertices: vertices.flat(),
        colorIndices: indices,
        colors: colors.flat(),
        texVertices: verticesTex.flat(),
        texUvs: uvs.flat().map(x => (1 - x) / 2),
        texIndices: indicesTex,
        colorVertexBuffer: null,
        colorIndexBuffer: null,
        colorsBuffer: null,
        texVertexBuffer: null,
        texIndexBuffer: null,
        texUvBuffer: null,
        moveMatrix: null
    };

    CubeMesh.push(block);
}




export { CubeDefine, mat4, CubeMesh };
export type { Mesh, bufferdMesh };