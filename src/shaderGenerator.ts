namespace pixi_tilemap.shaderGenerator {

    export function fillSamplers(shader: TilemapShader, maxTextures: number) {
        var sampleValues: Array<number> = [];
        for (var i = 0; i < maxTextures; i++)
        {
            sampleValues[i] = i;
        }
        shader.bind();
        shader.uniforms.uSamplers = sampleValues;

        var samplerSize: Array<number> = [];
        for (i = 0; i < maxTextures; i++) {
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
        var src = '';

        src += '\n';
        src += '\n';

        src += 'if(vTextureId <= -1.0) {';
        src += '\n\tcolor = shadowColor;';
        src += '\n}';

        for (var i = 0; i < maxTextures; i++)
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

}
