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
        let isNew = this.checkConfig();
        fs.readFile(this._dir, 'utf-8', (err, data) => {
            if (err) {
                this._editorManager.showDialog('error', 'Ocorreu um erro ao abrir o arquivo de config.');
                throw err;
            }
            this._fileJSON = JSON.parse(data);
            if (isNew) {
                this.addValue('unique_id', this.randomUUID());
                this.saveConfig();
            }
            if (this.getValue('currentFile') != null) {
                // Ler arquivo
                fs.readFile(this.getValue('currentFile'), 'utf-8', (err, data) => {
                    if (err) {
                        this._editorManager.resetTemplate();
                        return;
                    }
                    this._editorManager.getMonaco().setValue(data);
                    this._editorManager._currentFilePath = this.getValue('currentFile');
                    this._editorManager.updateWindowTitle();
                });
            }
            console.log("[INFO] Config file loaded.");
        });
    }

    public getValue(key: string): string {
        return this._fileJSON[key];
    }

    public addValue(key: string, value: string): void {
        this._fileJSON[key] = value;
    }

    public saveConfig(): void {
        fs.writeFile(this._dir, JSON.stringify(this._fileJSON), (err) => {
            if (err) {
                this._editorManager.showDialog('error', 'Ocorreu um erro ao salvar o arquivo de config.');
                throw err;
            }
            console.log("[INFO] Config file saved.");
        });
    }

    public checkConfig(): boolean {
        if (!fs.existsSync(this._dir)) {
            fs.writeFileSync(this._dir, '{}');
            return true;
        }

        return false;
    }

    private randomUUID():string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

}