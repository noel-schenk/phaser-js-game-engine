import { GameObjects } from 'phaser';
import { Observable, Subject } from 'rxjs';
import { Globals } from './Globals';
import { PlayerScene } from './PlayerScene';
import { Tools } from './Tools';

export enum GameObjectEvents {
  pointerdown,
  pointerup,
  pointermove,
  pointerover,
  pointerout,
  drag,
  dragend
}

export interface SpriteData {
  mutations: number;
  width: number;
  height: number;
  ext: string;
  interactive: { draggable: boolean } | {} | false;
}

export type SpriteInfo = { name: string; mutation: number };

export type State = { source: string }[][][];

export class Scene extends Phaser.Scene {
  onSpriteEvent = new Subject<{
    eventName: string;
    gameObject: GameObjects.Sprite;
    event: any;
    customData: Function;
  }>();

  get sceneConfig() {
    throw 'This property needs to be overwritten';
  }

  create() {
    Globals.Instance.state.sprites.subscribe(() => {
      const tryRender = () => {
        if (!Globals.Instance.canRerender) {
          console.log('rendering is not possible at the moment');
          setTimeout(() => tryRender(), 100);
          return;
        }
        Tools.removeAllGameObjectsFromScene(this.scene.scene);
        this.renderUpdate();
      };
      tryRender();
    });
  }

  on(gameObject: Phaser.GameObjects.Sprite, customData: Function) {
    Object.keys(GameObjectEvents).forEach((eventName) => {
      gameObject.on(eventName, (event) => {
        this.onSpriteEvent.next({ eventName, gameObject, event, customData });
      });
    });
  }

  renderUpdate() {
    throw 'This functions needs to be overwritten';
  }
}
