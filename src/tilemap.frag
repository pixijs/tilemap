#version 100
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vTextureCoord;
varying vec4 vFrame;
varying float vTextureId;
varying float vAlpha;
uniform vec4 shadowColor;
uniform sampler2D uSamplers[%count%];
uniform vec2 uSamplerSize[%count%];

void main(void)
{
   vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);
   float textureId = floor(vTextureId + 0.5);

   vec4 color;
   %forloop%
   gl_FragColor = color * vAlpha;
}
