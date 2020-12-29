import { ipcMain } from "electron";

class IpcServer {
  constructor(eveApp) {
    this.eveApp = eveApp;

    // Set
    ipcMain.on("get", function (event, key, id, windowId) {
      event.sender.send("get-reply", key, eveApp[key], id, windowId);
    });

    // Get
    ipcMain.on("set", function (event, key, value, id, windowId) {
      eveApp[key] = value;
      event.sender.send("set-reply", key, value, id, windowId);
    });

    /*
        Trigger an eveApp method.
        This method firts parameter 'args' is the arguments object sent by ipcMain-client.
        The second parameter is an optionnal callback that can be added at the end of the method to send back a 'res' variable to ipcMain-client.
    */
    ipcMain.on("trigger", function (event, key, args, id, windowId) {
      if (typeof eveApp[key] !== "function") {
        console.error(key + " is not a valid eveApp method");
      } else {
        eveApp[key](args, windowId, function (res) {
          event.sender.send("trigger-reply", key, res, id, windowId);
        });
      }
    });
  }
}

export default IpcServer;
