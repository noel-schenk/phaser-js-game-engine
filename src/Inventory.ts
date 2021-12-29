import { Scene } from './Interfaces';
import { Tools } from './Tools';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'InventoryScene'
};

export class InventoryScene extends Scene {
  static sceneConfig = sceneConfig;

  bagSprite: Phaser.GameObjects.Sprite;
  inventorySprite: Phaser.GameObjects.Sprite;

  constructor() {
    super(sceneConfig);
  }

  preload() {}

  create() {
    super.create();

    this.gameObjectContainerConfig.offset = false;

    const bagSpriteInfo = Tools.getSpriteInfoFromSpriteSource('ui/bag/0');
    const inventorySpriteInfo =
      Tools.getSpriteInfoFromSpriteSource('ui/inventory/0');

    this.bagSprite = Tools.getNewSprite(
      this.scene.scene,
      ...(Object.values(
        Tools.getTopLeftSpritePosition(0, 0, bagSpriteInfo)
      ) as [number, number]),
      bagSpriteInfo
    );

    this.gameObjectContainer.add(this.bagSprite);

    Tools.addGameObjectToScene<Phaser.GameObjects.Sprite>(
      this.scene.scene,
      this.gameObjectContainer
    );

    this.on(this.bagSprite, undefined);

    this.onSpriteEvent.subscribe((params) => {
      if (params.eventName === 'pointerup') {
        this.inventorySprite = Tools.getNewSprite(
          this.scene.scene,
          ...(Object.values(
            Tools.getCenterStripePosition(inventorySpriteInfo)
          ) as [number, number]),
          inventorySpriteInfo
        );
        this.gameObjectContainer.add(this.inventorySprite);
      }
    });
  }

  override renderUpdate() {}
}
