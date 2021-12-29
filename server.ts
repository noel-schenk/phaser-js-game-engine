import handler from 'serve-handler';
import esbuild from 'esbuild';
import express from 'express';
import * as fs from 'fs';
import { WebSocketServer } from 'ws';
import merge from 'deepmerge';
import { Subject } from 'rxjs';

const farmGame = express();
const farmGamePort = 7000;

esbuild.build({
  entryPoints: ['./src/App.ts'],
  watch: true,
  outdir: './www/',
  bundle: true
});

farmGame.use(express.static('assets'));

farmGame.get('*', (request, response) => {
  handler(request, response, {
    public: './www/'
  });
});

farmGame.listen(farmGamePort, () =>
  console.log(`Server listening on port: ${farmGamePort}`)
);

const stateFile = './server/state.json';
const overwriteMerge = (activeState, newState) => newState;
const newData = new Subject<string>();

const getState = () => {
  return JSON.parse(fs.readFileSync(stateFile, 'utf8')) as Object;
};

const setState = (state: Object) => {
  fs.writeFileSync(
    stateFile,
    JSON.stringify(merge(getState(), state, { arrayMerge: overwriteMerge }))
  );
};

const wsPort = 9000;

const wss = new WebSocketServer({
  port: wsPort
});

wss.on('connection', (ws) => {
  const connectionId = Math.random().toString(36).substring(2, 9);

  console.log(`ws Player connected to Port: [${wsPort}]`);

  ws.send(JSON.stringify(getState()));

  ws.on('message', (data) => {
    console.log('ws got new state');
    setState(JSON.parse(data.toString()));
    newData.next(connectionId);
  });

  newData.subscribe((updateConnectionId) => {
    connectionId !== updateConnectionId && ws.send(JSON.stringify(getState()));
  });
});
