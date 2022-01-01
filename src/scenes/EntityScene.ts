import { PlayerEvents } from '../events/PlayerEvents';
import { Globals } from '../Globals';
import { XY, EntityState, Scene, SpriteInfo } from '../Interfaces';
import { LoginManager } from '../managers/LoginManager';
import { Tools } from '../Tools';

export class EntityScene extends Scene {
  private isReady = false;

  static sceneConfig = {
    active: false,
    visible: false,
    key: 'EntityScene'
  };

  override settings = {
    zIndex: 400
  };

  constructor() {
    super(EntityScene.sceneConfig);
  }

  preload() {}

  create() {
    super.create();

    Globals.Instance.state.entities.value.forEach((entityState) => {
      if (entityState.sceneName === Globals.Instance.activeMainScene.scene.key) {
        const entitySprite = this.addEntity(entityState);

        if (this.isPlayer(entityState)) {
          PlayerEvents.afterCreate(entitySprite);
        }
      }
    });

    Tools.addGameObjectToScene<Phaser.GameObjects.Sprite>(this.scene.scene, this.gameObjectContainer);
    this.isReady = true;
  }

  renderEntitiesUpdate() {
    if (!this.isReady) return;
    Globals.Instance.state.entities.value.forEach((entityState) => {
      const existingEntitySprite = this.gameObjectContainer.list.find(
        (entitySprite) => entitySprite.getData('EntityState').name === entityState.name
      ) as Phaser.GameObjects.Sprite;

      if (existingEntitySprite) {
        const entitySpriteInfo = Tools.getSpriteInfoFromSpriteSource(entityState.source);

        this.animateEntity(existingEntitySprite, entityState, entitySpriteInfo);

        if (existingEntitySprite.texture.key !== entitySpriteInfo.name) {
          existingEntitySprite.texture.key = entitySpriteInfo.name;
          existingEntitySprite.setFrame(entitySpriteInfo.mutation);
        }

        return;
      }
      this.addEntity(entityState);
    });

    this.removeDeletedEntities();
  }

  animateEntity(entitySprite: Phaser.GameObjects.Sprite, entityState: EntityState, entitySpriteInfo: SpriteInfo) {
    const coordinates = {
      from: { x: entitySprite.x, y: entitySprite.y } as XY,
      to: { x: entityState.x, y: entityState.y } as XY
    };

    const direction = Tools.getDirectionFromPosition(coordinates.from, coordinates.to);

    if (coordinates.from.x !== coordinates.to.x || coordinates.from.y !== coordinates.to.y) {
      entitySprite.getData('tween')?.stop().removeAllListeners().remove();

      const tween = this.scene.scene.add.tween({
        targets: entitySprite,
        x: entityState.x,
        y: entityState.y,
        ease: 'Linear',
        duration: Tools.getSpeedForDistance(coordinates.from, coordinates.to, entitySpriteInfo),
        completeDelay: 100,
        onComplete: () => {
          entitySprite.play('idle');
        },
        onUpdate: () => {
          if (this.isPlayer(entityState)) {
            PlayerEvents.whileAnimation(entitySprite);
          }
        }
      });

      entitySprite.setData('tween', tween);
      entitySprite.play(direction);
    }
  }

  removeDeletedEntities() {
    const existingEntityNames = Globals.Instance.state.entities.value.map((entity) => entity.name);
    this.gameObjectContainer.list.filter((entitySprite) =>
      existingEntityNames.includes(entitySprite.getData('EntityState').name)
    );
  }

  addEntity(entityState: EntityState) {
    const entitySpriteInfo = Tools.getSpriteInfoFromSpriteSource(entityState.source);
    const entitySprite = Tools.getNewSprite(this.scene.scene, entityState.x, entityState.y, entitySpriteInfo);
    entitySprite.setData('EntityState', entityState);

    this.add.existing(entitySprite);
    this.gameObjectContainer.add(entitySprite);

    return entitySprite;
  }

  isPlayer(entityState) {
    return entityState.name === Globals.Instance.getActivePlayer().name;
  }
}
