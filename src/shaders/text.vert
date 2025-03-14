attribute vec3 coordinates;
attribute vec2 uvs;

uniform mat4 Pmatrix;
uniform mat4 Vmatrix;

varying vec2 vTexCoords;

void main(void) {
    vTexCoords = uvs;
    gl_Position = Pmatrix * Vmatrix * vec4(coordinates, 1.0);
}