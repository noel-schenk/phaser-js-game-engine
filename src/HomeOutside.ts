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

  constructor() {
    super(sceneConfig);
  }

  preload() {
    Globals.Instance.activeMainScene = this;
  }

  override renderUpdate() {
    Tools.removeAllGameObjectsFromScene(this.scene.scene);
    this.gameObjectContainer = new Phaser.GameObjects.Container(
      this.scene.scene
    );

    Tools.renderScene(
      this.scene.scene,
      Globals.Instance.state.sprites.value,
      this.gameObjectContainer,
      (sprite, spriteInfo, statePosition) => {
        this.on(sprite, () => {
          return { statePosition: statePosition, spriteInfo: spriteInfo };
        });
      }
    );
    Tools.setGlobalScalingFactorBasedOnGameObject(this.gameObjectContainer);
  }

  create() {
    super.create();
    this.onSpriteEvent.subscribe((params) => {
      const data = params.customData();
      switch (params.eventName) {
        case 'drag':
          Globals.Instance.canRerender = false;

          params.gameObject.x = params.event.x;
          params.gameObject.y = params.event.y;
          break;
        case 'dragend':
          params.gameObject.x = Phaser.Math.Snap.To(
            params.event.x,
            config.gridSize,
            config.gridSize / 2
          );
          params.gameObject.y = Phaser.Math.Snap.To(
            params.event.y,
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
              spriteInfo: data.spriteInfo
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
