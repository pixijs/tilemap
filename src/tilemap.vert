attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aFrame;
attribute vec2 aAnim;
attribute float aTextureId;

uniform mat3 projTransMatrix;
uniform vec2 animationFrame;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vFrame;

void main(void)
{
   gl_Position = vec4((projTransMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vec2 animCount = floor((aAnim + 0.5) / 2048.0);
   vec2 animFrameOffset = aAnim - animCount * 2048.0;
   vec2 animOffset = animFrameOffset * floor(mod(animationFrame + 0.5, animCount));

   vTextureCoord = aTextureCoord + animOffset;
   vFrame = aFrame + vec4(animOffset, animOffset);
   vTextureId = aTextureId;
}