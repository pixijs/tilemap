import { Constant } from './Constant';

import type { TilemapShader } from './RectTileShader';


export function fillSamplers(shader: TilemapShader, maxTextures: number) {
    let sampleValues: Array<number> = [];
    for (let i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }
    shader.uniforms.uSamplers = sampleValues;

    let samplerSize: Array<number> = [];
    for (let i = 0; i < maxTextures; i++) {
        samplerSize.push(1.0 / Constant.bufferSize);
        samplerSize.push(1.0 / Constant.bufferSize);
    }
    shader.uniforms.uSamplerSize = samplerSize;
}

export function generateFragmentSrc(maxTextures: number, fragmentSrc: string) {
    return fragmentSrc.replace(/%count%/gi, maxTextures + "")
        .replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
}

export function generateSampleSrc(maxTextures: number) {
    let src = '';

    src += '\n';
    src += '\n';

    src += 'if(vTextureId <= -1.0) {';
    src += '\n\tcolor = shadowColor;';
    src += '\n}';

    for (let i = 0; i < maxTextures; i++)
    {
        src += '\nelse ';

        if(i < maxTextures-1)
        {
            src += 'if(textureId == ' + i + '.0)';
        }

        src += '\n{';
        src += '\n\tcolor = texture2D(uSamplers['+i+'], textureCoord * uSamplerSize['+i+']);';
        src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}
