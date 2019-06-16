namespace pixi_tilemap {
    class GraphicsLayer extends PIXI.Graphics {
        constructor(zIndex: number) {
            super();
            this.zIndex = zIndex;
        }

        renderCanvas(renderer: any) {
            let wt: PIXI.Matrix = null;
            if (renderer.plugins.tilemap.dontUseTransform) {
                wt = this.transform.worldTransform;
                this.transform.worldTransform = PIXI.Matrix.IDENTITY;
            }
            renderer.plugins.graphics.render(this);
            if (renderer.plugins.tilemap.dontUseTransform) {
                this.transform.worldTransform = wt;
            }
            renderer.context.globalAlpha = 1.0;
        }

        // renderWebGL(renderer: PIXI.Renderer) {
        //     if (!this._webGL[renderer.CONTEXT_UID])
        //         this.dirty++;
        //     super.renderWebGL(renderer)
        // }

        isModified(anim: boolean): boolean {
            return false;
        }

        clearModify() {
        }
    }

}
