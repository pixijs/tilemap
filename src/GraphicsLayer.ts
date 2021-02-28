import { Matrix } from '@pixi/math';
import { Graphics } from '@pixi/graphics';

export class GraphicsLayer extends Graphics
{
    constructor(zIndex: number)
    {
        super();
        this.zIndex = zIndex;
    }

    renderCanvas(renderer: any)
    {
        const tilemapPlugin = renderer.plugins.tilemap;
        let wt: Matrix = null;

        if (tilemapPlugin && tilemapPlugin.dontUseTransform)
        {
            wt = this.transform.worldTransform;
            this.transform.worldTransform = Matrix.IDENTITY;
        }

        renderer.plugins.graphics.render(this);

        if (tilemapPlugin && tilemapPlugin.dontUseTransform)
        {
            this.transform.worldTransform = wt;
        }

        renderer.context.globalAlpha = 1.0;
    }

    // renderWebGL(renderer: PIXI.Renderer) {
    //     if (!this._webGL[renderer.CONTEXT_UID])
    //         this.dirty++;
    //     super.renderWebGL(renderer)
    // }

    isModified(anim: boolean): boolean
    {
        return false;
    }

    clearModify()
    {
    }
}
