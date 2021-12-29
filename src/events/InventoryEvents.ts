import { Events } from '../Interfaces';
import { InventoryScene } from '../scenes/InventoryScene';
import { Tools } from '../Tools';

export class InventoryEvents extends Events<InventoryScene> {
  static inventorySlots = 20;

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
    Tools.destroySprite(params.gameObject);
  }

  onBagClick(params) {
    this.scene.inventorySprite = this.createInventory();
    this.scene.gameObjectContainer.add(this.scene.inventorySprite);
    this.scene.on(this.scene.inventorySprite, undefined);
  }

  renderInventory() {
    // new Array(InventoryEvents.inventorySlots).fill('').forEach(() => {});
  }

  createInventory() {
    const inventorySpriteInfo =
      Tools.getSpriteInfoFromSpriteSource('ui/inventory/0');

    const newInventory = Tools.getNewSprite(
      this.scene.scene.scene,
      ...(Object.values(Tools.getCenterStripePosition(inventorySpriteInfo)) as [
        number,
        number
      ]),
      inventorySpriteInfo
    );

    this.renderInventory();

    return newInventory;
  }
}
