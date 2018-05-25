import * as electron from 'electron';
import {remote} from 'electron';
import socketIO = require('socket.io');
import * as io from 'socket.io-client';
import { EditorManager } from "./EditorManager";

export class CloudManager {

    private _server: socketIO.Server;
    private _client: any;
    private _editorManager: EditorManager;
    private http: any;

    private _codeInterval: any;

    private _isserver: boolean;
    private _isclient: boolean;

    constructor(_editorManager: EditorManager) {
        let app = require('express')();
        this.http = require('http').Server(app);
        
        this._server = socketIO(this.http);
        this._editorManager = _editorManager;

        this._server.on('connection', (client) => {
            console.log("Cliente conectado --> " + client);
        });

        this._isserver = false;
        this._isclient = false;
    }

    public listen():void {
        let _this = this;
        this.http.listen(4040, () => {
            
            _this._server.listen(4044);
            _this._isserver = true;
            _this._editorManager.updateWindowTitle();

            //Send code updates to clients
            setInterval(() => {
                _this._server.emit('codeUpdate', _this._editorManager.getMonaco().getValue());
            }, 1100);
        });
        
    }

    public close(): void {
        this._server.close();
        this._isserver = false;
    }

    public isServer(): boolean {
        return this._isserver;
    }

    public isClient(): boolean {
        return this._isclient;
    }

    public connect():void {
        let _this = this;
        this._client = io('http://localhost:4040');

        //Server connected
        this._client.on('connect', () => {
            _this._editorManager.showDialog('info', 'Você se conectou em uma sessão IDECloud.');
            _this._isclient = true;
            _this._editorManager.updateWindowTitle();
        });

        //Server disconnected
        this._client.on('disconnect', () => {
            _this._editorManager.showDialog('error', 'A sua sessão do IDECloud foi encerrada.');
            _this._isclient = false;
        })
        
        //Code update received 
        this._client.on('codeUpdate', (data: string) => {
            _this._editorManager.getMonaco().setValue(data);
        });
    }

    public disconnect(): void {
        this._client.disconnect();
        this._isclient = false;
    }

}