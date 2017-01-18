varying vec2 vTextureCoord;
varying float vSize;
varying float vTextureId;

uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];
uniform vec2 pointScale;

void main(void){
   float margin = 0.5 / vSize;
   vec2 pointCoord = (gl_PointCoord - 0.5) * pointScale + 0.5;
   vec2 clamped = vec2(clamp(pointCoord.x, margin, 1.0 - margin), clamp(pointCoord.y, margin, 1.0 - margin));
   vec2 textureCoord = pointCoord * vSize + vTextureCoord;
   float textureId = floor(vTextureId + 0.5);
   vec4 color;
   %forloop%
   gl_FragColor = color;
}
