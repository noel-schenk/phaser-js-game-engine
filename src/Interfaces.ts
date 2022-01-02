import { Subject } from 'rxjs';
import { Globals } from './Globals';
import { Tools } from './Tools';
import config from './json/config.json';

export enum GameObjectEvents {
  pointerdown,
  pointerup,
  pointermove,
  pointerover,
  pointerout,
  drag,
  dragend
}

export type XY = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type GameObject = Phaser.GameObjects.GameObject & XY & Size;

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
  level: number;
}

export type SpriteInfo = { name: string; mutation: number };

export type SpriteState = { source: string };

export type Inventory = {
  source: string;
}[];

export type EntityState = XY & {
  source: string;
  name: string;
  sceneName: string;
  inventory: Inventory;
};

export type State = {
  sprites: SpriteState[][][];
  entities: EntityState[];
};

export type SpriteEvent = {
  eventName: string;
  gameObject: Phaser.GameObjects.Sprite;
  event: Phaser.Input.Pointer;
  customData: Function;
};

export class Scene extends Phaser.Scene {
  event: Events<Scene>;
  onSpriteEvent = new Subject<SpriteEvent>();

  gameObjectContainer: Phaser.GameObjects.Container;
  gameObjectContainerConfig = {
    scale: true,
    offset: true
  };

  settings = {
    zIndex: 200
  };

  static sceneConfig: Phaser.Types.Scenes.SettingsConfig;

  create() {
    this.gameObjectContainer = new Phaser.GameObjects.Container(this.scene.scene);

    this.data.set('settings', this.settings);

    Tools.orderScenes();

    Globals.Instance.state.sprites.subscribe(() => {
      Tools.tryRender(() => this.renderSpriteUpdate());
    });

    Globals.Instance.state.entities.subscribe(() => {
      Tools.tryRender(() => this.renderEntitiesUpdate());
    });
  }

  on(gameObject: Phaser.GameObjects.Sprite, customData: Function) {
    Object.keys(GameObjectEvents).forEach((eventName) => {
      gameObject.on(eventName, (event) => {
        event.native = { x: 0, y: 0 } as XY;
        event.native.x = Globals.Instance.game.input.activePointer.worldX;
        event.native.y = Globals.Instance.game.input.activePointer.worldY;

        event.x = (event.native.x - Globals.Instance.offsetToCenter.x) / Globals.Instance.scalingFactor;
        event.y = (event.native.y - Globals.Instance.offsetToCenter.y) / Globals.Instance.scalingFactor;
        this.onSpriteEvent.next({ eventName, gameObject, event, customData });
      });
    });
  }

  update() {
    if (this.gameObjectContainerConfig.offset) {
      this.gameObjectContainer.x = Globals.Instance.offsetToCenter.x;
      this.gameObjectContainer.y = Globals.Instance.offsetToCenter.y;
    }

    this.gameObjectContainerConfig.scale && (this.gameObjectContainer.scale = Globals.Instance.scalingFactor);
  }

  renderSpriteUpdate() {}

  renderEntitiesUpdate() {}
}

export class MainScene extends Scene {
  preload() {
    Globals.Instance.activeMainScene = this;
  }

  create() {
    super.create();
  }
}

export class Events<T extends Scene> {
  scene: T;

  constructor(scene: T) {
    this.scene = scene;
    this.scene.event = this;

    Globals.Instance.events.push(this);

    this.init();
  }

  init() {
    throw 'This function need to be overritten';
  }
}
