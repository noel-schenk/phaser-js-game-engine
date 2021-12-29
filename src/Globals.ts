import * as Phaser from 'phaser';
import { Scene, SpriteState, EntityState, State } from './Interfaces';
import { BehaviorSubject, Subject } from 'rxjs';

export class Globals {
  private static _instance: Globals;
  game: Phaser.Game;
  sprites = Array<string>();
  state = {
    sprites: new BehaviorSubject<SpriteState[][][]>(undefined),
    entities: new BehaviorSubject<EntityState[]>(undefined)
  };

  stateTransaction = {
    sprites: new Subject<void>(),
    entities: new Subject<void>()
  };

  scalingFactor = 1;
  canRerender = true;
  activeMainScene: Scene;
  offsetToCenter = { x: 0, y: 0 };
  activePlayer: EntityState; // call state.entities.next() on update

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}
