/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';
import { remote } from 'electron';
import { CloudManager } from './CloudManager';

const dialog = remote.dialog;

export class EditorManager {

    private _editor: monaco.editor.IStandaloneCodeEditor;
    private _app: electron.App;
    private _currentWindow: electron.BrowserWindow;
    public _currentFilePath: string;
    private _desktopPath: string;
    private _cloudManager: CloudManager;
    public _currentMenu: electron.Menu;

    constructor(_app: electron.App, _currentWindow: electron.BrowserWindow, _editor: monaco.editor.IStandaloneCodeEditor) {
        this._editor = _editor;
        this._app = _app;
        this._currentWindow = _currentWindow;
        this._desktopPath = path.resolve(_app.getPath('desktop'));
        this._cloudManager = new CloudManager(this);
    }

    public resetTemplate(): void {
        this._editor.setValue("#include <stdio.h>\n#include <stdlib.h>\n \nint main() {\n\n\n    \n    return 0;\n}");
        this._editor.setPosition({column: 4, lineNumber: 6});
        this._currentFilePath = null;
    }

    public getTemplate(): Array<any> {
        
        let template: Array<any>;
        let _this = this;

        template = [
            {
                label: 'Arquivo',
                submenu: [
                    {
                        label: 'Abrir',
                        click() {
                            let path = dialog.showOpenDialog({
                                properties: [
                                    'openFile'
                                ],
                                filters: [

                                    { name: 'Linguagem C', extensions: ['c'] }
                                 
                                ]
                            });
                            
                            fs.readFile(path[0], 'utf-8', (err, data) => {
                                if (err) throw err;
                                _this._editor.setValue(data);
                                _this._currentFilePath = path[0];
                                _this.updateWindowTitle();
                            });
                        }
                    },
                    {
                        label: 'Fechar',
                        click() {
                            _this.resetTemplate();
                        }
                    },
                    {
                        label: 'Novo',
                        accelerator: 'CmdOrCtrl+N',
                        click() {
                            _this.resetTemplate();
                        }
                    },
                    {type: 'separator'},
                    {
                        label: 'Salvar',
                        click() {
                            _this.saveFile(false);
                        }
                    },
                    {
                        label: 'Salvar como',
                        click() {
                            _this.saveFile(true);
                        }
                    }
                ]
            },
            {
                id: 'teste',
                label: 'IDECloud',
                submenu: [
                    {
                        label: 'Iniciar Sessão',
                        click() {
                            if (_this._cloudManager.isClient()) {
                                _this.showDialog('error', 'VOcê já é cliente de uma sessão. Saia para hostear uma sessão IDECloud.');
                                return;
                            }
                            if (_this._cloudManager.isServer()) {
                                _this.showDialog('error', 'Você já está em uma sessão da IDECloud.');
                                return;
                            }
                            _this._cloudManager.listen();
                            _this.showDialog('info', 'Você iniciou uma sessão no IDECloud :)');
                        }
                    },
                    {
                        label: 'Encerrar Sessão',
                        click() {
                            if (!_this._cloudManager.isServer()) {
                                _this.showDialog('error', 'Você não iniciou uma sessão do IDECloud.');
                                return;
                            }
                            _this._cloudManager.close();
                            _this.showDialog('warning', 'Sua sessão no IDECloud foi encerrada.');
                            _this.updateWindowTitle();
                        }
                    },
                    {type: 'separator'},
                    {
                        label: 'Entrar na Sessão',
                        click() {
                            if (_this._cloudManager.isServer()) {
                                _this.showDialog('error', 'Você já é o host de uma sessão. Saia para entrar em outra sessão IDECloud.');
                                return;
                            }
                            if (_this._cloudManager.isClient()) {
                                _this.showDialog('error', 'Você já está em uma sessão IDECloud.');
                                return;
                            }
                            _this._cloudManager.connect();
                        }
                    },
                    {
                        label: 'Sair da Sessão',
                        click() {
                            if (!_this._cloudManager.isClient()) {
                                _this.showDialog('error', 'Você não está em nenhuma sessão IDECloud.');
                                return;
                            }
                            _this._cloudManager.disconnect();

                        }
                    },
                    {type: 'separator'},
                    {
                        label: 'Status da Sessão',
                        click() {
                            
                        }
                    }
                ]
            },
            {
                label: 'Desenvolvedores',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {role: 'toggledevtools'},
                    {type: 'separator'},
                    {role: 'resetzoom'},
                    {role: 'zoomin'},
                    {role: 'zoomout'},
                    {type: 'separator'},
                    {role: 'togglefullscreen'}
                ]
            }
        ];

        return template;
    }

    public saveFile(as: boolean): void {

        if (this._currentFilePath == null || as) {

            this._currentFilePath = dialog.showSaveDialog({
               defaultPath: this._desktopPath,
               filters: [
                    { name: 'Linguagem C', extensions: ['c'] }
                ]
            });
            
        }

        let _this = this;
        fs.writeFile(this._currentFilePath, this._editor.getValue(), (err) => {
            if (err) {
                _this.showDialog('error', 'Ocorreu um erro ao salvar o arquivo.');
                throw err;
            }
            //File saved :)
        });
    }

    public updateWindowTitle(): void {
        let path: string;
        if (this._currentFilePath == null) {
            path = "Novo Arquivo";
        }
        if (this._cloudManager.isServer()) {
            this._currentWindow.setTitle("IDElectron - " + path + " - Sessão IDECloud (Servidor ["+this._cloudManager.getClientList().length+" clientes])");
        } else if (this._cloudManager.isClient()) {
            this._currentWindow.setTitle("IDElectron - " + path + " - Sessão IDECloud (Cliente)");
        } else {
            this._currentWindow.setTitle("IDElectron - " + path);
        }
        
    }

    public showDialog(_type: string, _message: string):void {
        dialog.showMessageBox(this._currentWindow, {
            type: _type,
            message: _message,
            title: 'IDElectron - IDECloud'
        });
    }

    public getMonaco():monaco.editor.IStandaloneCodeEditor {
        return this._editor;
    }

    public getApp():electron.App {
        return this._app;
    }

}