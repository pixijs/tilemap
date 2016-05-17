attribute vec4 aVertexPosition;
attribute vec3 aSize;

uniform mat3 projectionMatrix;
uniform vec2 samplerSize;
uniform vec2 animationFrame;
uniform float projectionScale;

varying vec2 vTextureCoord;
varying float vSize;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy + aSize.x * 0.5, 1.0)).xy, 0.0, 1.0);
   gl_PointSize = aSize.x * projectionScale;
   vTextureCoord = (aVertexPosition.zw + aSize.yz * animationFrame ) * samplerSize;
   vSize = aSize.x;
}
