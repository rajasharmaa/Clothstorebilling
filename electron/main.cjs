const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    title: "TARA COLLECTION - Retail POS & Stock Management",
    width: Math.min(width, 1400),
    height: Math.min(height, 900),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    autoHideMenuBar: true,
  });

  // Always maximize for POS usage
  mainWindow.maximize();

  if (isDev) {
    // Port 8080 as seen in previous status output
    mainWindow.loadURL('http://localhost:8080');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Printer list IPC
ipcMain.handle('get-printers', async () => {
  return await mainWindow.webContents.getPrintersAsync();
});

// Silent print IPC
ipcMain.handle('silent-print', async (event, payload, maybeDeviceName, maybePaperWidth) => {
  let html = '';
  let deviceName = '';
  let paperWidth = '80mm';

  if (typeof payload === 'string') {
    html = payload;
    deviceName = maybeDeviceName || '';
    paperWidth = maybePaperWidth || '80mm';
  } else if (payload && typeof payload === 'object') {
    if (typeof payload.html === 'object' && payload.html !== null) {
      html = payload.html.html || '';
      deviceName = payload.html.deviceName || payload.deviceName || '';
      paperWidth = payload.html.paperWidth || payload.paperWidth || '80mm';
    } else {
      html = payload.html || '';
      deviceName = payload.deviceName || '';
      paperWidth = payload.paperWidth || '80mm';
    }
  }

  if (typeof html !== 'string') {
    html = String(html || '');
  }

  console.log(`[Silent Print] Request received for printer: ${deviceName || 'Default'}, Paper: ${paperWidth}`);
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  try {
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    return new Promise((resolve) => {
      // Small delay to ensure styles are applied
      setTimeout(() => {
        const isA4 = paperWidth === 'A4';
        const is58 = paperWidth === '58mm';
        const printOptions = {
          silent: true,
          printBackground: true,
          color: false,
          margin: {
            marginType: 'none'
          },
          ...(isA4
            ? { pageSize: 'A4' }
            : {
                pageSize: {
                  width: is58 ? 58000 : 80000,
                  height: 300000 // Increased height for longer receipts
                }
              })
        };

        if (deviceName && deviceName.trim()) {
          printOptions.deviceName = deviceName.trim();
        }

        printWindow.webContents.print(printOptions, (success, failureReason) => {
          console.log(`[Silent Print] Result: ${success ? 'Success' : 'Failed'}. Reason: ${failureReason || 'None'}`);
          printWindow.close();
          if (!success) resolve({ success: false, error: failureReason });
          else resolve({ success: true });
        });
      }, 500); // 500ms delay
    });
  } catch (error) {
    console.error(`[Silent Print] Error during preparation:`, error);
    printWindow.close();
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
