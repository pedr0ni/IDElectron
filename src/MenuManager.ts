/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
import * as fs from 'fs';
import * as electron from 'electron';
import {remote} from 'electron';

const dialog = remote.dialog;

export class MenuManager {

    _editor: monaco.editor.IStandaloneCodeEditor;
    _this = this;

    constructor(_editor: monaco.editor.IStandaloneCodeEditor) {
        this._editor = _editor;
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
                            });
                        }
                    },
                    {
                        label: 'Fechar',
                        click() {
                            _this._editor.setValue("// Bem-vindo ao IDElectron");
                        }
                    },
                    {type: 'separator'},
                    {
                        label: 'Salvar'
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

}