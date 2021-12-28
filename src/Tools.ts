import { Globals } from './Globals';
import Sprites from './json/sprites.json';
import config from './json/config.json';
import { SpriteData, SpriteInfo, State } from './Interfaces';
import Phaser from 'phaser';

export class Tools {
  private constructor() {}

  static getSpriteDataFromSpriteName(spriteInfo: SpriteInfo): SpriteData {
    return Sprites[spriteInfo.name];
  }

  static getSpriteSourceFromSpriteInfo(spriteInfo: SpriteInfo) {
    return Object.values(spriteInfo).join('/');
  }

  static getUndefinedSpriteInfo() {
    return { name: 'undefined', mutation: 0 } as SpriteInfo;
  }

  static getSpriteInfoFromSpriteSource(spriteSource: string) {
    const spriteSplit = spriteSource.split('/');
    const spriteData = {
      name: spriteSplit.slice(0, -1).join('/'),
      mutation: parseInt(spriteSplit.at(-1))
    } as SpriteInfo;

    if (Globals.Instance.sprites.includes(spriteData.name)) {
      return spriteData;
    }

    console.log(`Could not find [${spriteData.name}]`);
    return Tools.getUndefinedSpriteInfo();
  }

  static getTopLeftSpritePosition(
    x: number,
    y: number,
    spriteInfo: SpriteInfo
  ): [number, number] {
    const sprite = Sprites[spriteInfo.name];

    x = x + sprite.width / 2;
    y = y + sprite.height / 2;
    return [x, y];
  }

  static loadSprites(sceneName: string) {
    for (const spriteName in Sprites) {
      const sprite = Sprites[spriteName];
      Globals.Instance.sprites.push(spriteName);
      Tools.getSceneByName(sceneName).load.spritesheet(
        spriteName,
        `/sprites/${spriteName}.${sprite.ext}`,
        {
          frameWidth: sprite.width,
          frameHeight: sprite.height
        }
      );
    }
  }

  static getSceneByName(sceneName: string) {
    return Globals.Instance.game.scene.getScene(sceneName);
  }

  static addGameObjectToScene<T extends Phaser.GameObjects.GameObject>(
    scene: Phaser.Scene,
    gameObject: Phaser.GameObjects.GameObject
  ): T {
    return scene.add.existing(gameObject) as any as T;
  }

  static removeAllGameObjectsFromScene(scene: Phaser.Scene) {
    scene.children.each((child) => {
      child.removeAllListeners();
      child.destroy();
    });
  }

  static getNewSprite(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spriteInfo: SpriteInfo
  ) {
    return new Phaser.GameObjects.Sprite(
      scene,
      x,
      y,
      spriteInfo.name,
      spriteInfo.mutation
    );
  }

  static renderScene(
    scene: Phaser.Scene,
    state: State,
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
            ...Tools.getTopLeftSpritePosition(spriteX, spriteY, spriteInfo),
            spriteInfo
          );
          sprite.setSize(40, 40);

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

  static getStateReferenceAtPosition(
    level: number,
    row: number,
    column: number
  ) {
    return Globals.Instance.state.sprites.value[level][row][column];
  }

  static moveSpriteToPosition(
    from: {
      level: number;
      row: number;
      column: number;
      spriteInfo: SpriteInfo;
    },
    to: {
      level: number;
      row: number;
      column: number;
    }
  ) {
    if (
      !Tools.getStateReferenceAtPosition(to.level, to.row, to.column).source
    ) {
      Tools.updateStateAtPosition(
        from.level,
        from.row,
        from.column,
        Tools.getUndefinedSpriteInfo()
      );
      Tools.updateStateAtPosition(to.level, to.row, to.column, from.spriteInfo);
      return true;
    }
    console.log('Hier kann dieses Objekt nicht abgelegt werden');
    return false;
  }

  static clone<T>(object: Object): T {
    return JSON.parse(JSON.stringify(object));
  }

  static updateStateAtPosition(
    level: number,
    row: number,
    column: number,
    spriteInfo: SpriteInfo
  ) {
    const temp = Tools.clone<State>(Globals.Instance.state.sprites.value);
    temp[level][row][column].source =
      Tools.getSpriteSourceFromSpriteInfo(spriteInfo);
    Globals.Instance.state.sprites.next(temp);
  }

  static getGridPosition(x, y) {
    return { row: Tools.getGridNumber(y), column: Tools.getGridNumber(x) };
  }

  static getGridNumber(pos) {
    return Tools.getPixelGridNumber(pos) / config.gridSize;
  }

  static getPixelGridPosition(x, y) {
    return { x: Tools.getPixelGridNumber(x), y: Tools.getPixelGridNumber(y) };
  }

  static getPixelGridNumber(pos) {
    return (
      Phaser.Math.Snap.To(pos, config.gridSize, config.gridSize / 2) -
      config.gridSize / 2
    );
  }

  static getUniqueKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  static getZoomPosition(x, y, zoomFactor) {
    return { x: x / zoomFactor, y: y / zoomFactor };
  }

  static setGlobalScalingFactorBasedOnGameObject(
    gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container
  ) {
    Globals.Instance.scalingFactor = Math.max(
      Globals.Instance.game.canvas.width / gameObject.getBounds().width,
      Globals.Instance.game.canvas.height / gameObject.getBounds().height
    );
  }
}
