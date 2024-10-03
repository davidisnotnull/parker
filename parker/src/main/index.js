import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

const path = require('path');
const express = require('express');
const axios = require('axios');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    //autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Start the Express server
  startExpressServer();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Function to start the Express server
function startExpressServer() {
  const expressApp = express();
  const port = 3000; // Choose a port for your proxy server

  // Enable CORS for all routes (adjust as needed)
  expressApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Adjust to your needs
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // Proxy endpoint
  expressApp.get('/proxy', async (req, res) => {
    try {
      const targetUrl = req.query.url; // Get the target URL from the query parameter

      if (!targetUrl) {
        return res.status(400).send('No target URL specified.');
      }

      // Make the request to the target URL
      const response = await axios.get(targetUrl);
      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.toString());
    }
  });

  // Start the Express server
  expressApp.listen(port, () => {
    console.log(`Express proxy server is running on port ${port}`);
  });
}

ipcMain.handle('fetch-via-proxy', async (event, url) => {
  try {
    const response = await axios.get(`http://localhost:3000/proxy`, {
      params: { url },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
});