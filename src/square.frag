varying vec2 vTextureCoord;
varying float vSize;
varying float vTextureId;

uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];
uniform vec2 pointScale;

void main(void){
   float margin = 1.0/vSize;
   vec2 clamped = vec2(clamp(gl_PointCoord.x, margin, 1.0 - margin), clamp(gl_PointCoord.y, margin, 1.0 - margin));
   vec2 textureCoord = ((clamped-0.5) * pointScale + 0.5) * vSize + vTextureCoord;
   float textureId = vTextureId;
   vec4 color;
   %forloop%
   gl_FragColor = color;
}
