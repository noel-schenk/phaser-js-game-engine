import * as Phaser from 'phaser';
import { Tools } from '../Tools';
import { Globals } from '../Globals';
import { Scene } from '../Interfaces';
import { SpriteEvents } from '../events/SpriteEvents';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'HomeOutsideScene'
};

export class HomeOutsideScene extends Scene {
  static sceneConfig = sceneConfig;

  override settings = {
    zIndex: 200
  };

  constructor() {
    super(sceneConfig);
  }

  preload() {
    Globals.Instance.activeMainScene = this;
  }

  override renderUpdate() {
    Tools.removeAllGameObjectsFromScene(this.scene.scene);

    this.gameObjectContainer = new Phaser.GameObjects.Container(
      this.scene.scene
    );

    Tools.renderScene(
      this.scene.scene,
      Globals.Instance.state.sprites.value,
      this.gameObjectContainer,
      (sprite, spriteInfo, statePosition) => {
        this.on(sprite, () => {
          return { statePosition: statePosition, spriteInfo: spriteInfo };
        });
      }
    );

    Tools.setGlobalScalingFactorBasedOnGameObject(this.gameObjectContainer);
  }

  create() {
    super.create();
    new SpriteEvents(this);
  }
}
