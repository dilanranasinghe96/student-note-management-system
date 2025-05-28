const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Mock database for testing
class MockDatabase {
  constructor() {
    console.log('Using MockDatabase - no data will be saved!');
  }
  
  exec() { return null; }
  prepare() { 
    return {
      get: () => ({}),
      all: () => [],
      run: () => ({ lastInsertRowid: 0 })
    };
  }
  close() {}
}

// Create mock database
const db = new MockDatabase();

// Register minimal IPC handlers
ipcMain.handle('login-user', (event, credentials) => {
  console.log('Login attempt:', credentials);
  return { id: 1, username: 'test_user' };
});

ipcMain.handle('register-user', (event, userData) => {
  console.log('Register attempt:', userData);
  return { id: 1, username: userData.username };
});

ipcMain.handle('get-subjects', () => {
  return [
    { id: 1, name: 'Mathematics', color: '#2196f3' },
    { id: 2, name: 'Computer Science', color: '#ff9800' }
  ];
});

ipcMain.handle('add-subject', (event, subject) => {
  // In a real app, this would add to the database
  // For now, we'll just return a mock response
  const newSubject = {
    id: Math.floor(Math.random() * 1000) + 3, // Generate random ID
    name: subject.name,
    color: subject.color
  };
  return newSubject;
});

ipcMain.handle('get-tags', () => {
  return [
    { id: 1, name: 'important', color: '#f44336' },
    { id: 2, name: 'homework', color: '#ff9800' }
  ];
});

// Create a window when Electron is ready
app.whenReady().then(() => {
  console.log('Creating application window');
  
  // Create a window with your settings
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    show: true // Show immediately for debugging
  });

  // Load your index.html
  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log('Loading index.html from:', indexPath);
  console.log('File exists:', fs.existsSync(indexPath));
  
  const bundlePath = path.join(__dirname, 'public', 'bundle.js');
  console.log('Looking for bundle at:', bundlePath);
  console.log('Bundle exists:', fs.existsSync(bundlePath));
  
  // Load the app directly
  mainWindow.loadFile(indexPath)
    .then(() => {
      console.log('Application loaded successfully');
    })
    .catch(err => {
      console.error('Failed to load application:', err);
      
      // Show error details
      mainWindow.loadURL(`data:text/html,
        <html>
          <body>
            <h1>Failed to load application</h1>
            <pre>${err.toString()}</pre>
            <pre>indexPath: ${indexPath}\nExists: ${fs.existsSync(indexPath)}</pre>
            <pre>bundlePath: ${bundlePath}\nExists: ${fs.existsSync(bundlePath)}</pre>
          </body>
        </html>
      `);
    });
    
  mainWindow.on('closed', () => {
    console.log('Application window closed');
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// Print out any uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
}); 