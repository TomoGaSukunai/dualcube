class mat4 extends Float32Array {
    constructor(data: number[]) {
        super(16)
        this.set(data)
    }
    static getEye() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    }

    static getPerspective(fov: number, aspect: number, near: number, far: number) {
        const angle = fov * Math.PI / 180
        return [
            0.5 / angle, 0, 0, 0,
            0, 0.5 * aspect / angle, 0, 0,
            0, 0, (far + near) / (near - far), -1,
            0, 0, (2 * far * near) / (near - far), 0,
        ]
    }

    
    rotateX(angle: number) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const mv1 = this[1]        
        const mv5 = this[5]
        const mv9 = this[9]
        this[1] = c * mv1 - s * this[2]
        this[5] = c * mv5 - s * this[6]
        this[9] = c * mv9 - s * this[10]
        this[2] = s * mv1 + c * this[2]
        this[6] = s * mv5 + c * this[6]
        this[10] = s * mv9 + c * this[10]
        return this
    }
}