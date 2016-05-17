varying vec2 vTextureCoord;
varying float vSize;
uniform vec2 samplerSize;

uniform sampler2D uSampler;
uniform vec2 pointScale;

void main(void){
   float margin = 0.5/vSize;
   vec2 clamped = vec2(clamp(gl_PointCoord.x, margin, 1.0 - margin), clamp(gl_PointCoord.y, margin, 1.0 - margin));
   gl_FragColor = texture2D(uSampler, ((clamped-0.5) * pointScale + 0.5) * vSize * samplerSize + vTextureCoord);
}
