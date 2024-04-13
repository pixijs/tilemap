import { Texture } from 'pixi.js';
import { Tilemap } from '../';

describe('Tilemap', () =>
{
    it('should calculate local bounds', () =>
    {
        const canvas = Object.assign(document.createElement('canvas'), { width: 100, height: 100 });
        const texture = Texture.from(canvas);
        const tilemap = new Tilemap([texture.source]);

        tilemap.tile(texture, 0, 0);
        tilemap.tile(texture, 100, 0);

        const bounds = tilemap.getLocalBounds();

        expect(bounds.x).toEqual(0);
        expect(bounds.y).toEqual(0);
        expect(bounds.width).toEqual(200);
        expect(bounds.height).toEqual(100);
    });
});
