'use strict'

import { app, protocol, BrowserWindow, session } from 'electron';
import eveApplication from './electron/eve-application';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

var eveApp = null;

function init() {
  eveApp = new eveApplication();
}


// Check app is single instance
app.requestSingleInstanceLock() || app.quit();
app.on("second-instance", (event, argv, cwd) => {
  process.chdir(cwd);
  if (eveApp == null) {
    console.error("Error when trying to reach primary Eve-Reader instance");
    app.quit();
    return false;
  }
  eveApp.open(argv);
  return true;
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      const vueExtension = process.cwd() +
        '/vue-devtools-5.3.3-Chrome-extension'
      await session.defaultSession.loadExtension(vueExtension)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  await init();
})


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.releaseSingleInstanceLock();
    app.quit()
  }
})


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) init();
})

// OSX open-file
app.on("open-file", function(event, path) {
  event.preventDefault();
  if (eveApp) {
    eveApp.open(path);
  } else {
    let osxOpenFilePaths = [path];
    init();
    eveApp.open(osxOpenFilePaths);
  }
});


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
