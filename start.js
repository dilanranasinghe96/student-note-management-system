const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Student Note Manager...');

// Check if bundle.js exists
const bundlePath = path.join(__dirname, 'public', 'bundle.js');
if (!fs.existsSync(bundlePath)) {
  console.log('Bundle not found. Building the application first...');
  
  // Run webpack
  const webpack = spawn('npx', ['webpack', '--mode', 'development'], {
    stdio: 'inherit',
    shell: true
  });
  
  webpack.on('close', (code) => {
    if (code !== 0) {
      console.error(`Webpack process exited with code ${code}`);
      process.exit(code);
    }
    
    startElectron();
  });
} else {
  startElectron();
}

function startElectron() {
  console.log('Starting Electron application...');
  
  // Run electron
  const electron = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  electron.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
  });
} 