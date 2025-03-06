
import { useEffect, useRef } from 'react'
import { mat4, CubeMesh } from './Cube'
import shaders from './shaders'
import senpaiURL from './assets/senpai.jpg'

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
}


let timestamp = Date.now()

let rY = 0.3;
let rX = 0.3;



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

function blockBufferInit(gl: WebGL2RenderingContext, block: any) {
    const moveMatrix = mat4.getEye();

    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(block.indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    const vertexBuffer2 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.verticesTex), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    const indexBuffer2 = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(block.indicesTex), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    const uvBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(block.uvs), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null)


    block.vertexBuffer = vertexBuffer
    block.indexBuffer = indexBuffer
    block.colorBuffer = colorBuffer
    block.vertexBuffer2 = vertexBuffer2
    block.indexBuffer2 = indexBuffer2
    block.uvBuffer = uvBuffer
    block.moveMatrix = moveMatrix
}


function textureInit(gl: WebGL2RenderingContext, texid: GLenum, img: HTMLImageElement) {
    function textInit() {
        const texture = gl.createTexture()
        gl.activeTexture(texid)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
        gl.generateMipmap(gl.TEXTURE_2D)
    }


    if (img.complete) {
        textInit()
    } else {
        img.onload = textInit
    }
}

function DualCubeCanvas(props: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const resizeCanvas = (canvas: HTMLCanvasElement) => {

        const { width, height } = canvas.getBoundingClientRect()
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
            World.projectMatrix = mat4.getPerspective(45, width / height, 0.1, 100)
            return true
        }
        return false;
    }

    const draw = (canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) => {
        resizeCanvas(canvas)

        const deltaTime = Date.now() - timestamp
        timestamp = Date.now()
        World.moveMatrix.rotateY(rY)
        World.moveMatrix.rotateX(rX)

        if (props.press) rY += 0.001 * deltaTime

        gl.viewport(0, 0, canvas.width, canvas.height)

        gl.enable(gl.DEPTH_TEST)
        gl?.clearColor(.2, .2, .2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);


        gl.useProgram(World.program.colorProgram)
        gl.uniformMatrix4fv(World.program.Pmatrix, false, World.projectMatrix)
        gl.uniformMatrix4fv(World.program.Vmatrix, false, World.viewMatrix)
        gl.uniformMatrix4fv(World.program.Mmatrix, false, World.moveMatrix)

        for (const idx in CubeMesh) {
            const block = CubeMesh[idx]
            if (block.moveMatrix) {
                gl.uniformMatrix4fv(World.program.Lmatrix, false, block.moveMatrix)
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, block.indexBuffer)

            gl.bindBuffer(gl.ARRAY_BUFFER, block.vertexBuffer)
            gl.vertexAttribPointer(World.program.coord, 3, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, block.colorBuffer)
            gl.vertexAttribPointer(World.program.color, 3, gl.FLOAT, false, 0, 0)
            gl.drawElements(gl.TRIANGLES, block.indices.length, gl.UNSIGNED_SHORT, 0)
        }

        gl.useProgram(World.program.texProgram)
        gl.uniformMatrix4fv(World.program.texPmatrix, false, World.projectMatrix)
        gl.uniformMatrix4fv(World.program.texVmatrix, false, World.viewMatrix)
        gl.uniformMatrix4fv(World.program.texMmatrix, false, World.moveMatrix)

        for (const idx in CubeMesh) {           
            const block = CubeMesh[idx]
            if (block.moveMatrix) {
                gl.uniformMatrix4fv(World.program.texLmatrix, false, block.moveMatrix) 
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, block.indexBuffer2)

            gl.bindBuffer(gl.ARRAY_BUFFER, block.vertexBuffer2)
            gl.vertexAttribPointer(World.program.texCoord, 3, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, block.uvBuffer)
            gl.vertexAttribPointer(World.program.texUvs, 2, gl.FLOAT, false, 0, 0)
            gl.uniform1i(World.program.texSampler, 0)
            gl.drawElements(gl.TRIANGLES, block.indicesTex.length, gl.UNSIGNED_SHORT, 0)
        }



        World.moveMatrix = mat4.getEye()
    }




    useEffect(() => {
        const canvas = canvasRef.current
        const gl = canvas?.getContext('webgl2')
        if (!gl || !canvas) {
            throw new Error('Failed to get WebGL2 context')
        }

        for (const block of CubeMesh) {
            blockBufferInit(gl, block)
        }

        const colorProgram = shaderProgramInit(gl, shaders.colorVert, shaders.colorFrag)
        const coord = gl.getAttribLocation(colorProgram, 'coordinates')
        gl.enableVertexAttribArray(coord)
        const color = gl.getAttribLocation(colorProgram, 'color')
        gl.enableVertexAttribArray(color)
        const Pmatrix = gl.getUniformLocation(colorProgram, 'Pmatrix')
        const Vmatrix = gl.getUniformLocation(colorProgram, 'Vmatrix')
        const Mmatrix = gl.getUniformLocation(colorProgram, 'Mmatrix')
        const Lmatrix = gl.getUniformLocation(colorProgram, 'Lmatrix')



        const texProgram = shaderProgramInit(gl, shaders.texVert, shaders.texFrag)
        const texCoord = gl.getAttribLocation(texProgram, 'coordinates')
        gl.enableVertexAttribArray(texCoord)
        const texUvs = gl.getAttribLocation(texProgram, 'uvs')
        gl.enableVertexAttribArray(texUvs)
        const texPmatrix = gl.getUniformLocation(texProgram, 'Pmatrix')
        const texVmatrix = gl.getUniformLocation(texProgram, 'Vmatrix')
        const texMmatrix = gl.getUniformLocation(texProgram, 'Mmatrix')
        const texLmatrix = gl.getUniformLocation(texProgram, 'Lmatrix')
        const texSampler = gl.getUniformLocation(texProgram, 'uSampler')

        World.program = {
            colorProgram,
            texProgram,
            coord,
            color,
            Pmatrix,
            Vmatrix,
            Mmatrix,
            Lmatrix,
            texCoord,
            texUvs,
            texPmatrix,
            texVmatrix,
            texMmatrix,
            texLmatrix,
            texSampler

        }

        const senpaiIamge = document.createElement('img')
        senpaiIamge.src = senpaiURL

        textureInit(gl, gl.TEXTURE0, senpaiIamge)

        let frameCount = 0;
        let animationFrameId: number;
        const render = () => {
            frameCount++;
            draw(canvas, gl)
            animationFrameId = requestAnimationFrame(render)

        }
        render()

        return () => {
            cancelAnimationFrame(animationFrameId)
        }

    }, [draw])

    return <canvas ref={canvasRef} />

}

export default DualCubeCanvas
