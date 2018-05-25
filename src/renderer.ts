/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />
import * as electron from 'electron';
import {remote} from 'electron';
import {EditorManager} from './EditorManager';

const app = remote.app;
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;
const currentWindow = remote.getCurrentWindow();
const Menu = remote.Menu;
const globalShortcut = remote.globalShortcut;


declare var amdRequire: any;
var editor: monaco.editor.IStandaloneCodeEditor;
let editorManager: EditorManager;

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

    editorManager = new EditorManager(remote.app, currentWindow, editor);
    currentWindow.setMenu(Menu.buildFromTemplate(editorManager.getTemplate()));
    currentWindow.show();

    globalShortcut.register('CommandOrControl+N', () => {
        editorManager.resetTemplate();
    });
}
