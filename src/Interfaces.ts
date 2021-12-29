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

export type SpriteEvent = {
  eventName: string;
  gameObject: Phaser.GameObjects.Sprite;
  event: any;
  customData: Function;
};

export class Scene extends Phaser.Scene {
  onSpriteEvent = new Subject<SpriteEvent>();

  gameObjectContainer: Phaser.GameObjects.Container;
  gameObjectContainerConfig = {
    scale: true,
    offset: true
  };

  settings = {
    zIndex: 200
  };

  get sceneConfig() {
    throw 'This property needs to be overwritten';
  }

  create() {
    this.gameObjectContainer = new Phaser.GameObjects.Container(
      this.scene.scene
    );

    this.data.set('settings', this.settings);

    Tools.orderScenes();

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
    if (this.gameObjectContainerConfig.offset) {
      this.gameObjectContainer.x = Globals.Instance.offsetToCenter.x;
      this.gameObjectContainer.y = Globals.Instance.offsetToCenter.y;
    }

    this.gameObjectContainerConfig.scale &&
      (this.gameObjectContainer.scale = Globals.Instance.scalingFactor);
  }

  renderUpdate() {}
}

export class Events<T extends Scene> {
  scene: T;

  constructor(scene: T) {
    this.scene = scene;
    this.init();
  }

  init() {
    throw 'This function need to be overritten';
  }
}
