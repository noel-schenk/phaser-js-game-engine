import { Globals } from './Globals';
import Sprites from './json/sprites.json';
import config from './json/config.json';
import { SpriteData, State } from './Interfaces';
import Phaser from 'phaser';

export class Tools {
  private constructor() {}

  static getSpriteDataFromSpriteName(spriteInfo: Array<string>): SpriteData {
    return Sprites[Tools.getSpriteNameFromSpriteInfo(spriteInfo)];
  }

  static getSpriteSourceFromSpriteInfo(spriteInfo: Array<string>) {
    return spriteInfo.join('/');
  }

  static getUndefinedSpriteInfo() {
    return ['undefined', '0'];
  }

  static getSpriteInfoFromSpriteSource(spriteSource: string) {
    const spriteData = spriteSource.split('/');
    const spriteName = Tools.getSpriteNameFromSpriteInfo(spriteData);

    if (Globals.Instance.sprites.includes(spriteName)) {
      return spriteData;
    }

    console.log(`Could not find [${spriteName}]`);
    return Tools.getUndefinedSpriteInfo();
  }

  static getSpriteNameFromSpriteInfo(spriteInfo: Array<string>) {
    return spriteInfo.slice(0, -1).join('/');
  }

  static getSpriteMutationFromSpriteInfo(spriteInfo: Array<string>) {
    return parseInt(spriteInfo.at(-1));
  }

  static getTopLeftSpritePosition(
    spriteInfo: Array<string>,
    x: number,
    y: number
  ): [number, number] {
    const sprite = Sprites[Tools.getSpriteNameFromSpriteInfo(spriteInfo)];

    x = x + sprite.width / 2;
    y = y + sprite.height / 2;
    return [x, y];
  }

  static getTopLeftSpriteConfig(
    spriteInfo: Array<string>,
    x: number,
    y: number
  ) {
    return Tools.getSpriteConfig(
      spriteInfo,
      ...Tools.getTopLeftSpritePosition(spriteInfo, x, y)
    );
  }

  static getSpriteConfig(spriteInfo: Array<string>, x: number, y: number) {
    const spriteMutation = Tools.getSpriteMutationFromSpriteInfo(spriteInfo);
    const spriteName = Tools.getSpriteNameFromSpriteInfo(spriteInfo);

    return { x, y, spriteName, spriteMutation };
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

  static addGameObjectToScene<T>(
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
    spriteName: string,
    spriteMutation: number
  ) {
    return new Phaser.GameObjects.Sprite(
      scene,
      x,
      y,
      spriteName,
      spriteMutation
    );
  }

  static renderScene(
    sceneName: string,
    state: State,
    spriteRenderCB?: (
      sprite: Phaser.GameObjects.Sprite,
      info: string[],
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

          const scene = Tools.getSceneByName(sceneName);

          const sprite = Tools.addGameObjectToScene<Phaser.GameObjects.Sprite>(
            scene,
            Tools.getNewSprite(
              scene,
              ...(Object.values(
                Tools.getTopLeftSpriteConfig(spriteInfo, spriteX, spriteY)
              ) as [number, number, string, number])
            )
          );

          sprite.setSize(40, 40);

          spriteRenderCB?.(sprite, spriteInfo, {
            levelIndex,
            rowIndex,
            columnIndex
          });
        });
      });
    });
  }

  static getStateReferenceAtPosition(
    level: number,
    row: number,
    column: number
  ) {
    return Globals.Instance.state.value[level][row][column];
  }

  static moveSpriteToPosition(
    from: {
      level: number;
      row: number;
      column: number;
      spriteInfo: Array<string>;
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
    spriteInfo: Array<string>
  ) {
    const temp = Tools.clone<State>(Globals.Instance.state.value);
    temp[level][row][column].source =
      Tools.getSpriteSourceFromSpriteInfo(spriteInfo);
    Globals.Instance.state.next(temp);
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
}
