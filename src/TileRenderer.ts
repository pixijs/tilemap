import {
    Buffer,
    Renderer,
    BufferUsage,
    CustomRenderPipe, RenderPipe, IndexBufferArray, InstructionSet
} from 'pixi.js';
import { settings } from './settings';
import { TilemapGeometry, TilemapShader } from './TilemapShader';
import type { Tilemap } from './Tilemap';

// For some reason, ESLint goes mad with indentation in this file ^&^
/* eslint-disable no-mixed-spaces-and-tabs, indent */

/**
 * Rendering helper pipeline for tilemaps. This plugin is registered automatically.
 */
export class TileRenderer implements RenderPipe<Tilemap>
{
    /** The managing renderer */
    public readonly renderer: Renderer;

    /** The tile animation frame */
    public tileAnim = [0, 0];

    private ibLen = 0;// index buffer length

    /** The index buffer for the tilemaps to share. */
    private indexBuffer: Buffer = null;

    /** The shader used to render tilemaps. */
    private shader: TilemapShader;

    /** @param renderer - The managing renderer */
    constructor(renderer: Renderer)
    {
	    super(renderer);

	    this.shader = new TilemapShader(settings.TEXTURES_PER_TILEMAP);
	    this.indexBuffer = new Buffer({
            data: null,
            label: 'index-tilemap-buffer',
            usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
        });
	    this.checkIndexBuffer(2000);
    }

    start(): void
    {
	    // sorry, nothing
    }

    /**
	 * @internal
	 * @ignore
	 */
    createVb(): TilemapGeometry
    {
	    const geom = new TilemapGeometry(this.indexBuffer);

        geom.lastTimeAccess = Date.now();

	    return geom;
    }

    /** @return The {@link TilemapShader} shader that this rendering pipeline is using. */
    getShader(): TilemapShader { return this.shader; }

    destroy(): void
    {
	    super.destroy();
	    // this.rectShader.destroy();
	    this.shader = null;
    }

    // eslint-disable-next-line no-unused-vars
    public checkIndexBuffer(size: number): void
    {
	    const totalIndices = size * 6;

	    if (totalIndices <= this.ibLen)
	    {
	        return;
	    }

	    let len = totalIndices;

	    while (len < totalIndices)
	    {
	        len <<= 1;
	    }

	    this.ibLen = totalIndices;
	    this.indexBuffer.data = createIndicesForQuads(size,
	        settings.use32bitIndex ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices));
    }

    destroyRenderable(renderable: Tilemap): void
    {

    }

    addRenderable(renderable: Tilemap, instructionSet: InstructionSet | undefined): void
    {
    }

    updateRenderable(renderable: Tilemap, instructionSet?: InstructionSet | undefined): void
    {
    }

    validateRenderable(renderable: Tilemap): boolean
    {
        return false;
    }
}

function createIndicesForQuads(
    size: number,
    outBuffer: IndexBufferArray
): IndexBufferArray
{
    // the total number of indices in our array, there are 6 points per quad.
    const totalIndices = size * 6;

    if (outBuffer.length !== totalIndices)
    {
        throw new Error(`Out buffer length is incorrect, got ${outBuffer.length} and expected ${totalIndices}`);
    }

    // fill the indices with the quads to draw
    for (let i = 0, j = 0; i < totalIndices; i += 6, j += 4)
    {
        outBuffer[i + 0] = j + 0;
        outBuffer[i + 1] = j + 1;
        outBuffer[i + 2] = j + 2;
        outBuffer[i + 3] = j + 0;
        outBuffer[i + 4] = j + 2;
        outBuffer[i + 5] = j + 3;
    }

    return outBuffer;
}
