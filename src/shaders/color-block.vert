attribute vec3 coordinates;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
uniform mat4 Lmatrix;
attribute vec3 color;
varying vec3 vColor;
void main(void){
    gl_Position = Pmatrix*Vmatrix*Mmatrix*Lmatrix*vec4(coordinates, 1.0);
    gl_PointSize = 10.0;
    vColor = color;
}