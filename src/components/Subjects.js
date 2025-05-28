import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import React, { useContext, useEffect, useState } from 'react';
import dbService from '../database/db-service';
import { AuthContext } from './AuthContext';

const Subjects = () => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  
  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState('#2196f3');

  // Load data
  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = async () => {
    try {
      const fetchedSubjects = await dbService.getSubjects(user.id);
      setSubjects(fetchedSubjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
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

  const handleEditDialogOpen = (subject) => {
    setCurrentSubject(subject);
    setSubjectName(subject.name);
    setSubjectColor(subject.color);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteDialogOpen = (subject) => {
    setCurrentSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  // Form handling
  const resetForm = () => {
    setSubjectName('');
    setSubjectColor('#2196f3');
    setCurrentSubject(null);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await dbService.addSubject(subjectName, subjectColor, user.id);
      handleAddDialogClose();
      loadSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await dbService.updateSubject(currentSubject.id, subjectName, subjectColor);
      handleEditDialogClose();
      loadSubjects();
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dbService.deleteSubject(currentSubject.id);
      handleDeleteDialogClose();
      loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Subjects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add Subject
        </Button>
      </Box>

      {/* Subjects grid */}
      <Grid container spacing={3}>
        {subjects.map((subject) => (
          <Grid item xs={12} sm={6} md={4} key={subject.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: subject.color
                    }}
                  />
                  <Typography variant="h6" component="h2">
                    {subject.name}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleEditDialogOpen(subject)}
                  aria-label="edit"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteDialogOpen(subject)}
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Subject Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Subject
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
              label="Subject Name"
              fullWidth
              variant="outlined"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
            <Box sx={{ mt: 2 }}>
              <MuiColorInput
                label="Subject Color"
                value={subjectColor}
                onChange={(color) => setSubjectColor(color)}
                fullWidth
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Subject
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Subject
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
              label="Subject Name"
              fullWidth
              variant="outlined"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
            <Box sx={{ mt: 2 }}>
              <MuiColorInput
                label="Subject Color"
                value={subjectColor}
                onChange={(color) => setSubjectColor(color)}
                fullWidth
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Subject Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Subject</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the subject "{currentSubject?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subjects; 