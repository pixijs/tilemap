varying vec2 vTextureCoord;
varying float vTextureId;
uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];

void main(void){
   vec2 textureCoord = vTextureCoord;
   vec4 color;
   %forloop%
   gl_FragColor = color;
}
