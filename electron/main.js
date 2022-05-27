const http = require("http");
const electron = require ('electron')
const axios = require('axios')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
app.on('ready', async _ => {
    win = new BrowserWindow({
    width: 800,
    height: 600,
    })
    const template = [
    ]
    const menu = Menu.buildFromTemplate (template)
    Menu.setApplicationMenu (menu)
    const mode = process.argv0 === 'development' ? 'production' : 'development'
    const port = mode === "development" ? 8080 : 3033;
    while(true) {
        try {
            await axios.get(`http://localhost:${port}`)
            await sleep(500);
            win.loadURL(`http://localhost:${port}`)
            break;
        } catch {
            continue;
        }
    }
});

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

