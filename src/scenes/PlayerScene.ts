import * as Phaser from 'phaser';
import { PlayerEvents } from '../events/PlayerEvents';
import { Globals } from '../Globals';
import { Scene } from '../Interfaces';
import { Tools } from '../Tools';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'PlayerScene'
};

export class PlayerScene extends Scene {
  static sceneConfig = sceneConfig;

  playerSprite: Phaser.GameObjects.Sprite;

  override settings = {
    zIndex: 400
  };

  constructor() {
    super(sceneConfig);
  }

  preload() {}

  create() {
    super.create();

    const cowSpriteInfo = Tools.getSpriteInfoFromSpriteSource('entity/cow/0');

    this.playerSprite = Tools.getNewSprite(
      this.scene.scene,
      ...(Object.values(
        Tools.getTopLeftSpritePosition(0, 0, cowSpriteInfo)
      ) as [number, number]),
      cowSpriteInfo
    );

    this.add.existing(this.playerSprite);
    this.gameObjectContainer.add(this.playerSprite);

    Tools.addGameObjectToScene<Phaser.GameObjects.Container>(
      this.scene.scene,
      this.gameObjectContainer
    );

    Tools.setGlobalOffsetPositonRelativeToSprite(this.playerSprite);

    this.playerSprite.play('idle');

    new PlayerEvents(this);
  }
}
