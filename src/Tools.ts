import { Globals } from './Globals';
import Sprites from './json/sprites.json';
import config from './json/config.json';
import {
  XY,
  EntityState,
  SpriteData,
  SpriteInfo,
  SpriteState,
  State,
  GameObject,
  SpriteEvent,
  Events,
  Scene
} from './Interfaces';
import Phaser from 'phaser';

export class Tools {
  private constructor() {}

  static getSpriteDataFromSpriteInfo(spriteInfo: SpriteInfo): SpriteData {
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
      mutation: parseInt(sprite.frame.name)
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

  static getDisplayCenterPosition(scalingFactor = Globals.Instance.scalingFactor) {
    const getCenter = (size) => size / 2 / scalingFactor;
    return { x: getCenter(Globals.Instance.game.canvas.width), y: getCenter(Globals.Instance.game.canvas.height) };
  }

  static getTopLeftSpritePosition(x: number, y: number, spriteInfo: SpriteInfo, spriteScalingFactor = 1) {
    const sprite = Sprites[spriteInfo.name];

    return Tools.getTopLeftPosition(x, y, sprite.width, sprite.height, spriteScalingFactor);
  }

  static getTopLeftPosition(x: number, y: number, width: number, height: number, spriteScalingFactor = 1) {
    x = x + (width * spriteScalingFactor) / 2;
    y = y + (height * spriteScalingFactor) / 2;
    return { x, y };
  }

  static getCenterPosition(x: number, y: number, width: number, height: number, spriteScalingFactor = 1) {
    x = x - (width * spriteScalingFactor) / 2;
    y = y - (height * spriteScalingFactor) / 2;
    return { x, y };
  }

  static loadSprites(scene: Phaser.Scene) {
    for (const spriteName in Sprites) {
      const sprite = Sprites[spriteName];
      Globals.Instance.sprites.push(spriteName);
      scene.load.spritesheet(spriteName, `/sprites/${spriteName}.${sprite.ext}`, {
        frameWidth: sprite.width,
        frameHeight: sprite.height
      });
    }
  }

  static removeAllGameObjectsFromScene(scene: Phaser.Scene) {
    while (scene.children.list[0]) {
      const child = scene.children.list[0] as GameObject;
      child && Tools.destroyGameObject(child);
    }
    console.log(scene.children.list, 'should be empty');
  }

  static destroyGameObject(gameObject: GameObject) {
    gameObject.removeAllListeners();
    gameObject.destroy();
  }

  static getNewSprite(scene: Phaser.Scene, x: number, y: number, spriteInfo: SpriteInfo) {
    const newSprite = new Phaser.GameObjects.Sprite(scene, x, y, spriteInfo.name, spriteInfo.mutation);

    const spriteData = Tools.getSpriteDataFromSpriteInfo(spriteInfo);

    if (spriteData.interactive) {
      newSprite.setInteractive(spriteData.interactive);
    }

    if (spriteData.animations) {
      Tools.loadSpriteAnimations(newSprite);

      newSprite.anims.play('idle');
    }

    return newSprite;
  }

  static getStateReferenceAtPosition(level: number, row: number, column: number) {
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
    const spriteStateSource = Tools.getStateReferenceAtPosition(to.level, to.row, to.column).source;
    if (
      !spriteStateSource ||
      spriteStateSource === Tools.getSpriteSourceFromSpriteInfo(Tools.getUndefinedSpriteInfo())
    ) {
      Tools.updateStateSpritesToNewPosition([
        {
          level: from.level,
          row: from.row,
          column: from.column,
          spriteInfo: Tools.getUndefinedSpriteInfo()
        },
        {
          level: to.level,
          row: to.row,
          column: to.column,
          spriteInfo: from.spriteInfo
        }
      ]);
      return true;
    }
    console.log('Hier kann dieses Objekt nicht abgelegt werden');
    return false;
  }

  static clone<T>(object: Object): T {
    return JSON.parse(JSON.stringify(object));
  }

  // this function will not move the sprite only set the sprite source to the current position
  static updateSpriteToNewPosition(sprite: Phaser.GameObjects.Sprite) {
    const spriteInfo = Tools.getSpriteInfoFromSprite(sprite);
    const spriteData = Tools.getSpriteDataFromSpriteInfo(spriteInfo);
    const gridPosition = Tools.getGridPosition(sprite.x, sprite.y);
    Tools.updateStateSpritesToNewPosition([
      {
        level: spriteData?.level || (spriteData?.level !== 0 && 1) || spriteData.level,
        column: gridPosition.column,
        row: gridPosition.row,
        spriteInfo: spriteInfo
      }
    ]);
  }

  static updateStateSpritesToNewPosition(
    sprites: Array<{ level: number; row: number; column: number; spriteInfo: SpriteInfo }>
  ) {
    const temp = Tools.clone<SpriteState[][][]>(Globals.Instance.state.sprites.value);
    sprites.forEach((sprite) => {
      temp[sprite.level][sprite.row][sprite.column].source = Tools.getSpriteSourceFromSpriteInfo(sprite.spriteInfo);
    });
    Globals.Instance.state.sprites.next(temp);
  }

  static getGridPosition(x, y) {
    return { row: Tools.getGridNumber(y), column: Tools.getGridNumber(x) };
  }

  static getGridNumber(pos) {
    return Tools.getPixelGridNumber(pos) / config.gridSize;
  }

  static getPixelGridPosition({ x, y }: XY) {
    return { x: Tools.getPixelGridNumber(x), y: Tools.getPixelGridNumber(y) };
  }

  static getPixelGridNumber(pos) {
    return Phaser.Math.Snap.To(pos, config.gridSize);
  }

  static getUniqueKey() {
    return Math.random().toString(36).substring(2, 9);
  }

  static setGlobalOffsetPositonRelativeToSprite(spriteToCenter: Phaser.GameObjects.Sprite) {
    const defaultX = Globals.Instance.game.canvas.width / 2;
    const defaultY = Globals.Instance.game.canvas.height / 2;

    const spriteInfo = Tools.getSpriteInfoFromSprite(spriteToCenter);
    const offsetPosition = Tools.getTopLeftSpritePosition(defaultX, defaultY, spriteInfo);

    offsetPosition.x -= spriteToCenter.x * Globals.Instance.scalingFactor;
    offsetPosition.y -= spriteToCenter.y * Globals.Instance.scalingFactor;

    Globals.Instance.offsetToCenter = offsetPosition;
  }

  static getDistanceFromXY(from: XY, to: XY) {
    const x = from.x - to.x;
    const y = from.y - to.y;
    return Math.hypot(x, y);
  }

  static getSpeedForDistance(from: XY, to: XY, spriteInfo?: SpriteInfo) {
    const speed = 25 - Sprites[spriteInfo?.name]?.speed / 4;

    const speedInMs = speed || 100;

    return Tools.getDistanceFromXY(from, to) * speedInMs;
  }

  static getAngleFromPositions(from: XY, to: XY) {
    return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 180;
  }

  static getDirectionFromPosition(from: XY, to: XY) {
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

    if (animationFrames) {
      Object.keys(animationFrames).forEach((direction) => {
        const animationType = animationFrames[direction];
        sprite.anims.create({
          key: direction,
          frames: Globals.Instance.game.anims.generateFrameNumbers(sprite.texture.key, { frames: animationType }),
          frameRate: 4,
          repeat: -1
        });
      });
    }
  }

  static orderScenes() {
    [...Globals.Instance.game.scene.scenes]
      .sort((sceneA, sceneB) => sceneA.data.get('settings').zIndex - sceneB.data.get('settings').zIndex)
      .forEach((scene) => {
        scene.scene.bringToTop();
      });
  }

  static getStateFromGlobalStateEvent() {
    return {
      entities: Globals.Instance.state.entities.value,
      sprites: Globals.Instance.state.sprites.value
    } as State;
  }

  static tryRender(cb: Function) {
    const tryRender = () => {
      if (!Globals.Instance.canRerender) {
        console.log('rendering is not possible at the moment');
        setTimeout(() => tryRender(), 100);
        return;
      }
      cb();
    };
    tryRender();
  }

  static alignSpritesToGrid(
    scene: Phaser.Scene,
    sprites: Array<Phaser.GameObjects.Sprite>,
    spriteScale: number,
    gapSize: XY,
    columns: number
  ) {
    const spriteContainer = new Phaser.GameObjects.Container(scene);

    sprites.forEach((sprite, index) => {
      const x =
        index * (config.gridSize * spriteScale + gapSize.x) -
        Math.floor(index / columns) * (columns * (config.gridSize * spriteScale + gapSize.x));
      const y = Math.floor(index / columns) * (config.gridSize * spriteScale + gapSize.y);

      sprite.x = x;
      sprite.y = y;
      sprite.scale = spriteScale;
      sprite.setOrigin(0);

      spriteContainer.add(sprite);
    });

    return spriteContainer;
  }

  static centerGameObject(gameObject: GameObject, offset: XY = { x: 0, y: 0 }) {
    let displayCenterPosition = Tools.getDisplayCenterPosition();

    if (!(gameObject as any).setDisplayOrigin) {
      const container = gameObject as Phaser.GameObjects.Container;

      const gameObjectBounds = container.getBounds();
      container.width = gameObjectBounds.width;
      container.height = gameObjectBounds.height;

      displayCenterPosition = Tools.getCenterPosition(
        displayCenterPosition.x,
        displayCenterPosition.y,
        container.width,
        container.height
      );
    }

    if ((gameObject as any).setDisplayOrigin) {
      (gameObject as any).setOrigin(0.5);
    }

    gameObject.x = displayCenterPosition.x + offset.x;
    gameObject.y = displayCenterPosition.y + offset.y;
  }

  static setGlobalScalingFactor() {
    Globals.Instance.scalingFactor = 4;
    if (Globals.Instance.game.canvas.width < 800) {
      Globals.Instance.scalingFactor = 2;
    }
  }

  static spriteFollowMouse(sprite: Phaser.GameObjects.Sprite, event: Phaser.Input.Pointer) {
    sprite.setOrigin(0.5);
    sprite.x = event.x;
    sprite.y = event.y;
  }

  static doWhile(task: Function, check: () => boolean) {
    const interval = setInterval(() => {
      task();
      !check() && clearInterval(interval);
    });
  }

  static getEvent<T extends Events<Scene>>(type: string) {
    return Globals.Instance.events.find((event) => event.constructor.name === `${type}Events`) as T;
  }
}
