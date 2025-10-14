const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let appWindow;

function createWindow() {
  appWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowServiceWorkers: true,
      sandbox: false,
    },
  });

  const indexPath = path.join(__dirname, 'dist/mu-bar-sheet/browser/index.html');

  if (process.env.NODE_ENV === 'development') {
    // Load from Angular dev server in development
    appWindow.loadURL('http://localhost:4200')
      .then(() => console.log('[Main] Loaded dev server'))
      .catch((err) => console.error('[Main] Error loading dev server:', err));
  } else {
    // Load index.html from dist folder in production
    appWindow.loadFile(indexPath)
      .then(() => console.log('[Main] index.html loaded successfully'))
      .catch((err) => console.error('[Main] Error loading index.html:', err));
  }

  // Open DevTools for debugging in development (optional, remove in production if not needed)
  if (process.env.NODE_ENV === 'development') {
    appWindow.webContents.openDevTools();
  }

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  // Handle failed loads (e.g., on reload) to prevent blank screen
  appWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('[Main] Failed to load:', errorDescription, 'Retrying...');
    appWindow.loadFile(indexPath)
      .then(() => console.log('[Main] Retried loading index.html successfully'))
      .catch((err) => console.error('[Main] Retry failed:', err));
  });
}

app.whenReady().then(() => {
  session.defaultSession.clearStorageData({ storages: ['permissions'] }).then(() => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
