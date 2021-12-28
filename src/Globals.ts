import * as Phaser from 'phaser';
import { Scene, State } from './Interfaces';
import { BehaviorSubject } from 'rxjs';

export class Globals {
  private static _instance: Globals;
  game: Phaser.Game;
  sprites = Array<string>();
  state = {
    sprites: new BehaviorSubject<State>(undefined),
    entities: new BehaviorSubject<State>(undefined)
  };
  scalingFactor = 1;
  canRerender = true;
  activeMainScene: Scene;
  offsetToCenter = { x: 0, y: 0 };

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}
