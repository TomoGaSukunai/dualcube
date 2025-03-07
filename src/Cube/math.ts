class mat4 extends Float32Array {
    constructor(data: number[]) {
        super(16);
        this.set(data);
    }
    static getEye() {
        return new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }

    static getPerspective(fov: number, aspect: number, near: number, far: number) {
        const angle = fov * Math.PI / 180;
        return new mat4([
            0.5 / angle, 0, 0, 0,
            0, 0.5 * aspect / angle, 0, 0,
            0, 0, (far + near) / (near - far), -1,
            0, 0, (2 * far * near) / (near - far), 0,
        ]);
    }


    rotateX(angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv1 = this[1];
        const mv5 = this[5];
        const mv9 = this[9];
        this[1] = c * mv1 - s * this[2];
        this[5] = c * mv5 - s * this[6];
        this[9] = c * mv9 - s * this[10];
        this[2] = s * mv1 + c * this[2];
        this[6] = s * mv5 + c * this[6];
        this[10] = s * mv9 + c * this[10];
        return this;
    }
    rotateY(angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv2 = this[2];
        const mv6 = this[6];
        const mv10 = this[10];
        this[2] = c * mv2 - s * this[0];
        this[6] = c * mv6 - s * this[4];
        this[10] = c * mv10 - s * this[8];
        this[0] = c * this[0] + s * mv2;
        this[4] = c * this[4] + s * mv6;
        this[8] = c * this[8] + s * mv10;
        return this;
    }

    rotateZ(angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv0 = this[0];
        const mv4 = this[4];
        const mv8 = this[8];
        this[0] = c * mv0 - s * this[1];
        this[4] = c * mv4 - s * this[5];
        this[8] = c * mv8 - s * this[9];
        this[1] = c * this[1] + s * mv0;
        this[5] = c * this[5] + s * mv4;
        this[9] = c * this[9] + s * mv8;
        return this;
    }

    translate(x: number, y: number, z: number) {
        this[12] += x;
        this[13] += y;
        this[14] += z;
        return this;

    }
}

export default mat4;