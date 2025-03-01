
import { PropsWithChildren, useEffect, useRef } from 'react'

function DualCubeCanvas(props: PropsWithChildren) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const resizeCanvas = (canvas: HTMLCanvasElement) => {

        const { width, height } = canvas.getBoundingClientRect()
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
            return true
        }
        return false;
    }
    const draw = (canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) => {
        resizeCanvas(canvas)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl?.clearColor(0, 1, 1, 1);
    }
    useEffect(() => {
        const canvas = canvasRef.current
        const gl = canvas?.getContext('webgl2')
        if (!gl || !canvas) {
            return
        }

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

    return <canvas ref={canvasRef} {...props} />

}

export default DualCubeCanvas
