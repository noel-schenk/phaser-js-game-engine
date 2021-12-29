import * as Phaser from 'phaser';
import { Tools } from '../Tools';
import { Globals } from '../Globals';
import { MainScene, SpriteInfo, SpriteState } from '../Interfaces';
import { SpriteEvents } from '../events/SpriteEvents';
import config from '../json/config.json';
export class HomeOutsideScene extends MainScene {
  static sceneConfig = {
    active: false,
    visible: false,
    key: 'HomeOutsideScene'
  };

  override settings = {
    zIndex: 200
  };

  constructor() {
    super(HomeOutsideScene.sceneConfig);
  }

  override renderUpdate() {
    Tools.removeAllGameObjectsFromScene(this.scene.scene);

    this.gameObjectContainer = new Phaser.GameObjects.Container(
      this.scene.scene
    );

    this.renderScene(
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
    new SpriteEvents(this);
  }

  renderScene(
    scene: Phaser.Scene,
    state: SpriteState[][][],
    container: Phaser.GameObjects.Container,
    spriteRenderCB?: (
      sprite: Phaser.GameObjects.Sprite,
      spriteInfo: SpriteInfo,
      statePosition: {
        levelIndex: number;
        rowIndex: number;
        columnIndex: number;
      }
    ) => void
  ) {
    state.map((level, levelIndex) => {
      level.map((row, rowIndex) => {
        row.map((spriteData, columnIndex) => {
          const spriteInfo = Tools.getSpriteInfoFromSpriteSource(
            spriteData.source
          );
          const spriteX = columnIndex * config.gridSize;
          const spriteY = rowIndex * config.gridSize;

          const sprite = Tools.getNewSprite(
            scene,
            ...(Object.values(
              Tools.getTopLeftSpritePosition(spriteX, spriteY, spriteInfo)
            ) as [number, number]),
            spriteInfo
          );
          sprite.setDisplaySize(40, 40);

          container.add(sprite);

          spriteRenderCB?.(sprite, spriteInfo, {
            levelIndex,
            rowIndex,
            columnIndex
          });
        });
      });
    });
    return Tools.addGameObjectToScene<Phaser.GameObjects.Container>(
      scene,
      container
    );
  }
}
