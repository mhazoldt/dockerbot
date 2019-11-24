const { app, BrowserWindow, ipcMain } = require('electron');
const { startChatbot, disconnectChatbot, returnDockedUsers, joinChat, leaveChat } = require('./chatbot.js');
let config = require('./config/authPage.json');


const authUrl = config.url;

const primaryPageData = {
  window: {
    width: 500,
    height: 680,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false,
    autoHideMenuBar: true,
  },
  path: 'views/primary/index.html',
  devTools: false,
  propName: 'primary',
};

const dockPageData = {
  window: {
    width: 1600,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    useContentSize: true,
    transparent: true,
    hasShadow: false,
    enableLargerThanScreen: true,
    autoHideMenuBar: true,
    // titlebar: 'hidden',
  },
  path: 'views/dock/index.html',
  devTools: false,
  propName: 'dock',
};

const authPageData = {
  window: {
    width: 800,
    height: 680,
    webPreferences: {
      nodeIntegration: false
    },
  },
  path: authUrl,
  devTools: false,
  propName: 'auth',
};


const allWindows = {};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

const windowIsOpen = propName => !!allWindows[propName];

let sendMsgToWindow = (windowName, eventName, msgArg) => {
  allWindows[windowName].webContents.send(eventName, msgArg);
};


function toggleWindow(pageData) {
  if(!windowIsOpen(pageData.propName)) {
    // Create the browser window.
    win = new BrowserWindow(pageData.window)

    // and load the index.html of the app.
    win.loadFile(pageData.path)

    // Open the DevTools.
    if(pageData.devTools) win.webContents.openDevTools()

    allWindows[pageData.propName] = win;

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.

      allWindows[pageData.propName] = null;
    })

    // win.showInactive();
  } else if(windowIsOpen(pageData.propName)) {
    allWindows[pageData.propName].close();
    allWindows[pageData.propName] = null
  }
}

function toggleAuthPage(pageData) {
  if(!windowIsOpen(pageData.propName)) {
    // Create the browser window.
    win = new BrowserWindow(pageData.window)

    // and load the index.html of the app.
    win.loadURL(pageData.path)

    // Open the DevTools.
    if(pageData.devTools) win.webContents.openDevTools()

    allWindows[pageData.propName] = win;

    win.webContents.on('did-redirect-navigation', function(event, url) {
      let selectToken = /access_token=([^&]*)/;
      let match = selectToken.exec(url);

      if(match) {
        let token = 'oauth:' + match[1]
        allWindows['auth'].close();
        sendMsgToWindow('primary', 'msg-primary', {
          type: 'oauth-token',
          data: token,
        });
      }
    })

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.

      allWindows[pageData.propName] = null;
    })
  } else if(windowIsOpen(pageData.propName)) {
    allWindows[pageData.propName].close();
    allWindows[pageData.propName] = null
  }
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => toggleWindow(primaryPageData))

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
  if (win === null) {
    toggleWindow(primaryPageData)
  }
})

ipcMain.on('toggle-dock', function(event, arg) {
  toggleWindow(dockPageData)
  allWindows['primary'].webContents.send('toggle-dock-response', windowIsOpen('dock'));
})

ipcMain.on('start-chatbot', function(event, arg) {
  let textInputs = arg.textInputs
  let opts = {
    identity: {
      username: textInputs.chatbotname,
      password: textInputs.token
    },
    channels: textInputs.channels.split(',').map(channel => channel.trim())
  };

  startChatbot(opts, chatbotMsgHandler);
})

ipcMain.on('disconnect-chatbot', function(event, arg) {
  disconnectChatbot(chatbotMsgHandler)
})

ipcMain.on('open-auth', function(event, msg) {
  toggleAuthPage(authPageData);
})

ipcMain.on('return-docked-users', function(event, msg) {
  returnDockedUsers(msg);
})

ipcMain.on('join-chat', function(event, msg) {
  joinChat(msg);
})

ipcMain.on('leave-chat', function(event, msg) {
  leaveChat(msg);
})

ipcMain.on('msg-main-primary', function(event, msg) {
  sendMsgToWindow('primary', 'msg-primary', msg);
})

ipcMain.on('msg-main-dock', function(event, msg) {
  sendMsgToWindow('dock', 'msg-dock', msg);
})

const chatbotMsgRoutes = {}

chatbotMsgRoutes['new-dock-request'] = (msg) => {
  sendMsgToWindow('primary', 'msg-primary', msg);
}

chatbotMsgRoutes['undock-request'] = (msg) => {
  sendMsgToWindow('primary', 'msg-primary', msg);
}

chatbotMsgRoutes['chatbot-connection-status'] = (msg) => {
  sendMsgToWindow('primary', 'msg-primary', msg);
}

chatbotMsgRoutes['chatbot-could-not-connect'] = (msg) => {
  sendMsgToWindow('primary', 'msg-primary', msg);
}

chatbotMsgRoutes['get-docked-users'] = (msg) => {
  sendMsgToWindow('primary', 'msg-primary', msg);
}

function chatbotMsgHandler(msg) {
  chatbotMsgRoutes[msg.type](msg);
}

// In this file you can include the rest of your app's specific app process
// code. You can also put them in separate files and require them here.