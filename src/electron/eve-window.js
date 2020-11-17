import { BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import windowStateKeeper from 'electron-window-state';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

function alreadyOpen(eveApp, epubPath) {
  if (!epubPath || !eveApp) {
    return;
  }
  var windows = eveApp.windows;
  for (var i = 0; i < windows.length; i++) {
    if (!windows[i]) continue;
    if (windows[i].epubPath === epubPath) {
      return windows[i];
    }
  }
  return false;
}

class eveWindow {
  constructor(eveApp, epubPath) {
    this.eveApp = eveApp;

    if (epubPath) {
      this.epubPath = epubPath;
      // Check if the called Epub is already open
      var epubWin = alreadyOpen(eveApp, epubPath);
      if (epubWin && epubWin.browserWindow) {
        epubWin.browserWindow.show();
        return;
      }
    }

    this.open();
  }

  // Send and exec a command in window
  execCommand(command, parameters) {
    this.browserWindow.webContents.send("command", command, parameters);
  }

  // Open a new window
  async open() {
    // Create and open window
    const mainWindowState = windowStateKeeper({
        // path: constants.path.userData,
        defaultWidth: 800,
        defaultHeight: 600
    });
    
    let win = new BrowserWindow({
      title: "Eve Reader",
      // icon: constants.path.icon,
      minWidth: 100,
      minHeight: 100,
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      useContentSize: true,
      autoHideMenuBar: true,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        // webviewTag: true
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    mainWindowState.manage(win);

    // Register window in eveWin
    this.browserWindow = win;
    this.id = win.id;

    // Register this in eveApp
    this.eveApp.windows[win.id] = this;

    // Prepare startup commands
    // var execStartupCommands = function() {
      // var startupCommands = abrWin.config.get("startup-commands");
      // for (var cmdName in startupCommands) {
      //   if (startupCommands[cmdName]) {
      //     this.execCommand(cmdName);
      //   }
      // }
    // };

    // Set event handlers
    // win.webContents.on("dom-ready", function() {
    //   execStartupCommands();
    //   win.show(); // NOTE: win.show() and win.focus() seems to be broken in Linux
    // });

    // win.on("focus", function() {
    //   eveWin.menu.attach();
    // });

    // win.on("close", function(e) {
    //   e.preventDefault() // Prevents the window from closing
    //   eveWin.execCommand("closeWindow");
    // });

    win.on("closed", () => {
      // Destroy the window
      this.eveApp.windows[this.id] = null;
      win = null;
    });

    // Load window
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      await win.loadURL('app://./index.html')
    }

    if (this.epubPath) {
      let fileName = path.basename(this.epubPath);
      fs.readFile(this.epubPath, (err, data) => {
        if (err) {
          console.log(err);
        }
        win.webContents.send('IPC::FILE-OPEN', data, fileName);
      });
    }

    // Open devtools on startup when --debug flag is used
    // if (this.config.get("debug")) {
    //   win.openDevTools();
    // }
  }
}

export default eveWindow;
