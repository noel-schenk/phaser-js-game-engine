import * as Phaser from 'phaser';
import { PlayerEvents } from '../events/PlayerEvents';
import { Globals } from '../Globals';
import { Scene, SpriteInfo } from '../Interfaces';
import { Tools } from '../Tools';

export class PlayerScene extends Scene {
  static sceneConfig = {
    active: false,
    visible: false,
    key: 'PlayerScene'
  };

  activeTween: Phaser.Tweens.Tween;
  playerSprite: Phaser.GameObjects.Sprite;
  playerSpriteInfo: SpriteInfo;

  override settings = {
    zIndex: 400
  };

  constructor() {
    super(PlayerScene.sceneConfig);
  }

  preload() {}

  create() {
    super.create();

    this.playerSpriteInfo = Tools.getSpriteInfoFromSpriteSource(
      Globals.Instance.activePlayer.source
    );

    this.playerSprite = Tools.getNewSprite(
      this.scene.scene,
      Globals.Instance.activePlayer.x,
      Globals.Instance.activePlayer.y,
      this.playerSpriteInfo
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
