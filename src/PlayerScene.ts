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

  playerSprite: Phaser.GameObjects.Sprite;
  activeTween: Phaser.Tweens.Tween;

  constructor() {
    super(sceneConfig);
  }

  preload() {}

  create() {
    super.create();

    const cowSpriteInfo = Tools.getSpriteInfoFromSpriteSource('entity/cow/1');

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

    Tools.loadSpriteAnimations(this.playerSprite);

    Tools.setGlobalOffsetPositonRelativeToSprite(this.playerSprite);

    Globals.Instance.activeMainScene.onSpriteEvent.subscribe((params) => {
      if (params.eventName === 'pointerup') {
        const eventX = params.event.x;
        const eventY = params.event.y;

        const positions = {
          from: { x: this.playerSprite.x, y: this.playerSprite.y },
          to: { x: eventX, y: eventY }
        };
        const direction = Tools.getDirectionFromPosition(
          positions.from,
          positions.to
        );

        switch (params.gameObject.texture.key) {
          case 'ground/grass':
            this.activeTween?.stop();
            this.activeTween = this.add.tween({
              targets: this.playerSprite,
              x: eventX,
              y: eventY,
              ease: 'Linear',
              duration:
                Tools.getSpeedForDistance(positions.from, positions.to) *
                Globals.Instance.scalingFactor,
              completeDelay: 100,
              onComplete: () => {
                this.playerSprite.play('idle');
              },
              onUpdate: () => {
                Tools.setGlobalOffsetPositonRelativeToSprite(this.playerSprite);
              }
            });

            this.playerSprite.play(direction);
            break;
          default:
            break;
        }
      }
    });
  }
}
