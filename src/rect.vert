attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aAnim;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform vec2 animationFrame;

varying vec2 vTextureCoord;
varying float vTextureId;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vTextureCoord = aTextureCoord + aAnim * animationFrame;
   vTextureId = aTextureId;
}
