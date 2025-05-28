import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import dbService from '../database/db-service';
import { AuthContext } from './AuthContext';

const Notes = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  
  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteTags, setNoteTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data
  useEffect(() => {
    if (user) {
      loadNotes();
      loadSubjects();
      loadTags();
    }
  }, [user]);

  // Load filtered notes when subject filter changes
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [selectedSubject]);

  const loadNotes = async () => {
    try {
      let fetchedNotes;
      if (selectedSubject === 'all') {
        fetchedNotes = await dbService.getNotes(user.id);
      } else {
        fetchedNotes = await dbService.getNotes(user.id, selectedSubject);
      }
      setNotes(fetchedNotes || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const fetchedSubjects = await dbService.getSubjects(user.id);
      setSubjects(fetchedSubjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadTags = async () => {
    try {
      const fetchedTags = await dbService.getTags(user.id);
      setTags(fetchedTags || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  // Handle dialog open/close
  const handleAddDialogOpen = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditDialogOpen = (note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubject(note.subject_id);
    // Set selected tags if any
    setNoteTags(note.tags ? note.tags.map(t => t.id) : []);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteDialogOpen = (note) => {
    setCurrentNote(note);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  // Form handling
  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteSubject('');
    setNoteTags([]);
    setCurrentNote(null);
  };

  const handleSubjectChange = (event) => {
    setNoteSubject(event.target.value);
  };

  const handleTagChange = (event) => {
    setNoteTags(event.target.value);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await dbService.addNote(noteTitle, noteContent, noteSubject, user.id, noteTags);
      handleAddDialogClose();
      loadNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await dbService.updateNote(currentNote.id, noteTitle, noteContent, noteSubject, noteTags);
      handleEditDialogClose();
      loadNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dbService.deleteNote(currentNote.id);
      handleDeleteDialogClose();
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Filtering
  const filteredNotes = notes.filter(note => {
    if (searchQuery === '') return true;
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Notes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          New Note
        </Button>
      </Box>

      {/* Search and filter section */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search notes..."
          sx={{ flexGrow: 1 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label="All Subjects" 
            onClick={() => setSelectedSubject('all')}
            color={selectedSubject === 'all' ? 'primary' : 'default'}
            variant={selectedSubject === 'all' ? 'filled' : 'outlined'}
          />
          {subjects.map((subject) => (
            <Chip
              key={subject.id}
              label={subject.name}
              onClick={() => setSelectedSubject(subject.id)}
              color={selectedSubject === subject.id ? 'primary' : 'default'}
              variant={selectedSubject === subject.id ? 'filled' : 'outlined'}
              sx={{ bgcolor: selectedSubject === subject.id ? 'primary.main' : 'transparent' }}
            />
          ))}
        </Box>
      </Box>

      {/* Notes grid */}
      <Grid container spacing={3}>
        {filteredNotes.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {searchQuery ? 'No matching notes found.' : 'No notes yet. Create your first note!'}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredNotes.map((note) => (
            <Grid item key={note.id} xs={12} sm={6} md={4}>
              <Paper 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <IconButton size="small" onClick={() => handleEditDialogOpen(note)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteDialogOpen(note)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                  {note.title}
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {note.subject_name}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                  {note.content}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                  {note.tags && note.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      sx={{ 
                        bgcolor: tag.color,
                        color: theme => theme.palette.getContrastText(tag.color)
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleAddDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Add New Note
          <IconButton
            aria-label="close"
            onClick={handleAddDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmitAdd}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={noteSubject}
                onChange={handleSubjectChange}
                label="Subject"
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={8}
              variant="outlined"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={noteTags}
                onChange={handleTagChange}
                label="Tags"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <Chip 
                          key={tag.id} 
                          label={tag.name}
                          size="small"
                          sx={{ 
                            bgcolor: tag.color,
                            color: theme => theme.palette.getContrastText(tag.color)
                          }}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleAddDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Note
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Note
          <IconButton
            aria-label="close"
            onClick={handleEditDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmitEdit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={noteSubject}
                onChange={handleSubjectChange}
                label="Subject"
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={8}
              variant="outlined"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={noteTags}
                onChange={handleTagChange}
                label="Tags"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <Chip 
                          key={tag.id} 
                          label={tag.name}
                          size="small"
                          sx={{ 
                            bgcolor: tag.color,
                            color: theme => theme.palette.getContrastText(tag.color)
                          }}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentNote?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notes; 