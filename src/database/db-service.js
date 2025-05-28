// No direct require of electron in renderer process
// const { ipcRenderer } = require('electron');

class DatabaseService {
  // User operations
  async registerUser(username, password) {
    try {
      return await window.api.register(username, password);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async loginUser(username, password) {
    try {
      return await window.api.login(username, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Subject operations
  async getSubjects(userId) {
    try {
      return await window.api.getSubjects(userId);
    } catch (error) {
      console.error('Error getting subjects:', error);
      throw error;
    }
  }

  async addSubject(name, color, userId) {
    try {
      return await window.api.createSubject({ name, color, userId });
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  }

  async updateSubject(id, name, color) {
    try {
      return await window.api.updateSubject({ id, name, color });
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  async deleteSubject(id) {
    try {
      return await window.api.deleteSubject(id);
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // Notes operations
  async getNotes(userId, subjectId = null) {
    try {
      return await window.api.getNotes({ userId, subjectId });
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  }

  async getNote(noteId) {
    try {
      return await window.api.getNote(noteId);
    } catch (error) {
      console.error('Error getting note:', error);
      throw error;
    }
  }

  async addNote(title, content, subjectId, userId, tags = []) {
    try {
      return await window.api.createNote({ title, content, subjectId, userId, tags });
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  async updateNote(id, title, content, subjectId, tags = []) {
    try {
      return await window.api.updateNote({ id, title, content, subjectId, tags });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(id) {
    try {
      return await window.api.deleteNote(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // Tags operations
  async getTags(userId) {
    try {
      return await window.api.getTags(userId);
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }

  async addTag(name, color, userId) {
    try {
      return await window.api.createTag({ name, color, userId });
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  }

  async updateTag(id, name, color) {
    try {
      return await window.api.updateTag({ id, name, color });
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }

  async deleteTag(id) {
    try {
      return await window.api.deleteTag(id);
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  // Assignments operations
  async getAssignments(userId, subjectId = null) {
    try {
      return await window.api.getAssignments({ userId, subjectId });
    } catch (error) {
      console.error('Error getting assignments:', error);
      throw error;
    }
  }

  async addAssignment(title, description, dueDate, subjectId, userId) {
    try {
      return await window.api.createAssignment({ title, description, dueDate, subjectId, userId });
    } catch (error) {
      console.error('Error adding assignment:', error);
      throw error;
    }
  }

  async updateAssignment(id, title, description, dueDate, isCompleted, subjectId) {
    try {
      return await window.api.updateAssignment({ id, title, description, dueDate, isCompleted, subjectId });
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(id) {
    try {
      return await window.api.deleteAssignment(id);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Exams operations
  async getExams(userId, subjectId = null) {
    try {
      return await window.api.getExams({ userId, subjectId });
    } catch (error) {
      console.error('Error getting exams:', error);
      throw error;
    }
  }

  async addExam(title, description, examDate, subjectId, userId) {
    try {
      return await window.api.createExam({ title, description, examDate, subjectId, userId });
    } catch (error) {
      console.error('Error adding exam:', error);
      throw error;
    }
  }

  async updateExam(id, title, description, examDate, progress, subjectId) {
    try {
      return await window.api.updateExam({ id, title, description, examDate, progress, subjectId });
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  async deleteExam(id) {
    try {
      return await window.api.deleteExam(id);
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }
}

// Export as ES module for webpack
export default new DatabaseService(); 