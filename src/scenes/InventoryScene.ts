import { InventoryEvents } from '../events/InventoryEvents';
import { Scene } from '../Interfaces';
import { Tools } from '../Tools';

export class InventoryScene extends Scene {
  static sceneConfig = {
    active: false,
    visible: false,
    key: 'InventoryScene'
  };

  bagSprite: Phaser.GameObjects.Sprite;
  inventorySprite: Phaser.GameObjects.Sprite;

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
}
