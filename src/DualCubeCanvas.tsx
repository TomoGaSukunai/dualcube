
import { useEffect, useRef, useState } from 'react';
import { mat4, CubeMesh, bufferdMesh, CubeDefine } from './Cube';
import shaders from './shaders';
import senpaiURL from './assets/senpai.jpg';

interface glProgram {
    color: number
    coord: number
    Lmatrix: WebGLUniformLocation | null
    Mmatrix: WebGLUniformLocation | null
    Vmatrix: WebGLUniformLocation | null
    Pmatrix: WebGLUniformLocation | null
    colorProgram: WebGLProgram | null,
    texProgram: WebGLProgram | null,
    texCoord: number
    texUvs: number
    texPmatrix: WebGLUniformLocation | null
    texVmatrix: WebGLUniformLocation | null
    texMmatrix: WebGLUniformLocation | null
    texLmatrix: WebGLUniformLocation | null
    texSampler: WebGLUniformLocation | null
}


const World = {
    projectMatrix: mat4.getPerspective(45, 1, 0.1, 100),
    viewMatrix: mat4.getEye().translate(0, 0, -5),
    moveMatrix: mat4.getEye(),
    program: {} as glProgram,
};


let timestamp = Date.now();


function shaderProgramInit(gl: WebGL2RenderingContext, vertSource: string, fragSource: string) {

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertShader) {
        throw new Error('Failed to create vertex shader');
    }

    gl.shaderSource(vertShader, vertSource);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragShader) {
        throw new Error('Failed to create fragment shader');
    }

    gl.shaderSource(fragShader, fragSource);
    gl.compileShader(fragShader);

    const program = gl.createProgram();

    if (!program) {
        throw new Error('Failed to create program');
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
}

function blockBufferInit(gl: WebGL2RenderingContext, block: bufferdMesh) {
    const moveMatrix = mat4.getEye();

    const colorVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.colorVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, colorIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(block.colorIndices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const texVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.texVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const texIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, texIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(block.texIndices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    const texUvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texUvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.texUvs), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    block.colorVertexBuffer = colorVertexBuffer;
    block.colorIndexBuffer = colorIndexBuffer;
    block.colorsBuffer = colorsBuffer;
    block.texVertexBuffer = texVertexBuffer;
    block.texIndexBuffer = texIndexBuffer;
    block.texUvBuffer = texUvBuffer;
    block.moveMatrix = moveMatrix;
}

function textureInit(gl: WebGL2RenderingContext, texid: GLenum, img: HTMLImageElement) {
    function textInit() {
        const texture = gl.createTexture();
        gl.activeTexture(texid);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    }


    if (img.complete) {
        textInit();
    } else {
        img.onload = textInit;
    }
}

const resizeCanvas = (canvas: HTMLCanvasElement) => {

    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        World.projectMatrix = mat4.getPerspective(45, width / height, 0.1, 100);
        return true;
    }
    return false;
};

const Blocks = CubeMesh.map(x => x);
function DualCubeCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    //status
    const [status, setStatus] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0]);



    // test canvasRef change

    const refChange = useRef(0);
    const refCur = useRef(canvasRef.current);
    useEffect(() => {
        if (refCur.current !== canvasRef.current) {
            refCur.current = canvasRef.current;

            refChange.current++;
            console.log(refChange.current);
        }
    }, [canvasRef]);



    
    const dR = useRef(0);
    const rX = useRef(0.3);
    const rY = useRef(0);
    const rotating_axis = useRef(-1);
    const rotating_reverse = useRef(true);
    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas?.getContext('webgl2');

        if (!gl || !canvas) {
            throw new Error('Failed to get WebGL2 context');
        }

        for (const block of Blocks) {
            blockBufferInit(gl, block);
        }

        const colorProgram = shaderProgramInit(gl, shaders.colorVert, shaders.colorFrag);
        const coord = gl.getAttribLocation(colorProgram, 'coordinates');
        gl.enableVertexAttribArray(coord);
        const color = gl.getAttribLocation(colorProgram, 'color');
        gl.enableVertexAttribArray(color);
        const Pmatrix = gl.getUniformLocation(colorProgram, 'Pmatrix');
        const Vmatrix = gl.getUniformLocation(colorProgram, 'Vmatrix');
        const Mmatrix = gl.getUniformLocation(colorProgram, 'Mmatrix');
        const Lmatrix = gl.getUniformLocation(colorProgram, 'Lmatrix');



        const texProgram = shaderProgramInit(gl, shaders.texVert, shaders.texFrag);
        const texCoord = gl.getAttribLocation(texProgram, 'coordinates');
        gl.enableVertexAttribArray(texCoord);
        const texUvs = gl.getAttribLocation(texProgram, 'uvs');
        gl.enableVertexAttribArray(texUvs);
        const texPmatrix = gl.getUniformLocation(texProgram, 'Pmatrix');
        const texVmatrix = gl.getUniformLocation(texProgram, 'Vmatrix');
        const texMmatrix = gl.getUniformLocation(texProgram, 'Mmatrix');
        const texLmatrix = gl.getUniformLocation(texProgram, 'Lmatrix');
        const texSampler = gl.getUniformLocation(texProgram, 'uSampler');

        World.program = {

            color,
            coord,
            Lmatrix,
            Mmatrix,
            Vmatrix,
            Pmatrix,
            colorProgram,
            texProgram,
            texCoord,
            texUvs,
            texPmatrix,
            texVmatrix,
            texMmatrix,
            texLmatrix,
            texSampler,
        };

        const senpaiIamge = document.createElement('img');
        senpaiIamge.src = senpaiURL;

        textureInit(gl, gl.TEXTURE0, senpaiIamge);


        if (!gl) return;

        // let frameCount = 0;
        let animationFrameId: number;

        const render = () => {
            // frameCount++;
            // if (frameCount % 100 == 0) {
            //     console.log(frameCount);
            // }
            resizeCanvas(canvasRef.current!);

            const deltaTime = Date.now() - timestamp;
            timestamp = Date.now();
            World.moveMatrix.rotateY(rY.current);
            World.moveMatrix.rotateX(rX.current);

            rY.current += 0.001 * deltaTime;


            if (rotating_axis.current != -1) {
                const ddR = Math.min(dR.current + 0.01 * deltaTime, Math.PI / 2);
                const rev = rotating_reverse.current ? -1 : 1;
                const deg = rev * (ddR - dR.current);

                for (const maplet of CubeDefine.MAPPING[rotating_axis.current]) {
                    const src = rotating_reverse.current ? maplet[0] : maplet[1];
                    const Block = Blocks[src];

                    Block.moveMatrix?.rotateX(CubeDefine.FACES[rotating_axis.current][0] * deg);
                    Block.moveMatrix?.rotateY(CubeDefine.FACES[rotating_axis.current][1] * deg);
                    Block.moveMatrix?.rotateZ(CubeDefine.FACES[rotating_axis.current][2] * deg);
                }

                dR.current = ddR;
                if (dR.current == Math.PI / 2) {
                    const cubeRef = Blocks.map(x => x);
                    for (const maplet of CubeDefine.MAPPING[rotating_axis.current]) {
                        const src = rotating_reverse.current ? maplet[0] : maplet[1];
                        const dst = rotating_reverse.current ? maplet[1] : maplet[0];
                        Blocks[dst] = cubeRef[src];
                    }
                    // console.log(Blocks.map(blk => blk.idx));
                    // for (const idx in Blocks) {
                    //     const block = Blocks[idx];
                    //     const dx = block.vertices[0] - CubeDefine.BLOCKS[idx][0];
                    //     const dy = block.vertices[1] - CubeDefine.BLOCKS[idx][1];
                    //     const dz = block.vertices[2] - CubeDefine.BLOCKS[idx][2];
                    //     console.log(idx, dx, dy, dz);

                    // }
                    dR.current = 0;
                    rotating_axis.current = -1;

                }
            }

            gl.viewport(0, 0, canvasRef.current!.width, canvasRef.current!.height);

            gl.enable(gl.DEPTH_TEST);
            gl?.clearColor(.2, .2, .2, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);



            //draw color part
            gl.useProgram(World.program.colorProgram);
            gl.uniformMatrix4fv(World.program.Pmatrix, false, World.projectMatrix);
            gl.uniformMatrix4fv(World.program.Vmatrix, false, World.viewMatrix);
            gl.uniformMatrix4fv(World.program.Mmatrix, false, World.moveMatrix);

            for (const idx in Blocks) {
                const block = Blocks[idx];
                if (block.moveMatrix) {
                    gl.uniformMatrix4fv(World.program.Lmatrix, false, block.moveMatrix);
                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, block.colorIndexBuffer);

                gl.bindBuffer(gl.ARRAY_BUFFER, block.colorVertexBuffer);
                gl.vertexAttribPointer(World.program.coord, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, block.colorsBuffer);
                gl.vertexAttribPointer(World.program.color, 3, gl.FLOAT, false, 0, 0);
                gl.drawElements(gl.TRIANGLES, block.colorIndices.length, gl.UNSIGNED_SHORT, 0);
            }

            //draw texture part
            gl.useProgram(World.program.texProgram);
            gl.uniformMatrix4fv(World.program.texPmatrix, false, World.projectMatrix);
            gl.uniformMatrix4fv(World.program.texVmatrix, false, World.viewMatrix);
            gl.uniformMatrix4fv(World.program.texMmatrix, false, World.moveMatrix);
            gl.activeTexture(gl.TEXTURE0);
            for (const idx in Blocks) {
                const block = Blocks[idx];
                if (block.moveMatrix) {
                    gl.uniformMatrix4fv(World.program.texLmatrix, false, block.moveMatrix);
                }
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, block.texIndexBuffer);

                gl.bindBuffer(gl.ARRAY_BUFFER, block.texVertexBuffer);
                gl.vertexAttribPointer(World.program.texCoord, 3, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, block.texUvBuffer);
                gl.vertexAttribPointer(World.program.texUvs, 2, gl.FLOAT, false, 0, 0);
                gl.uniform1i(World.program.texSampler, 0);
                gl.drawElements(gl.TRIANGLES, block.texIndices.length, gl.UNSIGNED_SHORT, 0);
            }



            World.moveMatrix = mat4.getEye();

            animationFrameId = requestAnimationFrame(render);

        };
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };

    }, []);

    const handleRotate = (way: number, b: boolean) => {
        if (rotating_axis.current != -1) return;
        rotating_axis.current = way;
        rotating_reverse.current = b;
        const next_status = status.map(x => x);
        for (const maplet of CubeDefine.MAPPING[way]) {
            const src = b ? maplet[0] : maplet[1];
            const dst = b ? maplet[1] : maplet[0];
            const inc = b ? maplet[2] : (3 - maplet[2]) % 3;
            next_status[dst] = status[src];
            next_status[dst + 8] = (status[src + 8] + inc) % 3;
        }
        console.log(next_status);
        setStatus(next_status);
    };

    return <>
        <canvas ref={canvasRef} />
        <button onClick={() => handleRotate(0, true)}>0</button>
        <button onClick={() => handleRotate(1, true)}>1</button>
        <button onClick={() => handleRotate(2, true)}>2</button>
        <button onClick={() => handleRotate(3, true)}>3</button>
        <button onClick={() => handleRotate(4, true)}>4</button>
        <button onClick={() => handleRotate(5, true)}>5</button>
        <button onClick={() => handleRotate(0, false)}>0</button>
        <button onClick={() => handleRotate(1, false)}>1</button>
        <button onClick={() => handleRotate(2, false)}>2</button>
        <button onClick={() => handleRotate(3, false)}>3</button>
        <button onClick={() => handleRotate(4, false)}>4</button>
        <button onClick={() => handleRotate(5, false)}>5</button>
    </>;

}

export default DualCubeCanvas;
