import * as Phaser from 'phaser';
import { Tools } from './Tools';
import config from './json/config.json';
import { Globals } from './Globals';
import { Scene } from './Interfaces';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'HomeOutsideScene'
};

export class HomeOutsideScene extends Scene {
  static sceneConfig = sceneConfig;

  private spriteContainer: Phaser.GameObjects.Container;

  constructor() {
    super(sceneConfig);
  }

  preload() {
    Globals.Instance.activeMainScene = this;
  }

  override renderUpdate() {
    this.spriteContainer = new Phaser.GameObjects.Container(
      this.scene.scene,
      0,
      0
    );

    const x = Tools.renderScene(
      this.scene.scene,
      Globals.Instance.state.sprites.value,
      this.spriteContainer,
      (sprite, info, statePosition) => {
        const spriteData = Tools.getSpriteDataFromSpriteName(info);
        if (spriteData.interactive) {
          sprite.setInteractive(spriteData.interactive);
        }

        this.on(sprite, () => {
          return { statePosition: statePosition, info: info };
        });
      }
    );
    Tools.setGlobalScalingFactorBasedOnGameObject(this.spriteContainer);
    this.spriteContainer.scale = Globals.Instance.scalingFactor;
  }

  create() {
    super.create();
    this.onSpriteEvent.subscribe((params) => {
      const data = params.customData();
      const zoomPosition = Tools.getZoomPosition(
        params.event.x,
        params.event.y,
        this.spriteContainer.scale
      );
      switch (params.eventName) {
        case 'drag':
          Globals.Instance.canRerender = false;

          params.gameObject.x = zoomPosition.x;
          params.gameObject.y = zoomPosition.y;
          break;
        case 'dragend':
          params.gameObject.x = Phaser.Math.Snap.To(
            zoomPosition.x,
            config.gridSize,
            config.gridSize / 2
          );
          params.gameObject.y = Phaser.Math.Snap.To(
            zoomPosition.y,
            config.gridSize,
            config.gridSize / 2
          );
          const updatedPosition = Tools.getGridPosition(
            params.gameObject.x,
            params.gameObject.y
          );

          Tools.moveSpriteToPosition(
            {
              level: data.statePosition.levelIndex,
              row: data.statePosition.rowIndex,
              column: data.statePosition.columnIndex,
              spriteInfo: data.info
            },
            {
              level: data.statePosition.levelIndex,
              row: updatedPosition.row,
              column: updatedPosition.column
            }
          )
            ? undefined
            : this.renderUpdate();
          Globals.Instance.canRerender = true;
          break;
        default:
          break;
      }
    });
  }
}
