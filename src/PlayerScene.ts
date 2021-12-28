import * as Phaser from 'phaser';
import { Globals } from './Globals';
import { GameObjectEvents, Scene, SpriteData } from './Interfaces';
import { Tools } from './Tools';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'PlayerScene'
};

export class PlayerScene extends Scene {
  static sceneConfig = sceneConfig;
  constructor() {
    super(sceneConfig);
  }

  preload() {}

  create() {
    const cowSpriteInfo = Tools.getSpriteInfoFromSpriteSource('entity/cow/0');

    const playerGameObject =
      Tools.addGameObjectToScene<Phaser.GameObjects.Sprite>(
        this.scene.scene,
        Tools.getNewSprite(
          this.scene.scene,
          ...Tools.getTopLeftSpritePosition(0, 0, cowSpriteInfo),
          { name: 'entity/cow', mutation: 0 }
        )
      );
    playerGameObject.scale = Globals.Instance.scalingFactor;

    Globals.Instance.activeMainScene.onSpriteEvent.subscribe((params) => {
      if (params.eventName === 'pointerup') {
        switch (params.gameObject.texture.key) {
          case 'ground/grass':
            alert('clicked on grass');
            break;
          default:
            break;
        }
      }
    });
  }
}
