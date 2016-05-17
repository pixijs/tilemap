precision lowp float;
attribute vec4 aVertexPosition;
attribute vec2 aAnim;

uniform mat3 projectionMatrix;
uniform vec2 samplerSize;
uniform vec2 animationFrame;

varying vec2 vTextureCoord;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy, 1.0)).xy, 0.0, 1.0);
   vTextureCoord = (aVertexPosition.zw + aAnim * animationFrame ) * samplerSize;
}
