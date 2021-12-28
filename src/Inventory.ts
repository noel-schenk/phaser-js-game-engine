import { Scene } from './Interfaces';
import { Tools } from './Tools';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'InventoryScene'
};

export class InventoryScene extends Scene {
  static sceneConfig = sceneConfig;
  constructor() {
    super(sceneConfig);
  }

  preload() {}

  create() {
    const bagSpriteInfo = Tools.getSpriteInfoFromSpriteSource('ui/bag/0');
    const inventorySpriteInfo = Tools.getSpriteInfoFromSpriteSource('ui/bag/0');

    Tools.addGameObjectToScene<Phaser.GameObjects.Sprite>(
      this.scene.scene,
      Tools.getNewSprite(
        this.scene.scene,
        ...Tools.getTopLeftSpritePosition(0, 0, bagSpriteInfo),
        { name: 'ui/bag', mutation: 0 }
      )
    ).on('pointerup', (pointer) => {
      Tools.addGameObjectToScene(
        this.scene.scene,
        Tools.getNewSprite(
          this.scene.scene,
          ...Tools.getTopLeftSpritePosition(0, 0, inventorySpriteInfo),
          { name: 'ui/inventory', mutation: 0 }
        )
      );
    });
  }

  override renderUpdate() {}
}
