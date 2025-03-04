attribute vec3 coordinates;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
uniform mat4 Lmatrix;
attribute vec2 uvs;
varying vec2 vTextureCoord;

void main(void){
    gl_Position = Pmatrix*Vmatrix*Mmatrix*Lmatrix*vec4(coordinates, 1.0);
    vTextureCoord = uvs;
}