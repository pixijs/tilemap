import { Buffer, BufferUsage, Geometry, Shader, GlProgram, GpuProgram, Matrix } from 'pixi.js';
import * as shaderGenerator from './shader_generator';

const gl_tilemap_vertex = `#version 100
precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aFrame;
attribute vec2 aAnim;
attribute float aAnimDivisor;
attribute float aTextureId;
attribute float aAlpha;

uniform mat3 projTransMatrix;
uniform vec2 animationFrame;

varying vec2 vTextureCoord;
varying float vTextureId;
varying vec4 vFrame;
varying float vAlpha;

void main(void)
{
  gl_Position = vec4((projTransMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  vec2 animCount = floor((aAnim + 0.5) / 2048.0);
  vec2 animFrameOffset = aAnim - animCount * 2048.0;
  vec2 currentFrame = floor(animationFrame / aAnimDivisor);
  vec2 loop_num = floor((currentFrame + 0.5) / animCount);
  vec2 animOffset = animFrameOffset * floor(currentFrame - loop_num * animCount);

  vTextureCoord = aTextureCoord + animOffset;
  vFrame = aFrame + vec4(animOffset, animOffset);
  vTextureId = aTextureId;
  vAlpha = aAlpha;
}
`;

const gl_tilemap_fragment = `#version 100
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vTextureCoord;
varying vec4 vFrame;
varying float vTextureId;
varying float vAlpha;

//include_textures

void main(void)
{
  float textureId = floor(vTextureId + 0.5);
  vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);
  vec4 color = sampleMultiTexture(textureId, textureCoord * u_texture_size[textureId].zw);
  gl_FragColor = color * vAlpha;
}
`;

const gpu_tilemap_vertex = `
struct GlobalUniforms {
  uProjectionMatrix:mat3x3<f32>,
  uWorldTransformMatrix:mat3x3<f32>,
  uWorldColorAlpha: vec4<f32>,
  uResolution: vec2<f32>,
}

struct TilemapUniforms {
  uProjTrans:mat3x3<f32>,
  animationFrame:vec2<f32>
}

@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
@group(2) @binding(0) var tilemap: TilemapUniforms;

struct VSOutput {
  @builtin(position) vPosition: vec4<f32>,
  @location(0) @interpolate(flat) vTextureId : u32,
  @location(1) vec2 vTextureCoord : vec2<f32>,
  @location(2) @interpolate(flat) vec4 vFrame : vec4<f32>,
  @location(3) float vAlpha : f32
};

@vertex
fn main(
   @location(0) aVertexPosition: vec2<f32>,
   @location(1) aTextureCoord: vec2<f32>,
   @location(2) aFrame: vec4<u32>,
   @location(3) aAnim: vec2<f32>,
   @location(4) aAnimDivisor: f32,
   @location(5) aTextureId: u32,
   @location(6) aAlpha: f32,
 ) -> VSOutput {

  var vPosition = vec4((tilemap.uProjTrans * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  var animCount = floor((aAnim + 0.5) / 2048.0);
  var animFrameOffset = aAnim - animCount * 2048.0;
  var currentFrame = floor(animationFrame / aAnimDivisor);
  var loop_num = floor((currentFrame + 0.5) / animCount);
  var animOffset = animFrameOffset * floor(currentFrame - loop_num * animCount);
  var vTextureCoord = aTextureCoord + animOffset;
  var vFrame = aFrame + vec4(animOffset, animOffset);

  return VSOutput(vPosition, aTextureId, vTextureCoord, vFrame, aAlpha);
};
`;

const gpu_tilemap_fragment = `
//include_textures

@fragment
fn main(
  @location(0) @interpolate(flat) vTextureId : u32,
  @location(1) vec2 vTextureCoord : vec2<f32>,
  @location(2) @interpolate(flat) vec4 vFrame : vec4<f32>,
  @location(3) float vAlpha : f32,
  ) -> @location(0) vec4<f32> {
  var textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);
  var uv = textureCoord * u_texture_size[textureId].zw;
  var dx = dpdx(uv);
  var dy = dpdy(uv);
  var color = sampleMultiTexture(vTextureId, uv, dx, dy);
  return color * vAlpha;
};
`;

// For some reason, ESLint goes mad with indentation in this file ^&^
/* eslint-disable no-mixed-spaces-and-tabs, indent */

export class TilemapShader extends Shader
{
    maxTextures = 0;

    constructor(maxTextures: number)
    {
        const glProgram = GlProgram.from({
            vertex: gl_tilemap_vertex,
            fragment: gl_tilemap_fragment
        });

        const gpuProgram = GpuProgram.from({
            vertex: { source: gpu_tilemap_vertex },
            fragment: { source: gpu_tilemap_fragment },
        });

	    super({ glProgram, gpuProgram });

	    this.maxTextures = maxTextures;
	    shaderGenerator.fillSamplers(this, this.maxTextures);
    }
}

export class TilemapGeometry extends Geometry
{
    static vertSize = 13;
    static vertPerQuad = 4;
    static stride = this.vertSize * 4;
    lastTimeAccess = 0;

    vertSize = TilemapGeometry.vertSize;
    vertPerQuad = TilemapGeometry.vertPerQuad;
    stride = TilemapGeometry.stride;

    constructor(indexBuffer: Buffer)
    {
        const buf = new Buffer({
            data: new Float32Array(2),
            label: 'tilemap-buffer',
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
            shrinkToFit: false,
        });

        const stride = TilemapGeometry.stride;

	    super({
            indexBuffer,
            attributes: {
                aVertexPosition: {
                    buffer: buf,
                    format: 'float32x2',
                    stride,
                    offset: 0,
                    location: 0,
                },
                aTextureCoord: {
                    buffer: buf,
                    format: 'float32x2',
                    stride,
                    offset: 2 * 4,
                    location: 1,
                },
                aFrame: {
                    buffer: buf,
                    format: 'float32x4',
                    stride,
                    offset: 4 * 4,
                    location: 2,
                },
                aAnim: {
                    buffer: buf,
                    format: 'float32x2',
                    stride,
                    offset: 8 * 4,
                    location: 3,
                },
                aTextureId: {
                    buffer: buf,
                    format: 'float32',
                    stride,
                    offset: 10 * 4,
                    location: 4
                },
                aAnimDivisor: {
                    buffer: buf,
                    format: 'float32',
                    stride,
                    offset: 11 * 4,
                    location: 5
                },
                aAlpha: {
                    buffer: buf,
                    format: 'float32',
                    stride,
                    offset: 12 * 4,
                    location: 6
                }
            },
        });

        this.buf = buf;
    }

    buf: Buffer;
}
