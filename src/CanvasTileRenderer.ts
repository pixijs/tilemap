import { Renderer } from 'pixi.js';

export class CanvasTileRenderer {
  renderer: Renderer;
  tileAnim: number[];
  dontUseTransform: boolean;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.tileAnim = [0, 0];
    this.dontUseTransform = false;
  }
}
