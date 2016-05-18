var shaderGenerator = {
    fillSamplers: function(shader, maxTextures) {
        var sampleValues = [];
        for (var i = 0; i < maxTextures; i++)
        {
            sampleValues[i] = i;
        }
        shader.bind();
        shader.uniforms.uSamplers = sampleValues;

        var samplerSize = [];
        for (i = 0; i < maxTextures; i++) {
            samplerSize.push(1.0 / 2048);
            samplerSize.push(1.0 / 2048);
        }
        shader.uniforms.uSamplerSize = samplerSize;
    },
    generateFragmentSrc: function(maxTextures, fragmentSrc) {
        return fragmentSrc.replace(/%count%/gi, maxTextures)
            .replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
    },
    generateSampleSrc: function(maxTextures) {
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
                src += 'if(vTextureId == ' + i + '.0)';
            }

            src += '\n{';
            src += '\n\tcolor = texture2D(uSamplers['+i+'], textureCoord * uSamplerSize['+i+']);';
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }
};

module.exports = shaderGenerator;
