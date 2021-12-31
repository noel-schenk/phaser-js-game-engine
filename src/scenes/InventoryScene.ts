import { InventoryEvents } from '../events/InventoryEvents';
import { Globals } from '../Globals';
import { Scene } from '../Interfaces';
import { Tools } from '../Tools';
import config from './../json/config.json';

export class InventoryScene extends Scene {
  static sceneConfig = {
    active: false,
    visible: false,
    key: 'InventoryScene'
  };

  bagSprite: Phaser.GameObjects.Sprite;
  inventorySprite: Phaser.GameObjects.Sprite;
  inventorySlotsContainer: Phaser.GameObjects.Container;

  override settings = {
    zIndex: 800
  };

  constructor() {
    super(InventoryScene.sceneConfig);
  }

  preload() {}

  create() {
    super.create();

    this.gameObjectContainerConfig.offset = false;

    this.bagSprite = this.createBag();

    this.gameObjectContainer.add(this.bagSprite);

    Tools.addGameObjectToScene<Phaser.GameObjects.Sprite>(this.scene.scene, this.gameObjectContainer);

    this.on(this.bagSprite, undefined);

    new InventoryEvents(this);
  }

  createBag() {
    const bagSpriteInfo = Tools.getSpriteInfoFromSpriteSource('ui/bag/0');

    return Tools.getNewSprite(
      this.scene.scene,
      ...(Object.values(Tools.getTopLeftSpritePosition(0, 0, bagSpriteInfo)) as [number, number]),
      bagSpriteInfo
    );
  }

  createInventory() {
    const inventorySpriteInfo = Tools.getSpriteInfoFromSpriteSource('ui/inventory/0');

    const newInventory = Tools.getNewSprite(
      this.scene.scene,
      ...(Object.values(Tools.getDisplayCenterPosition()) as [number, number]),
      inventorySpriteInfo
    );

    this.renderInventory();

    return newInventory;
  }

  renderInventory() {
    const displayCenterPosition = Tools.getDisplayCenterPosition();

    const inventory = Globals.Instance.getActivePlayer().inventory.slice(0, config.inventorySize);
    this.inventorySlotsContainer = new Phaser.GameObjects.Container(this.scene.scene);

    const inventoryItemSpriteScale = 0.35;
    const inventoryGapSize = { x: 8.5, y: 8.5 };
    const inventoryColumns = 5;
    const inventoryPosition = { x: -12, y: 22 };

    inventory.length < config.inventorySize && console.error('inventory is not valid');

    inventory.forEach((slot, index) => {
      const spriteInfo = Tools.getSpriteInfoFromSpriteSource(slot.source);
      const x =
        inventoryPosition.x +
        (index * (config.gridSize * inventoryItemSpriteScale + inventoryGapSize.x) -
          Math.floor(index / inventoryColumns) *
            (inventoryColumns * (config.gridSize * inventoryItemSpriteScale + inventoryGapSize.x)));
      const y =
        inventoryPosition.y +
        Math.floor(index / inventoryColumns) * (config.gridSize * inventoryItemSpriteScale + inventoryGapSize.y);

      const topLeftSlotPosition = Tools.getTopLeftSpritePosition(x, y, spriteInfo, inventoryItemSpriteScale);

      const sprite = Tools.getNewSprite(this.scene.scene, topLeftSlotPosition.x, topLeftSlotPosition.y, spriteInfo);
      sprite.scale = inventoryItemSpriteScale;

      this.inventorySlotsContainer.add(sprite);
    });

    const inventorySlotsContainerBounds = this.inventorySlotsContainer.getBounds();
    this.inventorySlotsContainer.width = inventorySlotsContainerBounds.width;
    this.inventorySlotsContainer.height = inventorySlotsContainerBounds.height;

    const inventorySlotsContainerCenterPosition = Tools.getCenterPosition(
      displayCenterPosition.x,
      displayCenterPosition.y,
      this.inventorySlotsContainer.width,
      this.inventorySlotsContainer.height
    );
    this.inventorySlotsContainer.x = inventorySlotsContainerCenterPosition.x;
    this.inventorySlotsContainer.y = inventorySlotsContainerCenterPosition.y;

    this.gameObjectContainer.add(this.inventorySlotsContainer);
  }
}
