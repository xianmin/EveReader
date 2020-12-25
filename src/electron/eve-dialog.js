import {
  dialog,
} from 'electron';


class eveDialog { 
  constructor(eveApp) {
    this.eveApp = eveApp;
  }

  askOpenFile() {
    let win = this.eveApp.getFocusedWindow();

    dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{
        name: 'Epub',
        extensions: ['epub'],
      }],
    }).then( result => {
      if (!result.canceled) {
        let epubPath = result.filePaths[0];
        win.openFileFromDialog(epubPath);
      } else {
        console.log("no file selected");
      }
    });
  }
}

export default eveDialog;
