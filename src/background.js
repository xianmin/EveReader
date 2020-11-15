'use strict'

import { app, protocol, BrowserWindow, session } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import fs from 'fs';
import windowStateKeeper from 'electron-window-state';

const isDevelopment = process.env.NODE_ENV !== 'production'

// a set of windows
const windowSet = new Set();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


async function createWindow() {
  // Load the previous state with fallback to defaults
  const mainWindowState = windowStateKeeper({
    width: 800,
    height: 600,
  })

  let newWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    // icon: evePath.icon,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(newWindow);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await newWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) newWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await newWindow.loadURL('app://./index.html')
  }

  // newWindow.once('ready-to-show', () => {
  //   newWindow.show();
  // });

  windowSet.add(newWindow);

  newWindow.on('closed', () => {
    windowSet.delete(newWindow);
    newWindow = null;
  });

  const argvPath = process.argv.filter((element) => {
    return element.substring(element.length - 5) === '.epub';
  });
  // const argvPath = ["/home/xm20/test.epub"];

  if (argvPath.length > 0) {
    let filePath = argvPath[0];
    let fileName = path.basename(filePath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(err);
      }
      newWindow.webContents.send('IPC::FILE-OPEN', data, fileName);
    });
  }
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      const vueExtension = process.cwd() + '/vue-devtools-5.3.3-Chrome-extension'
      await session.defaultSession.loadExtension(vueExtension)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
