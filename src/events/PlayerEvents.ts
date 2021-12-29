import { Globals } from '../Globals';
import { Events } from '../Interfaces';
import { PlayerScene } from '../scenes/PlayerScene';
import { Tools } from '../Tools';

export class PlayerEvents extends Events<PlayerScene> {
  activeTween: Phaser.Tweens.Tween;

  override init() {
    Globals.Instance.activeMainScene.onSpriteEvent.subscribe((params) => {
      if (params.eventName === 'pointerup') {
        this.onClick(params);
      }
    });
  }

  onClick(params) {
    switch (params.gameObject.texture.key) {
      case 'ground/grass':
        this.onClickGroundGrass(params);
        break;
    }
  }

  onClickGroundGrass(params) {
    const positions = {
      from: { x: this.scene.playerSprite.x, y: this.scene.playerSprite.y },
      to: { x: params.event.x, y: params.event.y }
    };

    const direction = Tools.getDirectionFromPosition(
      positions.from,
      positions.to
    );

    this.activeTween?.stop();

    this.activeTween = this.scene.add.tween({
      targets: this.scene.playerSprite,
      x: params.event.x,
      y: params.event.y,
      ease: 'Linear',
      duration:
        Tools.getSpeedForDistance(positions.from, positions.to) *
        Globals.Instance.scalingFactor,
      completeDelay: 100,
      onComplete: () => {
        this.scene.playerSprite.play('idle');
      },
      onUpdate: () => {
        Tools.setGlobalOffsetPositonRelativeToSprite(this.scene.playerSprite);
      }
    });

    this.scene.playerSprite.play(direction);
  }
}
