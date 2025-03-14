attribute vec2 coordinates;
attribute vec2 uvs;

uniform vec3 archor;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;

varying vec2 vTexCoords;

void main(void) {
    gl_Position = Pmatrix * Vmatrix* ( Mmatrix * vec4(archor, 1.0) + 
    vec4(coordinates.y, coordinates.x, 0.0, 0.0));    
    vTexCoords = uvs;
}