import { SCALE_MODES } from '@pixi/constants';

/**
 * These are additional @pixi/tilemap options.
 *
 * This settings should not be changed after the renderer has initialized; otherwise, the behavior
 * is undefined.
 */
export const settings = {
    /** The default number of textures per tilemap in a tilemap composite. */
    TEXTURES_PER_TILEMAP: 16,

    /**
     * The width/height of each texture tile in a {@link TEXTILE_DIMEN}. This is 1024px by default.
     *
     * This should fit all tile base-textures; otherwise, {@link TextileResource} may fail to correctly
     * upload the textures togther in a tiled fashion.
     */
    TEXTILE_DIMEN: 1024,

    /**
     * The number of texture tiles per {@link TextileResource}.
     *
     * Texture tiling is disabled by default, and so this is set to `1` by default. If it is set to a
     * higher value, textures will be uploaded together in a tiled fashion.
     *
     * Since {@link TextileResource} is a dual-column format, this should be even for packing
     * efficiency. The optimal value is usually 4.
     */
    TEXTILE_UNITS: 1,

    /** The scaling mode of the combined texture tiling. */
    TEXTILE_SCALE_MODE: SCALE_MODES.LINEAR,

    /** This will enable 32-bit index buffers. It's useful when you have more than 16K tiles. */
    use32bitIndex: false,

    /** Flags whether textiles should be cleared when each tile is uploaded. */
    DO_CLEAR: true,

    // Backward compatibility
    get maxTextures(): number { return this.MAX_TEXTURES; },
    set maxTextures(value: number) { this.MAX_TEXTURES = value; },

    get boundSize(): number { return this.TEXTURE_TILE_DIMEN; },
    set boundSize(value: number) { this.TILE_TEXTURE_DIMEN = value; },

    get boundCountPerBuffer(): number { return this.TEXTILE_UNITS; },
    set boundCountPerBuffer(value: number) { this.TEXTILE_UNITS = value; },
};

// @deprecated
export const Constant = settings;
