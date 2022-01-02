import { Globals } from '../Globals';
import { Events, SpriteEvent } from '../Interfaces';
import { InventoryScene } from '../scenes/InventoryScene';
import { Tools } from '../Tools';
import { SpriteEvents } from './SpriteEvents';

export class InventoryEvents extends Events<InventoryScene> {
  init() {
    this.scene.onSpriteEvent.subscribe((params) => {
      if (params.eventName === 'pointerup') {
        const spriteInfo = Tools.getSpriteInfoFromSprite(params.gameObject);

        if (spriteInfo.name === 'ui/bag') {
          this.onBagClick(params);
        }

        if (spriteInfo.name === 'ui/inventory') {
          this.onInventoryClick(params);
        }

        if (params?.gameObject?.parentContainer?.name === 'inventorySlotsContainer') {
          this.onInventoryItemClick(params);
        }
      }
    });
  }

  onInventoryClick(params: SpriteEvent) {
    Tools.destroyGameObject(this.scene.inventorySprite);
    Tools.destroyGameObject(this.scene.inventorySlotsContainer);
    delete this.scene.inventorySprite;
    delete this.scene.inventorySlotsContainer;
  }

  onBagClick(params: SpriteEvent) {
    this.scene.loadInventory();
    this.scene.gameObjectContainer.add(this.scene.inventorySprite);
    this.scene.gameObjectContainer.moveDown(this.scene.inventorySprite);
    this.scene.on(this.scene.inventorySprite, undefined);
  }

  onInventoryItemClick(params: SpriteEvent) {
    const sprite = params.gameObject as Phaser.GameObjects.Sprite;
    sprite.scale = 1;

    Globals.Instance.activeMainScene.gameObjectContainer.add(sprite);
    this.scene.reload();

    let isInDropMode = true;

    const checkForDrop = this.scene.onSpriteEvent.subscribe((params) => {
      if (params.eventName === 'pointerup') {
        isInDropMode = false;
        checkForDrop.unsubscribe();
        Tools.updateSpriteToNewPosition(sprite);
        Globals.Instance.stateTransaction.sprites.next();
      }
    });

    Tools.doWhile(
      () => {
        Tools.spriteFollowMouse(params.gameObject, params.event);
      },
      () => {
        return isInDropMode;
      }
    );
  }
}
