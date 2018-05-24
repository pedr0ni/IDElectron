/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
import * as electron from 'electron';
import {remote} from 'electron';
import {MenuManager} from './MenuManager';

const app = remote.app;
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;
const currentWindow = remote.getCurrentWindow();
const Menu = remote.Menu;


declare var amdRequire: any;
var editor: monaco.editor.IStandaloneCodeEditor;
let menuManager: MenuManager;

amdRequire(['vs/editor/editor.main'], () => {
    onModuleLoaded();
});

function onModuleLoaded() {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: [
            '// Bem-vindo ao IDElectron :)'
        ].join('\n'),
        language: 'c',
        automaticLayout: true,
        theme: "vs-dark"
    });

    menuManager = new MenuManager(editor);
    currentWindow.setMenu(Menu.buildFromTemplate(menuManager.getTemplate()));
    currentWindow.show();
}
