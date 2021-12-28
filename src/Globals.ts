import * as Phaser from 'phaser';
import { State } from './Interfaces';
import { BehaviorSubject } from 'rxjs';

export class Globals {
  private static _instance: Globals;
  game: Phaser.Game;
  sprites = Array<string>();
  state = new BehaviorSubject<State>(undefined);

  canRerender = true;

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}
