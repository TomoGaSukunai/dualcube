precision mediump float;
varying vec3 vColor;
void main(void) {
    gl_FragColor = vec4(vColor,1.0);
    //vec4(0.1, 0.0, 0.0, 0.1);
}