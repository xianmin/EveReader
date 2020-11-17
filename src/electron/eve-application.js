import {
  BrowserWindow
} from 'electron';
import ipcServer from './ipc-server';
import eveWindow from './eve-window';

class eveApplication {
  constructor() {
    // Windows reference
    this.windows = [];
    // IPC get & set
    this.ipcServer = new ipcServer(this);
    // Open Epub
    this.open(process.argv);
  }

  // Open Epub in argv if exist, otherwise open a new window
  open(argv) {
    const argvPath = argv.filter((element) => {
      return element.substring(element.length - 5) === '.epub';
    });
    // const argvPath = ["/home/xm20/test.epub"];

    if (argvPath.length > 0) {
      new eveWindow(this, argvPath[0]);
    } else {
      new eveWindow(this, null);
    }
  }

  // trigger
  setWinPath(path, winId) {
    this.windows[winId].path = path;
  }

  getFocusedAbrWindow(winId) {
    winId = winId || BrowserWindow.getFocusedWindow().id;
    return this.windows[winId];
  }
}

export default eveApplication;
