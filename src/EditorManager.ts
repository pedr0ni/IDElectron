/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';
import {remote} from 'electron';

const dialog = remote.dialog;

export class EditorManager {

    _editor: monaco.editor.IStandaloneCodeEditor;
    _app: electron.App;
    _currentFile: string;
    _desktopPath: string;

    constructor(_app: electron.App, _editor: monaco.editor.IStandaloneCodeEditor) {
        this._editor = _editor;
        this._app = _app;
        this._desktopPath = path.resolve(_app.getPath('desktop'));
    }

    resetTemplate() {
        this._editor.setValue("#include <stdio.h>\n#include <stdlib.h>\n \nint main() {\n\n\n    \n    return 0;\n}");
        this._editor.setPosition({column: 4, lineNumber: 6});
    }

    getTemplate() {
        
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
                                _this._currentFile = path[0];
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
                            _this.saveFile();
                        }
                    },
                    {
                        label: 'Salvar como'
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

    saveFile() {

        if (this._currentFile == null) {
            //Abrir dialog
            let path = dialog.showSaveDialog({
               defaultPath: this._desktopPath
            });

            console.log(path[0]);
        }
    }

    forceSave() {

    }

}