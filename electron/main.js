const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let server = null;
let PORT = 7890;

// The 'out' directory is always at project_root/out
// When packaged: resources/app/out
// When dev: project_root/out
// __dirname is always electron/ so ../out works for both
const OUT_DIR = path.join(__dirname, '..', 'out');

function startServer() {
  return new Promise((resolve, reject) => {
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.wasm': 'application/wasm',
      '.map': 'application/json',
    };

    server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];

      // If no file extension, serve index.html (SPA)
      if (!path.extname(urlPath)) {
        urlPath = '/index.html';
      }

      const filePath = path.join(OUT_DIR, urlPath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // Fallback to index.html
          fs.readFile(path.join(OUT_DIR, 'index.html'), (err2, fallback) => {
            if (err2) {
              res.writeHead(404);
              res.end('Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(fallback);
            }
          });
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
          });
          res.end(data);
        }
      });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port taken, try random
        server.listen(0, '127.0.0.1', () => {
          PORT = server.address().port;
          console.log(`[Эфирная Сага] Fallback port: ${PORT}`);
          resolve();
        });
      } else {
        reject(err);
      }
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[Эфирная Сага] Game server ready → http://127.0.0.1:${PORT}`);
      resolve();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'Эфирная Сага — Aetherial Saga',
    backgroundColor: '#0a0015',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webgl: true,
      // Performance
      backgroundThrottling: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Show window once content is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links (open in system browser)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

async function main() {
  // Single instance lock
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Эфирная Сага',
      message: 'Игра уже запущена!',
      buttons: ['OK'],
    });
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  await app.whenReady();

  try {
    await startServer();
  } catch (err) {
    dialog.showErrorBox(
      'Ошибка запуска сервера',
      `Не удалось запустить внутренний сервер:\n${err.message}`
    );
    app.quit();
    return;
  }

  createWindow();

  app.on('window-all-closed', () => {
    cleanup();
    app.quit();
  });

  app.on('before-quit', cleanup);
  app.on('activate', () => {
    if (!mainWindow) createWindow();
  });
}

function cleanup() {
  if (server) {
    server.close();
    server = null;
  }
}

process.on('uncaughtException', (err) => {
  console.error('[ERROR]', err);
  cleanup();
  app.quit();
});

main().catch((err) => {
  console.error('[FATAL]', err);
  cleanup();
  app.quit();
});