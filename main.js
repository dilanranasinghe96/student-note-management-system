const { app, BrowserWindow, ipcMain, crashReporter } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable crash reporter to prevent crashpad_client_win.cc not connected errors
crashReporter.start({ submitURL: '', uploadToServer: false });

// Use mock data since we removed sqlite dependency
let dbLoaded = false;
let mockData = true;

console.log('Using mock data for this application - no data will be persisted!');

// Create database folder if it doesn't exist
const userDataPath = app.getPath('userData');
const dbFolder = path.join(userDataPath, 'database');
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

// Database path
const dbPath = path.join(dbFolder, 'studentnotes.db');

// Always use mock data
console.log('Setting up mock data handlers');
setupMockHandlers();

// Initialize database tables
function initDatabase() {
  // Users table
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Subjects table
  db.exec(`CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Notes table
  db.exec(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    subject_id INTEGER,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Tags table
  db.exec(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Note_tags junction table
  db.exec(`CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
  )`);

  // Assignments table
  db.exec(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN DEFAULT 0,
    subject_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (subject_id) REFERENCES subjects (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Exams table
  db.exec(`CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    exam_date DATE,
    progress INTEGER DEFAULT 0,
    subject_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (subject_id) REFERENCES subjects (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  // Check if subjects exist
  const subjectCount = db.prepare('SELECT COUNT(*) as count FROM subjects').get();
  
  // Insert default subjects if none exist
  if (subjectCount.count === 0) {
    const defaultSubjects = [
      { name: 'Psychology', color: '#9c27b0' },
      { name: 'Mathematics', color: '#2196f3' },
      { name: 'Literature', color: '#673ab7' },
      { name: 'Computer Science', color: '#ff9800' },
      { name: 'History', color: '#e91e63' }
    ];
    
    const insertSubject = db.prepare('INSERT INTO subjects (name, color, user_id) VALUES (?, ?, ?)');
    
    defaultSubjects.forEach(subject => {
      insertSubject.run([subject.name, subject.color, null]);
    });
    
    console.log('Default subjects added');
  }
  
  // Check if tags exist
  const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get();
  
  // Insert default tags if none exist
  if (tagCount.count === 0) {
    const defaultTags = [
      { name: 'important', color: '#f44336' },
      { name: 'homework', color: '#ff9800' },
      { name: 'research', color: '#2196f3' },
      { name: 'lecture', color: '#4caf50' },
      { name: 'exam prep', color: '#9c27b0' }
    ];
    
    const insertTag = db.prepare('INSERT INTO tags (name, color, user_id) VALUES (?, ?, ?)');
    
    defaultTags.forEach(tag => {
      insertTag.run([tag.name, tag.color, null]);
    });
    
    console.log('Default tags added');
  }
}

// Setup mock handlers when real database isn't available
function setupMockHandlers() {
  // Mock data
  const mockUsers = [
    { id: 1, username: 'test_user', password: 'password' },
    { id: 2, username: 'dilan', password: '123456' }
  ];
  
  const mockSubjects = [
    { id: 1, name: 'Mathematics', color: '#2196f3', user_id: 1 },
    { id: 2, name: 'Computer Science', color: '#ff9800', user_id: 1 },
    { id: 3, name: 'Physics', color: '#4caf50', user_id: 1 },
    { id: 4, name: 'Literature', color: '#9c27b0', user_id: 1 }
  ];
  
  const mockTags = [
    { id: 1, name: 'important', color: '#f44336', user_id: 1 },
    { id: 2, name: 'homework', color: '#ff9800', user_id: 1 },
    { id: 3, name: 'research', color: '#2196f3', user_id: 1 },
    { id: 4, name: 'exam prep', color: '#9c27b0', user_id: 1 }
  ];
  
  const mockNotes = [
    { 
      id: 1, 
      title: 'Introduction to Algebra', 
      content: 'This is a sample note about algebra', 
      subject_id: 1, 
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [1, 2]
    },
    { 
      id: 2, 
      title: 'Data Structures', 
      content: 'Notes about arrays, lists, and trees', 
      subject_id: 2, 
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [2, 3]
    }
  ];
  
  const mockAssignments = [
    {
      id: 1,
      title: 'Calculus Homework',
      description: 'Problems from Chapter 5',
      due_date: '2023-07-15',
      is_completed: 0,
      subject_id: 1,
      user_id: 1
    },
    {
      id: 2,
      title: 'Programming Project',
      description: 'Build a simple app',
      due_date: '2023-07-20',
      is_completed: 0,
      subject_id: 2,
      user_id: 1
    }
  ];
  
  const mockExams = [
    {
      id: 1,
      title: 'Midterm Exam',
      description: 'Covers chapters 1-5',
      exam_date: '2023-08-10',
      progress: 30,
      subject_id: 1,
      user_id: 1
    },
    {
      id: 2,
      title: 'Final Project',
      description: 'Demo of semester project',
      exam_date: '2023-08-20',
      progress: 50,
      subject_id: 2,
      user_id: 1
    }
  ];

  // User handlers
  ipcMain.handle('register-user', (event, userData) => {
    console.log('Register attempt:', userData);
    const newId = mockUsers.length + 1;
    const newUser = { id: newId, username: userData.username, password: userData.password };
    mockUsers.push(newUser);
    return { id: newId, username: userData.username };
  });

  ipcMain.handle('login-user', (event, credentials) => {
    console.log('Login attempt:', credentials);
    const user = mockUsers.find(u => 
      u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      return { id: user.id, username: user.username };
    } else {
      throw new Error('Invalid credentials');
    }
  });

  // Subject handlers
  ipcMain.handle('get-subjects', (event, userId) => {
    return mockSubjects;
  });

  ipcMain.handle('add-subject', (event, data) => {
    const newId = mockSubjects.length + 1;
    const newSubject = { 
      id: newId, 
      name: data.name, 
      color: data.color, 
      user_id: data.userId 
    };
    mockSubjects.push(newSubject);
    return newSubject;
  });

  ipcMain.handle('update-subject', (event, data) => {
    const index = mockSubjects.findIndex(s => s.id === data.id);
    if (index !== -1) {
      mockSubjects[index] = { ...mockSubjects[index], ...data };
      return mockSubjects[index];
    }
    throw new Error('Subject not found');
  });

  ipcMain.handle('delete-subject', (event, id) => {
    const index = mockSubjects.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSubjects.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  });

  // Note handlers
  ipcMain.handle('get-notes', (event, data) => {
    let notes = [...mockNotes];
    
    if (data.userId) {
      notes = notes.filter(note => note.user_id === data.userId);
    }
    
    if (data.subjectId) {
      notes = notes.filter(note => note.subject_id === data.subjectId);
    }
    
    return notes.map(note => ({
      ...note,
      tags: note.tags.map(tagId => {
        const tag = mockTags.find(t => t.id === tagId);
        return tag || null;
      }).filter(Boolean)
    }));
  });

  ipcMain.handle('get-note', (event, noteId) => {
    const note = mockNotes.find(n => n.id === noteId);
    if (!note) {
      throw new Error('Note not found');
    }
    
    return {
      ...note,
      tags: note.tags.map(tagId => {
        const tag = mockTags.find(t => t.id === tagId);
        return tag || null;
      }).filter(Boolean)
    };
  });

  ipcMain.handle('add-note', (event, data) => {
    const newId = mockNotes.length + 1;
    const newNote = {
      id: newId,
      title: data.title,
      content: data.content,
      subject_id: data.subjectId,
      user_id: data.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: data.tags || []
    };
    mockNotes.push(newNote);
    return newNote;
  });

  ipcMain.handle('update-note', (event, data) => {
    const index = mockNotes.findIndex(n => n.id === data.id);
    if (index !== -1) {
      mockNotes[index] = {
        ...mockNotes[index],
        title: data.title,
        content: data.content,
        subject_id: data.subjectId,
        updated_at: new Date().toISOString(),
        tags: data.tags || mockNotes[index].tags
      };
      return mockNotes[index];
    }
    throw new Error('Note not found');
  });

  ipcMain.handle('delete-note', (event, id) => {
    const index = mockNotes.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotes.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  });

  // Tag handlers
  ipcMain.handle('get-tags', (event, userId) => {
    return mockTags;
  });

  ipcMain.handle('add-tag', (event, data) => {
    const newId = mockTags.length + 1;
    const newTag = {
      id: newId,
      name: data.name,
      color: data.color,
      user_id: data.userId
    };
    mockTags.push(newTag);
    return newTag;
  });

  ipcMain.handle('update-tag', (event, data) => {
    const index = mockTags.findIndex(t => t.id === data.id);
    if (index !== -1) {
      mockTags[index] = { ...mockTags[index], ...data };
      return mockTags[index];
    }
    throw new Error('Tag not found');
  });

  ipcMain.handle('delete-tag', (event, id) => {
    const index = mockTags.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTags.splice(index, 1);
      // Also remove this tag from all notes
      mockNotes.forEach(note => {
        note.tags = note.tags.filter(tagId => tagId !== id);
      });
      return { success: true };
    }
    return { success: false };
  });

  // Assignment handlers
  ipcMain.handle('get-assignments', (event, data) => {
    let assignments = [...mockAssignments];
    
    if (data.userId) {
      assignments = assignments.filter(assignment => assignment.user_id === data.userId);
    }
    
    if (data.subjectId) {
      assignments = assignments.filter(assignment => assignment.subject_id === data.subjectId);
    }
    
    return assignments;
  });

  ipcMain.handle('add-assignment', (event, data) => {
    const newId = mockAssignments.length + 1;
    const newAssignment = {
      id: newId,
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      is_completed: 0,
      subject_id: data.subjectId,
      user_id: data.userId
    };
    mockAssignments.push(newAssignment);
    return newAssignment;
  });

  ipcMain.handle('update-assignment', (event, data) => {
    const index = mockAssignments.findIndex(a => a.id === data.id);
    if (index !== -1) {
      mockAssignments[index] = { ...mockAssignments[index], ...data };
      return mockAssignments[index];
    }
    throw new Error('Assignment not found');
  });

  ipcMain.handle('delete-assignment', (event, id) => {
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAssignments.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  });

  // Exam handlers
  ipcMain.handle('get-exams', (event, data) => {
    let exams = [...mockExams];
    
    if (data.userId) {
      exams = exams.filter(exam => exam.user_id === data.userId);
    }
    
    if (data.subjectId) {
      exams = exams.filter(exam => exam.subject_id === data.subjectId);
    }
    
    return exams;
  });

  ipcMain.handle('add-exam', (event, data) => {
    const newId = mockExams.length + 1;
    const newExam = {
      id: newId,
      title: data.title,
      description: data.description,
      exam_date: data.examDate,
      progress: 0,
      subject_id: data.subjectId,
      user_id: data.userId
    };
    mockExams.push(newExam);
    return newExam;
  });

  ipcMain.handle('update-exam', (event, data) => {
    const index = mockExams.findIndex(e => e.id === data.id);
    if (index !== -1) {
      mockExams[index] = { ...mockExams[index], ...data };
      return mockExams[index];
    }
    throw new Error('Exam not found');
  });

  ipcMain.handle('delete-exam', (event, id) => {
    const index = mockExams.findIndex(e => e.id === id);
    if (index !== -1) {
      mockExams.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  });
}

// Create the main application window
function createWindow() {
  console.log('Creating main window...');
  
  // Create the browser window with proper settings
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,      // Disable direct Node.js APIs in renderer
      contextIsolation: true,      // Enable context isolation for security
      enableRemoteModule: false,   // Disable remote module
      webSecurity: true,          // Enable web security
      preload: path.join(__dirname, 'preload.js') // Use preload script
    },
    show: false                   // Don't show until ready-to-show
  });

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log('Loading index.html from:', indexPath);
  console.log('File exists:', fs.existsSync(indexPath));
  
  const bundlePath = path.join(__dirname, 'dist', 'bundle.js');
  console.log('Looking for bundle at:', bundlePath);
  console.log('Bundle exists:', fs.existsSync(bundlePath));

  // Load app and handle errors
  mainWindow.loadFile(indexPath)
    .then(() => {
      console.log('Application loaded successfully');
    })
    .catch((err) => {
      console.error('Error loading application:', err);
      
      // Show error page if main app fails to load
      mainWindow.loadURL(`data:text/html;charset=utf-8,
        <html>
          <head>
            <title>Loading Error</title>
            <style>
              body { font-family: sans-serif; padding: 2em; text-align: center; }
              h2 { color: #d32f2f; }
              pre { background: #f5f5f5; padding: 1em; text-align: left; overflow: auto; }
            </style>
          </head>
          <body>
            <h2>Failed to load application</h2>
            <p>Error: ${err.message}</p>
            <pre>
Index: ${indexPath} (Exists: ${fs.existsSync(indexPath)})
Bundle: ${bundlePath} (Exists: ${fs.existsSync(bundlePath)})
Working directory: ${__dirname}
            </pre>
            <p><button onclick="window.location.reload()">Retry</button></p>
          </body>
        </html>
      `);
    });

  // Add all necessary event listeners for debugging
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load (${errorCode}): ${errorDescription}`);
    console.error('URL:', validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM ready');
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer (${level}): ${message}`);
  });

  // Always open DevTools during development
  mainWindow.webContents.openDevTools();
  
  return mainWindow;
}

// Enable detailed error logging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add exit handler to delay exit
process.on('exit', (code) => {
  console.log(`Process is about to exit with code ${code}`);
});

// Delay exit to see logs
app.on('before-quit', (event) => {
  console.log('Application is about to quit');
});

// Delay the window creation to ensure all initialization completes
app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  try {
    const mainWindow = createWindow();
    
    // Handle window closed event
    mainWindow.on('closed', () => {
      console.log('Main window closed');
    });
    
    // Additional logging
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error(`Failed to load (${errorCode}): ${errorDescription}`);
      console.error('URL:', validatedURL);
    });

    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Page loaded successfully');
    });

    mainWindow.webContents.on('dom-ready', () => {
      console.log('DOM ready');
    });

    mainWindow.webContents.on('crashed', (event) => {
      console.error('Renderer process crashed!');
    });

    app.on('render-process-gone', (event, webContents, details) => {
      console.error('Render process gone:', details.reason);
    });
  } catch (error) {
    console.error('Error creating window:', error);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('No windows active, creating new window');
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Close database when app is closing
app.on('will-quit', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
});

// Only register these handlers if not using mock data
if (!mockData) {
  // IPC event handlers for database operations
  ipcMain.handle('register-user', (event, userData) => {
    try {
      const { username, password } = userData;
      const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const result = stmt.run(username, password);
      return { id: result.lastInsertRowid, username };
    } catch (err) {
      console.error('Error registering user:', err);
      throw err;
    }
  });

  ipcMain.handle('login-user', (event, credentials) => {
    try {
      const { username, password } = credentials;
      const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
      const user = stmt.get(username, password);
      
      if (user) {
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      throw err;
    }
  });

  // Subject operations
  ipcMain.handle('get-subjects', (event, userId) => {
    try {
      const stmt = db.prepare('SELECT * FROM subjects');
      return stmt.all();
    } catch (err) {
      console.error('Error getting subjects:', err);
      throw err;
    }
  });

  ipcMain.handle('add-subject', (event, data) => {
    try {
      const { name, color, userId } = data;
      const stmt = db.prepare('INSERT INTO subjects (name, color, user_id) VALUES (?, ?, ?)');
      const result = stmt.run(name, color, userId);
      return { id: result.lastInsertRowid, name, color, user_id: userId };
    } catch (err) {
      console.error('Error adding subject:', err);
      throw err;
    }
  });

  ipcMain.handle('update-subject', (event, data) => {
    try {
      const { id, name, color } = data;
      const stmt = db.prepare('UPDATE subjects SET name = ?, color = ? WHERE id = ?');
      stmt.run(name, color, id);
      return { id, name, color };
    } catch (err) {
      console.error('Error updating subject:', err);
      throw err;
    }
  });

  ipcMain.handle('delete-subject', (event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM subjects WHERE id = ?');
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('Error deleting subject:', err);
      throw err;
    }
  });

  // Note operations
  ipcMain.handle('get-notes', (event, data) => {
    try {
      const { userId, subjectId } = data;
      let stmt;
      
      if (subjectId) {
        stmt = db.prepare('SELECT * FROM notes WHERE user_id = ? AND subject_id = ?');
        const notes = stmt.all(userId, subjectId);
        return addTagsToNotes(notes);
      } else {
        stmt = db.prepare('SELECT * FROM notes WHERE user_id = ?');
        const notes = stmt.all(userId);
        return addTagsToNotes(notes);
      }
    } catch (err) {
      console.error('Error getting notes:', err);
      throw err;
    }
  });

  function addTagsToNotes(notes) {
    if (notes.length === 0) {
      return [];
    }
    
    const tagStmt = db.prepare(`
      SELECT t.* FROM tags t 
      JOIN note_tags nt ON t.id = nt.tag_id 
      WHERE nt.note_id = ?
    `);
    
    return notes.map(note => {
      const tags = tagStmt.all(note.id);
      return { ...note, tags };
    });
  }

  ipcMain.handle('get-note', (event, noteId) => {
    try {
      const noteStmt = db.prepare('SELECT * FROM notes WHERE id = ?');
      const note = noteStmt.get(noteId);
      
      if (!note) {
        throw new Error('Note not found');
      }
      
      const tagStmt = db.prepare(`
        SELECT t.* FROM tags t 
        JOIN note_tags nt ON t.id = nt.tag_id 
        WHERE nt.note_id = ?
      `);
      
      const tags = tagStmt.all(noteId);
      return { ...note, tags };
    } catch (err) {
      console.error('Error getting note:', err);
      throw err;
    }
  });

  ipcMain.handle('add-note', (event, data) => {
    try {
      const { title, content, subjectId, userId, tags } = data;
      
      // Begin transaction
      db.exec('BEGIN TRANSACTION');
      
      const noteStmt = db.prepare('INSERT INTO notes (title, content, subject_id, user_id) VALUES (?, ?, ?, ?)');
      const noteResult = noteStmt.run(title, content, subjectId, userId);
      const noteId = noteResult.lastInsertRowid;
      
      // Add tag associations if tags were provided
      if (tags && tags.length > 0) {
        const tagStmt = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');
        
        for (const tagId of tags) {
          tagStmt.run(noteId, tagId);
        }
      }
      
      db.exec('COMMIT');
      return { id: noteId, title, content, subject_id: subjectId, user_id: userId, tags };
    } catch (err) {
      console.error('Error adding note:', err);
      db.exec('ROLLBACK');
      throw err;
    }
  });

  ipcMain.handle('update-note', (event, data) => {
    try {
      const { id, title, content, subjectId, tags } = data;
      
      // Begin transaction
      db.exec('BEGIN TRANSACTION');
      
      // Update note details
      const updateNoteStmt = db.prepare('UPDATE notes SET title = ?, content = ?, subject_id = ? WHERE id = ?');
      updateNoteStmt.run(title, content, subjectId, id);
      
      // Remove all existing tag associations
      const deleteTagsStmt = db.prepare('DELETE FROM note_tags WHERE note_id = ?');
      deleteTagsStmt.run(id);
      
      // Add new tag associations if tags were provided
      if (tags && tags.length > 0) {
        const tagStmt = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');
        
        for (const tagId of tags) {
          tagStmt.run(id, tagId);
        }
      }
      
      db.exec('COMMIT');
      return { id, title, content, subject_id: subjectId, tags };
    } catch (err) {
      console.error('Error updating note:', err);
      db.exec('ROLLBACK');
      throw err;
    }
  });

  ipcMain.handle('delete-note', (event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  });

  // Tag operations
  ipcMain.handle('get-tags', (event, userId) => {
    try {
      const stmt = db.prepare('SELECT * FROM tags');
      return stmt.all();
    } catch (err) {
      console.error('Error getting tags:', err);
      throw err;
    }
  });

  ipcMain.handle('add-tag', (event, data) => {
    try {
      const { name, color, userId } = data;
      const stmt = db.prepare('INSERT INTO tags (name, color, user_id) VALUES (?, ?, ?)');
      const result = stmt.run(name, color, userId);
      return { id: result.lastInsertRowid, name, color, user_id: userId };
    } catch (err) {
      console.error('Error adding tag:', err);
      throw err;
    }
  });

  ipcMain.handle('update-tag', (event, data) => {
    try {
      const { id, name, color } = data;
      const stmt = db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ?');
      stmt.run(name, color, id);
      return { id, name, color };
    } catch (err) {
      console.error('Error updating tag:', err);
      throw err;
    }
  });

  ipcMain.handle('delete-tag', (event, id) => {
    try {
      // Begin transaction
      db.exec('BEGIN TRANSACTION');
      
      // Delete tag associations first
      const deleteAssociationsStmt = db.prepare('DELETE FROM note_tags WHERE tag_id = ?');
      deleteAssociationsStmt.run(id);
      
      // Then delete the tag
      const deleteTagStmt = db.prepare('DELETE FROM tags WHERE id = ?');
      deleteTagStmt.run(id);
      
      db.exec('COMMIT');
      return { success: true };
    } catch (err) {
      console.error('Error deleting tag:', err);
      db.exec('ROLLBACK');
      throw err;
    }
  });

  // Assignment operations
  ipcMain.handle('get-assignments', (event, data) => {
    try {
      const { userId, subjectId } = data;
      let stmt;
      
      if (subjectId) {
        stmt = db.prepare('SELECT * FROM assignments WHERE user_id = ? AND subject_id = ?');
        return stmt.all(userId, subjectId);
      } else {
        stmt = db.prepare('SELECT * FROM assignments WHERE user_id = ?');
        return stmt.all(userId);
      }
    } catch (err) {
      console.error('Error getting assignments:', err);
      throw err;
    }
  });

  ipcMain.handle('add-assignment', (event, data) => {
    try {
      const { title, description, dueDate, subjectId, userId } = data;
      const stmt = db.prepare('INSERT INTO assignments (title, description, due_date, subject_id, user_id) VALUES (?, ?, ?, ?, ?)');
      const result = stmt.run(title, description, dueDate, subjectId, userId);
      return { 
        id: result.lastInsertRowid, 
        title, 
        description, 
        due_date: dueDate, 
        subject_id: subjectId, 
        user_id: userId,
        is_completed: 0
      };
    } catch (err) {
      console.error('Error adding assignment:', err);
      throw err;
    }
  });

  ipcMain.handle('update-assignment', (event, data) => {
    try {
      const { id, title, description, dueDate, isCompleted, subjectId } = data;
      const stmt = db.prepare('UPDATE assignments SET title = ?, description = ?, due_date = ?, is_completed = ?, subject_id = ? WHERE id = ?');
      stmt.run(title, description, dueDate, isCompleted ? 1 : 0, subjectId, id);
      return { 
        id, 
        title, 
        description, 
        due_date: dueDate, 
        is_completed: isCompleted ? 1 : 0,
        subject_id: subjectId
      };
    } catch (err) {
      console.error('Error updating assignment:', err);
      throw err;
    }
  });

  ipcMain.handle('delete-assignment', (event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM assignments WHERE id = ?');
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('Error deleting assignment:', err);
      throw err;
    }
  });

  // Exams operations
  ipcMain.handle('get-exams', (event, data) => {
    try {
      const { userId, subjectId } = data;
      let stmt;
      
      if (subjectId) {
        stmt = db.prepare('SELECT * FROM exams WHERE user_id = ? AND subject_id = ?');
        return stmt.all(userId, subjectId);
      } else {
        stmt = db.prepare('SELECT * FROM exams WHERE user_id = ?');
        return stmt.all(userId);
      }
    } catch (err) {
      console.error('Error getting exams:', err);
      throw err;
    }
  });

  ipcMain.handle('add-exam', (event, data) => {
    try {
      const { title, description, examDate, subjectId, userId } = data;
      const stmt = db.prepare('INSERT INTO exams (title, description, exam_date, subject_id, user_id, progress) VALUES (?, ?, ?, ?, ?, ?)');
      const result = stmt.run(title, description, examDate, subjectId, userId, 0);
      return { 
        id: result.lastInsertRowid, 
        title, 
        description, 
        exam_date: examDate, 
        subject_id: subjectId, 
        user_id: userId,
        progress: 0
      };
    } catch (err) {
      console.error('Error adding exam:', err);
      throw err;
    }
  });

  ipcMain.handle('update-exam', (event, data) => {
    try {
      const { id, title, description, examDate, progress, subjectId } = data;
      const stmt = db.prepare('UPDATE exams SET title = ?, description = ?, exam_date = ?, progress = ?, subject_id = ? WHERE id = ?');
      stmt.run(title, description, examDate, progress, subjectId, id);
      return { 
        id, 
        title, 
        description, 
        exam_date: examDate,
        progress,
        subject_id: subjectId
      };
    } catch (err) {
      console.error('Error updating exam:', err);
      throw err;
    }
  });

  ipcMain.handle('delete-exam', (event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM exams WHERE id = ?');
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('Error deleting exam:', err);
      throw err;
    }
  });
} 