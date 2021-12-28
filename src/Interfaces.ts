import { GameObjects } from 'phaser';
import { Subject } from 'rxjs';
import { Globals } from './Globals';
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
  animations: {
    up: [number];
    right: [number];
    down: [number];
    left: [number];
    idle: [number];
  };
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

  gameObjectContainer: Phaser.GameObjects.Container;

  get sceneConfig() {
    throw 'This property needs to be overwritten';
  }

  create() {
    this.gameObjectContainer = new Phaser.GameObjects.Container(
      this.scene.scene
    );
    Globals.Instance.state.sprites.subscribe(() => {
      const tryRender = () => {
        if (!Globals.Instance.canRerender) {
          console.log('rendering is not possible at the moment');
          setTimeout(() => tryRender(), 100);
          return;
        }
        this.renderUpdate();
      };
      tryRender();
    });
  }

  on(gameObject: Phaser.GameObjects.Sprite, customData: Function) {
    Object.keys(GameObjectEvents).forEach((eventName) => {
      gameObject.on(eventName, (event) => {
        event.x =
          (event.x - Globals.Instance.offsetToCenter.x) /
          Globals.Instance.scalingFactor;
        event.y =
          (event.y - Globals.Instance.offsetToCenter.y) /
          Globals.Instance.scalingFactor;
        this.onSpriteEvent.next({ eventName, gameObject, event, customData });
      });
    });
  }

  update() {
    this.gameObjectContainer.x = Globals.Instance.offsetToCenter.x;
    this.gameObjectContainer.y = Globals.Instance.offsetToCenter.y;
    this.gameObjectContainer.scale = Globals.Instance.scalingFactor;
  }

  renderUpdate() {}
}
