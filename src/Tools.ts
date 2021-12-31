import { Globals } from './Globals';
import Sprites from './json/sprites.json';
import config from './json/config.json';
import { EntityState, SpriteData, SpriteInfo, SpriteState, State } from './Interfaces';
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

  static getDisplayCenterPosition() {
    const getCenter = (size) => size / 2 / Globals.Instance.scalingFactor;
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

  static destroyGameObject(sprite: Phaser.GameObjects.GameObject) {
    sprite.removeAllListeners();
    sprite.destroy();
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
      Tools.updateStateAtPosition(from.level, from.row, from.column, Tools.getUndefinedSpriteInfo());
      Tools.updateStateAtPosition(to.level, to.row, to.column, from.spriteInfo);
      return true;
    }
    console.log('Hier kann dieses Objekt nicht abgelegt werden');
    return false;
  }

  static clone<T>(object: Object): T {
    return JSON.parse(JSON.stringify(object));
  }

  static updateStateAtPosition(level: number, row: number, column: number, spriteInfo: SpriteInfo) {
    const temp = Tools.clone<SpriteState[][][]>(Globals.Instance.state.sprites.value);
    temp[level][row][column].source = Tools.getSpriteSourceFromSpriteInfo(spriteInfo);
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
    return Phaser.Math.Snap.To(pos, config.gridSize, config.gridSize / 2) - config.gridSize / 2;
  }

  static getUniqueKey() {
    return Math.random().toString(36).substring(2, 9);
  }

  static setGlobalScalingFactorBasedOnGameObject(gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container) {
    Globals.Instance.scalingFactor = Math.max(
      Globals.Instance.game.canvas.width / gameObject.getBounds().width,
      Globals.Instance.game.canvas.height / gameObject.getBounds().height
    );
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

  static getSpeedForDistance(from: { x: number; y: number }, to: { x: number; y: number }, spriteInfo?: SpriteInfo) {
    const x = from.x - to.x;
    const y = from.y - to.y;

    const speed = 200 - Sprites[spriteInfo?.name]?.speed;

    const distance = 40;
    const speedInMs = speed || 100;

    return (Math.hypot(x, y) / distance) * speedInMs * Globals.Instance.scalingFactor;
  }

  static getAngleFromPositions(from: { x: number; y: number }, to: { x: number; y: number }) {
    return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 180;
  }

  static getDirectionFromPosition(from: { x: number; y: number }, to: { x: number; y: number }) {
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
}
