/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';
import {remote} from 'electron';

const dialog = remote.dialog;

export class EditorManager {

    private _editor: monaco.editor.IStandaloneCodeEditor;
    private _app: electron.App;
    private _currentWindow: electron.BrowserWindow;
    public _currentFilePath: string;
    private _desktopPath: string;

    constructor(_app: electron.App, _currentWindow: electron.BrowserWindow, _editor: monaco.editor.IStandaloneCodeEditor) {
        this._editor = _editor;
        this._app = _app;
        this._currentWindow = _currentWindow;
        this._desktopPath = path.resolve(_app.getPath('desktop'));
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

        fs.writeFile(this._currentFilePath, this._editor.getValue(), (err) => {
            if (err) throw err;
            
        });
    }

    public updateWindowTitle(): void {
        this._currentWindow.setTitle("IDElectron - " + this._currentFilePath);
    }

}