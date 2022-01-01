import { InventoryEvents } from '../events/InventoryEvents';
import { Globals } from '../Globals';
import { XY, Scene, Inventory } from '../Interfaces';
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

  getSpritesFromInventory(inventory: Inventory) {
    return inventory.map((item) => {
      const spriteInfo = Tools.getSpriteInfoFromSpriteSource(item.source);
      return Tools.getNewSprite(this.scene.scene, 0, 0, spriteInfo);
    });
  }

  renderInventory() {
    const inventory = Globals.Instance.getActivePlayer().inventory.slice(0, config.inventorySize);
    inventory.length < config.inventorySize && console.error('inventory is not valid');

    const inventoryItemSpriteScale = 0.35;
    const inventoryGapSize = { x: 8.5, y: 8.5 } as XY;
    const inventoryColumns = 5;
    const inventoryPosition = { x: -12, y: 22 } as XY;

    this.inventorySlotsContainer = Tools.alignSpritesToGrid(
      this.scene.scene,
      this.getSpritesFromInventory(inventory),
      inventoryItemSpriteScale,
      inventoryGapSize,
      inventoryColumns
    );

    Tools.centerContainer(this.inventorySlotsContainer, inventoryPosition);

    this.gameObjectContainer.add(this.inventorySlotsContainer);
  }
}
