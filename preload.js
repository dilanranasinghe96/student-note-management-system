const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Auth
  login: (username, password) => ipcRenderer.invoke('login-user', { username, password }),
  register: (username, password) => ipcRenderer.invoke('register-user', { username, password }),
  
  // Notes
  getNotes: (params) => ipcRenderer.invoke('get-notes', params),
  createNote: (note) => ipcRenderer.invoke('add-note', note),
  updateNote: (note) => ipcRenderer.invoke('update-note', note),
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),
  getNote: (noteId) => ipcRenderer.invoke('get-note', noteId),
  
  // Subjects
  getSubjects: (userId) => ipcRenderer.invoke('get-subjects', userId),
  createSubject: (subject) => ipcRenderer.invoke('add-subject', subject),
  updateSubject: (subject) => ipcRenderer.invoke('update-subject', subject),
  deleteSubject: (subjectId) => ipcRenderer.invoke('delete-subject', subjectId),
  
  // Tags
  getTags: (userId) => ipcRenderer.invoke('get-tags', userId),
  createTag: (tag) => ipcRenderer.invoke('add-tag', tag),
  updateTag: (tag) => ipcRenderer.invoke('update-tag', tag),
  deleteTag: (tagId) => ipcRenderer.invoke('delete-tag', tagId),
  
  // Assignments
  getAssignments: (params) => ipcRenderer.invoke('get-assignments', params),
  createAssignment: (assignment) => ipcRenderer.invoke('add-assignment', assignment),
  updateAssignment: (assignment) => ipcRenderer.invoke('update-assignment', assignment),
  deleteAssignment: (assignmentId) => ipcRenderer.invoke('delete-assignment', assignmentId),
  
  // Exams
  getExams: (params) => ipcRenderer.invoke('get-exams', params),
  createExam: (exam) => ipcRenderer.invoke('add-exam', exam),
  updateExam: (exam) => ipcRenderer.invoke('update-exam', exam),
  deleteExam: (examId) => ipcRenderer.invoke('delete-exam', examId),
  
  // Note Tags
  addTagToNote: (noteId, tagId) => ipcRenderer.invoke('add-tag-to-note', noteId, tagId),
  removeTagFromNote: (noteId, tagId) => ipcRenderer.invoke('remove-tag-from-note', noteId, tagId),
  getTagsForNote: (noteId) => ipcRenderer.invoke('get-tags-for-note', noteId),
  
  // Calendar events
  getCalendarEvents: (userId) => ipcRenderer.invoke('get-calendar-events', userId),
}); 