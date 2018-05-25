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
    private _clientList: Array<socketIO.Socket>;

    constructor(_editorManager: EditorManager) {
        let app = require('express')();
        this.http = require('http').Server(app);
        this._clientList = [];
        
        this._server = socketIO(this.http);
        this._editorManager = _editorManager;

        let _class = this;

        this._server.on('connection', (client: socketIO.Socket) => {
            _class._clientList.push(client);
            client.on('disconnect', () => {
                _class._clientList.splice(_class._clientList.indexOf(client), 1);
                _class._editorManager.updateWindowTitle();
            });
            _class._editorManager.updateWindowTitle();
        });

        this._isserver = false;
        this._isclient = false;
    }

    public listen():void {

        this._server.listen(4040);
        this._isserver = true;
        this._editorManager.updateWindowTitle();

        this._editorManager.getMonaco().getModel().onDidChangeContent((event) => {
            
            this._editorManager.getMonaco()
            this._server.emit('codeUpdate', {
                startLine: event.changes[0].range.startLineNumber,
                endLine: event.changes[0].range.endLineNumber,
                startCol: event.changes[0].range.startColumn,
                endCol: event.changes[0].range.endColumn,
                change: event.changes[0].text
            });
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
        let _class: CloudManager = this;
        this._client = io('http://localhost:4040');

        //Server connected
        this._client.on('connect', () => {
            _class._editorManager.showDialog('info', 'Você se conectou em uma sessão IDECloud.');
            _class._isclient = true;
            _class._editorManager.updateWindowTitle();
        });

        //Server disconnected
        this._client.on('disconnect', () => {
            _class._editorManager.showDialog('error', 'A sua sessão do IDECloud foi encerrada.');
            _class._isclient = false;
            _class._editorManager.updateWindowTitle();
        })
        
        //Code update received 
        this._client.on('codeUpdate', (data: any) => {
            this._editorManager.getMonaco().executeEdits("", [{
                range: new monaco.Range(data.startLine, data.startCol, data.endLine, data.endCol),
                text: data.change
            }]);
        });
    }

    public disconnect(): void {
        this._client.disconnect();
        this._isclient = false;
    }

    public getClientList():Array<socketIO.Socket> {
        return this._clientList;
    }

}