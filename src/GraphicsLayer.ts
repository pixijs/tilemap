namespace pixi_tilemap {

    class GraphicsLayer extends PIXI.Graphics {

        z: number;
        zIndex: number;

        constructor(zIndex: number) {
            super();
            this.z = this.zIndex = zIndex;
        }

        renderCanvas(renderer: PIXI.CanvasRenderer) {
            var wt: PIXI.Matrix = null;
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

        renderWebGL(renderer: PIXI.WebGLRenderer) {
            if (!this._webGL[renderer.CONTEXT_UID])
                this.dirty = true;
            super.renderWebGL(renderer)
        }

        isModified(anim: boolean): boolean {
            return false;
        }

        clearModify() {
        }
    }

}
