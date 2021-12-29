import { Globals } from '../Globals';
import { Events, SpriteInfo } from '../Interfaces';
import { PlayerScene } from '../scenes/PlayerScene';
import { Tools } from '../Tools';

export class PlayerEvents extends Events<PlayerScene> {
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

    this.scene.activeTween?.stop();

    this.scene.activeTween = this.scene.add.tween({
      targets: this.scene.playerSprite,
      x: params.event.x,
      y: params.event.y,
      ease: 'Linear',
      duration: Tools.getSpeedForDistance(
        positions.from,
        positions.to,
        this.scene.playerSpriteInfo
      ),
      completeDelay: 100,
      onComplete: () => {
        this.scene.playerSprite.play('idle');
      },
      onUpdate: () => {
        Tools.setGlobalOffsetPositonRelativeToSprite(this.scene.playerSprite);
        this.updatePlayerEntity(params);
      }
    });

    this.scene.playerSprite.play(direction);
  }

  updatePlayerEntity(params) {
    Globals.Instance.activePlayer.x = this.scene.playerSprite.x;
    Globals.Instance.activePlayer.y = this.scene.playerSprite.y;
    Globals.Instance.state.entities.next(Globals.Instance.state.entities.value);
    Globals.Instance.stateTransaction.entities.next();
  }
}
