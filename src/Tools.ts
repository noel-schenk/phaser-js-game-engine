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

  static getSpriteInfoFromSprite(sprite: Phaser.GameObjects.Sprite) {
    return {
      name: sprite.texture.key,
      mutation: sprite.anims?.currentFrame?.index || 0
    };
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
  ) {
    const sprite = Sprites[spriteInfo.name];

    x = x + sprite.width / 2;
    y = y + sprite.height / 2;
    return { x, y };
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
            ...(Object.values(
              Tools.getTopLeftSpritePosition(spriteX, spriteY, spriteInfo)
            ) as [number, number]),
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
    const spriteStateSource = Tools.getStateReferenceAtPosition(
      to.level,
      to.row,
      to.column
    ).source;
    if (
      !spriteStateSource ||
      spriteStateSource ===
        Tools.getSpriteSourceFromSpriteInfo(Tools.getUndefinedSpriteInfo())
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

  static setGlobalScalingFactorBasedOnGameObject(
    gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container
  ) {
    Globals.Instance.scalingFactor = Math.max(
      Globals.Instance.game.canvas.width / gameObject.getBounds().width,
      Globals.Instance.game.canvas.height / gameObject.getBounds().height
    );
  }

  static setGlobalOffsetPositonRelativeToSprite(
    spriteToCenter: Phaser.GameObjects.Sprite
  ) {
    const defaultX = Globals.Instance.game.canvas.width / 2;
    const defaultY = Globals.Instance.game.canvas.height / 2;

    const spriteInfo = Tools.getSpriteInfoFromSprite(spriteToCenter);
    const offsetPosition = Tools.getTopLeftSpritePosition(
      defaultX,
      defaultY,
      spriteInfo
    );

    offsetPosition.x -= spriteToCenter.x * Globals.Instance.scalingFactor;
    offsetPosition.y -= spriteToCenter.y * Globals.Instance.scalingFactor;

    Globals.Instance.offsetToCenter = offsetPosition;
  }

  static getSpeedForDistance(
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) {
    const x = from.x - to.x;
    const y = from.y - to.y;

    const distance = 40;
    const speedInMs = 100;

    return (Math.hypot(x, y) / distance) * speedInMs;
  }

  static getAngleFromPositions(
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) {
    return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 180;
  }

  static getDirectionFromPosition(
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) {
    let angle = this.getAngleFromPositions(from, to);

    if (angle > 45 && angle < 135) {
      return 'up';
    }
    if (angle > 135 && angle < 225) {
      return 'right';
    }
    if (angle > 225 && angle < 315) {
      return 'down';
    }
    if (angle > 315 || angle < 45) {
      return 'left';
    }
  }

  static loadSpriteAnimations(sprite: Phaser.GameObjects.Sprite) {
    const animationFrames = Sprites[sprite.texture.key]?.animations;

    Object.keys(animationFrames).forEach((direction) => {
      const animationType = animationFrames[direction];
      sprite.anims.create({
        key: direction,
        frames: Globals.Instance.game.anims.generateFrameNumbers(
          sprite.texture.key,
          { frames: animationType }
        ),
        frameRate: 4,
        repeat: -1
      });
    });
  }
}
