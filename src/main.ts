import * as electron from 'electron';
import { app, BrowserWindow } from 'electron';
import * as path from "path";
import * as url from "url";

var mainWindow: Electron.BrowserWindow = null;
let loaderWindow: Electron.BrowserWindow;

app.on('window-all-closed', function () {
	if (process.platform != 'darwin') {
		app.quit();
	}
});

app.on('ready', function () {

	mainWindow = new BrowserWindow({ width: 1280, height: 720, icon: path.join(__dirname, '../assets/icon.png'), show: true });

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, "../index.html"),
		protocol: "file:",
		slashes: true
	}));

	mainWindow.on('closed', function () {
		mainWindow = null;
		loaderWindow = null;
	});
});
