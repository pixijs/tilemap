attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aFrame;
attribute vec2 aAnim;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform vec2 animationFrame;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vFrame;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vec2 anim = aAnim * animationFrame;
   vTextureCoord = aTextureCoord + anim;
   vFrame = aFrame + vec4(anim, anim);
   vTextureId = aTextureId;
}
