import * as electron from 'electron';
import * as io from 'socket.io-client';
import * as os from 'os';
import {remote} from 'electron';
import { EditorManager } from "./EditorManager";
import * as $ from 'jquery';

export class CloudManager {

    private _client: any;
    private _editorManager: EditorManager;
    private _codeInterval: any;
    private _vex: any;
    private _idecloud: any;

    constructor(_editorManager: EditorManager) {
        this._editorManager = _editorManager;
        this._vex = require('vex-js');
        this._vex.registerPlugin(require('vex-dialog'));
        this._vex.defaultOptions.className = 'vex-theme-os';
        this._idecloud = io.connect('http://localhost:4040');
        this._idecloud.on('connect', () => {
            console.log("[INFO] Connected to IDECloud server.");
        });
    }

    public createSession(namespace: string) {
        this._idecloud.emit('createNamespace', {
            name: namespace
        });

        setTimeout(() => {
            this.startClient(this._editorManager._configManager.getValue('unique_id'));
        }, 1000);
    }

    public connect():void {
        let _class: CloudManager = this;
        this._vex.dialog.open({
            message: 'Sessão IDECloud',
            input: [
                '<input name="uuid" type="text" placeholder="Código do parceiro IDECloud" required />'
            ].join(''),
            buttons: [
                $.extend({}, this._vex.dialog.buttons.YES, { text: 'Conectar' }),
                $.extend({}, this._vex.dialog.buttons.NO, { text: 'Cancelar' })
            ],
            callback: function (data: any) {
                if (data) {
                    _class.startClient(data.uuid);
                }
            }
        });
    }

    public startClient(uuid: string): void {
        console.log("[INFO] Starting client at " + uuid);
        this._client = io('http://localhost:4040/' + uuid);

        //Server connected
        this._client.on('connect', () => {
            this._editorManager.showDialog('info', 'Você se conectou em uma sessão IDECloud.');
            this._editorManager.updateWindowTitle();
        });

        //Server disconnected
        this._client.on('disconnect', () => {
            this._editorManager.showDialog('error', 'A sua sessão do IDECloud foi encerrada.');
            this._editorManager.updateWindowTitle();
        });

        this._client.on('connect_failed', function() {
            this._editorManager.showDialog('error', 'Erro ao conectar-se a sessão IDECloud.');
            this._editorManager.updateWindowTitle();
        });
        
        //Code update received 
        this._client.on('serverCodeUpdate', (data: any) => {
            if (data.from == this._client.id)  return;
            this._editorManager.getMonaco().executeEdits("", [{
                range: new monaco.Range(data.startLine, data.startCol, data.endLine, data.endCol),
                text: data.change
            }]);
        });
        this._editorManager.getMonaco().getModel().onDidChangeContent((event: any) => {
            this._client.emit('clientCodeUpdate', {
                startLine: event.changes[0].range.startLineNumber,
                endLine: event.changes[0].range.endLineNumber,
                startCol: event.changes[0].range.startColumn,
                endCol: event.changes[0].range.endColumn,
                change: event.changes[0].text,
                namespace: uuid
            });
        });
    }

}