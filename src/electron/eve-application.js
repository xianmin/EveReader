import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import ipcServer from './ipc-server';
import eveWindow from './eve-window';
import eveDialog from './eve-dialog';

class eveApplication {
  constructor() {
    // Windows reference
    this.windows = [];
    // IPC get & set
    this.ipcServer = new ipcServer(this);

    this.dialog = new eveDialog(this);
    // Open Epub
    this.open(process.argv);

    this.initIpcMain();
  }

  // Open Epub in argv if exist, otherwise open a new window
  open(argv) {
    const argvPath = argv.filter((element) => {
      return element.substring(element.length - 5) === '.epub';
    });

    if (argvPath.length > 0) {
      new eveWindow(this, argvPath[0]);
    } else {
      new eveWindow(this, null);
    }
  }

  initIpcMain() {
    ipcMain.on('IPC::ASK-OPEN-FILE', () => {
      this.dialog.askOpenFile();
    });
  }

  // trigger
  setWinPath(winId, epubPath) {
    this.windows[winId].epubPath = epubPath;
  }

  getFocusedWindow(winId) {
    winId = winId || BrowserWindow.getFocusedWindow().id;
    return this.windows[winId];
  }
}

export default eveApplication;
