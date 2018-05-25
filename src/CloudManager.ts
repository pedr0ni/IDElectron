import * as electron from 'electron';
import {remote} from 'electron';
import socketIO = require('socket.io');
import * as io from 'socket.io-client';
import { EditorManager } from "./EditorManager";

export class CloudManager {

    private _server: socketIO.Server;
    private _online: boolean;
    private _client: any;
    private _editorManager: EditorManager;
    private http: any;

    constructor(_editorManager: EditorManager) {
        let app = require('express')();
        this.http = require('http').Server(app);
        
        this._server = socketIO(this.http);
        this._editorManager = _editorManager;

        this._server.on('connection', (client) => {
            console.log("Cliente conectado --> " + client);
        });

        this._online = false;
    }

    public listen():void {
        let _this = this;
        this.http.listen(4040, () => {
            console.log("Http server started on port 4040 sending code updates to socket every second.");
            _this._server.listen(4040);
            _this._online = true;
            setInterval(() => {
                _this._server.emit('codeUpdate', _this._editorManager.getMonaco().getValue());
            }, 1100);
        });
        
    }

    public close(): void {
        this._server.close();
        this._online = false;
    }

    public isOnline(): boolean {
        return this._online;
    }

    public connect():void {
        this._client = io('http://localhost:4040');
        this._client.on('connect', () => {
            
        });
        let _this = this;
        this._client.on('codeUpdate', (data: string) => {
            _this._editorManager.getMonaco().setValue(data);
        });
    }

}