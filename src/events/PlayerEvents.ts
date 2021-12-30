import { Globals } from '../Globals';
import { Tools } from '../Tools';

export class PlayerEvents {
  static playerSprite: Phaser.GameObjects.Sprite;

  constructor() {
    this.init();
  }

  init() {
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
    this.updatePlayerEntity(params);
  }

  updatePlayerEntity(params) {
    const activePlayer = Globals.Instance.getActivePlayer();
    activePlayer.x = params.event.x;
    activePlayer.y = params.event.y;
    Globals.Instance.state.entities.next(Globals.Instance.state.entities.value);
    Globals.Instance.stateTransaction.entities.next();
  }

  static whileAnimation(playerSprite: Phaser.GameObjects.Sprite) {
    Tools.setGlobalOffsetPositonRelativeToSprite(playerSprite);
  }

  static afterCreate(playerSprite: Phaser.GameObjects.Sprite) {
    PlayerEvents.playerSprite = playerSprite;

    Tools.setGlobalOffsetPositonRelativeToSprite(playerSprite);
    playerSprite.play('idle');
  }
}
