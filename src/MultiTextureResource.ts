/// <reference path="types.d.ts" />

import { ALPHA_MODES } from '@pixi/constants';
import {
  BaseTexture,
  Renderer,
  Texture,
  GLTexture,
  resources,
} from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Constant } from './Constant';

export interface IMultiTextureOptions {
  boundCountPerBuffer: number;
  boundSize: number;
  bufferSize: number;
  DO_CLEAR?: boolean;
}

export class MultiTextureResource extends resources.Resource {
  constructor(options: IMultiTextureOptions) {
    super(options.bufferSize, options.bufferSize);

    const bounds = this.boundSprites;
    const dirties = this.dirties;
    this.boundSize = options.boundSize;
    for (let j = 0; j < options.boundCountPerBuffer; j++) {
      const spr = new Sprite();
      spr.position.x = options.boundSize * (j & 1);
      spr.position.y = options.boundSize * (j >> 1);
      bounds.push(spr);
      dirties.push(0);
    }
    this.DO_CLEAR = !!options.DO_CLEAR;
  }

  DO_CLEAR = false;
  boundSize: number = 0;
  _clearBuffer?: Uint8Array;

  bind(baseTexture: BaseTexture) {
    if (this.baseTex) {
      throw new Error('Only one baseTexture is allowed for this resource!');
    }
    this.baseTex = baseTexture;
    super.bind(baseTexture);
  }

  baseTex?: BaseTexture;
  boundSprites: Array<Sprite> = [];
  dirties: Array<number> = [];

  setTexture(ind: number, texture: Texture) {
    const spr = this.boundSprites[ind];
    if (spr.texture.baseTexture === texture.baseTexture) {
      return;
    }
    spr.texture = texture;
    this.baseTex?.update();
    this.dirties[ind] = (this.baseTex as any).dirtyId;
  }

  upload(renderer: Renderer, texture: BaseTexture, glTexture: GLTexture) {
    const { gl } = renderer as any;

    const { width, height } = this;
    gl.pixelStorei(
      gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
      texture.alphaMode === undefined ||
        texture.alphaMode === ALPHA_MODES.UNPACK
    );

    if (glTexture.dirtyId < 0) {
      (glTexture as any).width = width;
      (glTexture as any).height = height;

      gl.texImage2D(
        texture.target,
        0,
        texture.format,
        width,
        height,
        0,
        texture.format,
        texture.type,
        null
      );
    }

    const doClear = this.DO_CLEAR;
    if (doClear && !this._clearBuffer) {
      this._clearBuffer = new Uint8Array(
        Constant.boundSize * Constant.boundSize * 4
      );
    }

    const bounds = this.boundSprites;
    for (let i = 0; i < bounds.length; i++) {
      const spr = bounds[i];
      const tex = spr.texture.baseTexture;
      if (glTexture.dirtyId >= this.dirties[i]) {
        continue;
      }
      const res = tex.resource as any;
      if (!tex.valid || !res || !res.source) {
        continue;
      }
      if (
        doClear &&
        (tex.width < this.boundSize || tex.height < this.boundSize)
      ) {
        gl.texSubImage2D(
          texture.target,
          0,
          spr.position.x,
          spr.position.y,
          this.boundSize,
          this.boundSize,
          texture.format,
          texture.type,
          this._clearBuffer
        );
      }
      gl.texSubImage2D(
        texture.target,
        0,
        spr.position.x,
        spr.position.y,
        texture.format,
        texture.type,
        res.source
      );
    }

    return true;
  }
}
