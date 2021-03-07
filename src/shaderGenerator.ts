import { Constant } from './settings';

import type { TilemapShader } from './TilemapShader';

/**
 * This will generate fragment shader code that samples the correct texture into the "color" variable.
 *
 * @internal
 * @ignore
 * @param maxTextures - The texture array length in the shader's uniforms.
 */
function generateSampleSrc(maxTextures: number): string
{
    let src = '';

    src += '\n';
    src += '\n';

    src += 'if(vTextureId <= -1.0) {';
    src += '\n\tcolor = shadowColor;';
    src += '\n}';

    for (let i = 0; i < maxTextures; i++)
    {
        src += '\nelse ';

        if (i < maxTextures - 1)
        {
            src += `if(textureId == ${i}.0)`;
        }

        src += '\n{';
        src += `\n\tcolor = texture2D(uSamplers[${i}], textureCoord * uSamplerSize[${i}]);`;
        src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}

/**
 * @internal
 * @ignore
 * @param shader
 * @param maxTextures
 */
export function fillSamplers(shader: TilemapShader, maxTextures: number): void
{
    const sampleValues: Array<number> = [];

    for (let i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }

    shader.uniforms.uSamplers = sampleValues;

    const samplerSize: Array<number> = [];

    for (let i = 0; i < maxTextures; i++)
    {
        // These are overwritten by TileRenderer when textures actually bound.
        samplerSize.push(1.0 / 2048);
        samplerSize.push(1.0 / 2048);
    }

    shader.uniforms.uSamplerSize = samplerSize;
}

/**
 * @internal
 * @ignore
 * @param maxTextures
 * @param fragmentSrc
 * @returns
 */
export function generateFragmentSrc(maxTextures: number, fragmentSrc: string): string
{
    return fragmentSrc.replace(/%count%/gi, `${maxTextures}`)
        .replace(/%forloop%/gi, generateSampleSrc(maxTextures));
}
