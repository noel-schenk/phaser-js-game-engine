import { Events } from '../Interfaces';
import { InventoryScene } from '../scenes/InventoryScene';
import { Tools } from '../Tools';

export class InventoryEvents extends Events<InventoryScene> {
  init() {
    this.scene.onSpriteEvent.subscribe((params) => {
      if (params.eventName === 'pointerup') {
        const spriteInfo = Tools.getSpriteInfoFromSprite(params.gameObject);
        switch (spriteInfo.name) {
          case 'ui/bag':
            this.onBagClick(params);
            break;
          case 'ui/inventory':
            this.onInventoryClick(params);
            break;
          default:
            break;
        }
      }
    });
  }

  onInventoryClick(params) {
    Tools.destroyGameObject(this.scene.inventorySprite);
    Tools.destroyGameObject(this.scene.inventorySlotsContainer);
    delete this.scene.inventorySlotsContainer;
  }

  onBagClick(params) {
    this.scene.inventorySprite = this.scene.createInventory();
    this.scene.gameObjectContainer.add(this.scene.inventorySprite);
    this.scene.gameObjectContainer.moveDown(this.scene.inventorySprite);
    this.scene.on(this.scene.inventorySprite, undefined);
  }
}
