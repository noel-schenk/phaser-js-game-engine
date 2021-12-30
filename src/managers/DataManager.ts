import { Globals } from '../Globals';
import { State } from '../Interfaces';
import merge from 'deepmerge';
import { Tools } from '../Tools';
import equal from 'fast-deep-equal';

export class DataManager {
  socket: WebSocket;

  isReadyCb: Function;
  isReady = false;

  constructor(isReadyCb: Function) {
    this.isReadyCb = isReadyCb;
    this.loadWebsocket();
  }

  private init() {
    this.listenForLocalChanges();
    this.listenForServerUpdates();
  }

  private loadWebsocket() {
    this.socket = new WebSocket('ws://localhost:9000');

    this.socket.addEventListener('open', (event) => {
      this.init();
    });
  }

  private sendData(newState: State) {
    console.log('send currentState');
    this.isReady && this.socket.send(JSON.stringify(newState));
  }

  private listenForLocalChanges() {
    const getCurrentState = () => ({
      entities: Globals.Instance.state.entities.value,
      sprites: Globals.Instance.state.sprites.value
    });

    Globals.Instance.stateTransaction.sprites.subscribe(() => this.sendData(getCurrentState()));

    Globals.Instance.stateTransaction.entities.subscribe(() => {
      this.sendData(getCurrentState());
    });
  }

  private listenForServerUpdates() {
    this.socket.addEventListener('message', (event) => {
      console.log('got new state');
      this.updateLocalStates(JSON.parse(event.data));
      !this.isReady && (this.isReady = true) && this.isReadyCb();
    });
  }

  private updateLocalStates(newState: State) {
    const activeState = Tools.getStateFromGlobalStateEvent();

    const overwriteArrayMerge = (activeState, newState) => newState;

    const updatedState = merge(activeState, newState, {
      arrayMerge: overwriteArrayMerge
    });

    if (!equal(updatedState.sprites, activeState.sprites)) {
      Globals.Instance.state.sprites.next(updatedState.sprites);
    }

    Globals.Instance.state.entities.next(updatedState.entities);
  }
}
