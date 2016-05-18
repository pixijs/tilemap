attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aAnim;
attribute float aTextureId;
attribute float aSize;

uniform mat3 projectionMatrix;
uniform vec2 samplerSize;
uniform vec2 animationFrame;
uniform float projectionScale;

varying vec2 vTextureCoord;
varying float vSize;
varying float vTextureId;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition + aSize * 0.5, 1.0)).xy, 0.0, 1.0);
   gl_PointSize = aSize * projectionScale;
   vTextureCoord = aTextureCoord + aAnim * animationFrame;
   vTextureId = aTextureId;
   vSize = aSize;
}
