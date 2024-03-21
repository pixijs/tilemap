import type { TilemapShader } from './TilemapShader';

export function fillSamplers(uniforms: any, maxTextures: number): void
{
    const sampleValues: Array<number> = [];

    for (let i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }

    uniforms.uSamplers = sampleValues;

    const samplerSize: Array<number> = [];

    for (let i = 0; i < maxTextures; i++)
    {
        // These are overwritten by TileRenderer when textures actually bound.
        samplerSize.push(2048);
        samplerSize.push(2048);
        samplerSize.push(1.0 / 2048);
        samplerSize.push(1.0 / 2048);
    }

    uniforms.uSamplerSize = samplerSize;
}

export function generate_gl_textures(max_textures: number): string
{
    const src: string[] = [];

    src.push(`uniform vec4 u_texture_size[${max_textures}];`);
    src.push(`uniform sampler2D u_textures[${max_textures}];`);
    src.push(`uniform vec4 u_default_color;`);

    src.push('vec4 sampleMultiTexture(float texture_id, vec2 uv) {');
    src.push(`if(texture_id < -0.5) return u_default_color;`);
    for (let i = 0; i < max_textures; i++)
    {
        src.push(`if(texture_id < ${i}.5) return texture2D(u_textures[${i}], uv);`);
    }
    src.push('}');

    return src.join('\n');
}

export function generate_gpu_textures(max_textures: number): string
{
    const src: string[] = [];

    src.push(`@group(1) @binding(1) var u_default_color: vec4<f32>;`);
    src.push(`@group(1) @binding(0) var u_texture_size: array<vec4<f32>, ${max_textures}>;`);
    for (let i = 0; i < max_textures; i++)
    {
        src.push(`@group(1) @binding(${(i * 2) + 2}) var u_texture_${i}: texture_2d<f32>;`);
        src.push(`@group(1) @binding(${(i * 2) + 3}) var u_sampler_${i}: sampler;`);
    }

    src.push('fn sampleMultiTexture(texture_id: u32, uv: vec2<f32>, dx: vec2<f32>, dy: vec2<f32>) -> vec4<f32> {');
    src.push(`switch texture_id {`);
    for (let i = 0; i < max_textures; i++)
    {
        src.push(`  case ${i}: return textureSampleGrad(source_${i}, u_sampler_${i}, uv, dx, dy);`);
    }
    src.push(`  default: return u_shadow_color;`);
    src.push('} }');

    return src.join('\n');
}
