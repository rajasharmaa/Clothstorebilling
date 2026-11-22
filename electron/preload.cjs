const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  silentPrint: (htmlOrOptions, deviceName, paperWidth) => {
    if (typeof htmlOrOptions === 'object' && htmlOrOptions !== null) {
      return ipcRenderer.invoke('silent-print', {
        html: htmlOrOptions.html,
        deviceName: htmlOrOptions.deviceName || deviceName || '',
        paperWidth: htmlOrOptions.paperWidth || paperWidth || '80mm',
      });
    }
    return ipcRenderer.invoke('silent-print', {
      html: htmlOrOptions,
      deviceName: deviceName || '',
      paperWidth: paperWidth || '80mm',
    });
  },
});

