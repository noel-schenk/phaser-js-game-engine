import { Globals } from '../Globals';
import { Scene } from '../Interfaces';
import { Tools } from '../Tools';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'InventoryScene'
};

export class InventoryScene extends Scene {
  static sceneConfig = sceneConfig;

  bagSprite: Phaser.GameObjects.Sprite;
  inventorySprite: Phaser.GameObjects.Sprite;

  override settings = {
    zIndex: 800
  };

  constructor() {
    super(sceneConfig);
  }

  preload() {}

  create() {
    super.create();

    this.gameObjectContainerConfig.offset = false;

    this.bagSprite = this.createBag();

    this.gameObjectContainer.add(this.bagSprite);

    Tools.addGameObjectToScene<Phaser.GameObjects.Sprite>(
      this.scene.scene,
      this.gameObjectContainer
    );

    this.on(this.bagSprite, undefined);

    this.onSpriteEvent.subscribe((params) => {
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
    this.inventorySprite = this.createInventory();
    this.gameObjectContainer.add(this.inventorySprite);
    this.on(this.inventorySprite, undefined);
  }

  createInventory() {
    const inventorySpriteInfo =
      Tools.getSpriteInfoFromSpriteSource('ui/inventory/0');

    return Tools.getNewSprite(
      this.scene.scene,
      ...(Object.values(Tools.getCenterStripePosition(inventorySpriteInfo)) as [
        number,
        number
      ]),
      inventorySpriteInfo
    );
  }

  createBag() {
    const bagSpriteInfo = Tools.getSpriteInfoFromSpriteSource('ui/bag/0');

    return Tools.getNewSprite(
      this.scene.scene,
      ...(Object.values(
        Tools.getTopLeftSpritePosition(0, 0, bagSpriteInfo)
      ) as [number, number]),
      bagSpriteInfo
    );
  }

  override renderUpdate() {}
}
