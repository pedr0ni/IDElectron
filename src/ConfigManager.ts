import * as fs from 'fs';
import * as path from 'path';
import { EditorManager } from "./EditorManager";

export class ConfigManager {

    private _editorManager: EditorManager;
    private _fileJSON: any;
    private _dir: string;

    constructor(_editorManager: EditorManager) {
        this._editorManager = _editorManager;
        this._dir = path.join(__dirname, '../assets/config.json');
        fs.readFile(this._dir, 'utf-8', (err, data) => {
            if (err) {
                this._editorManager.showDialog('error', 'Ocorreu um erro ao abrir o arquivo de config.');
                throw err;
            }
            this._fileJSON = JSON.parse(data);
            console.log("[INFO] Config file loaded.");
        });
    }

    private getValue(key: string): string {
        return this._fileJSON[key];
    }

    private addValue(key: string, value:string): void {
        this._fileJSON[key] = value;
    }

    public saveConfig(): void {
        fs.writeFile(this._dir, this._fileJSON.stringfy(), (err) => {
            if (err) {
                this._editorManager.showDialog('error', 'Ocorreu um erro ao salvar o arquivo de config.');
                throw err;
            }
            console.log("[INFO] Config file saved.");
        });
    }

}