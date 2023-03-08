import { describe, it, expect } from 'vitest';
import { BaseTexture, Texture } from '@pixi/core';
import { Tilemap } from '../';

describe('Tilemap', () => {
    it('should calculate local bounds', () => {
        const texture = new Texture(new BaseTexture(null, {
            width: 100,
            height: 100,
        }));
        const tilemap = new Tilemap([texture.baseTexture]);

        tilemap.tile(texture, 0, 0);
        tilemap.tile(texture, 100, 0);

        const bounds = tilemap.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(200);
        expect(bounds.height).to.equal(100);
    });
});
