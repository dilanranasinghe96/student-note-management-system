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
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { CompactPicker } from 'react-color';
import dbService from '../database/db-service';
import { AuthContext } from './AuthContext';

const Tags = () => {
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  
  // Form states
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#1976d2');

  // Load data
  useEffect(() => {
    if (user) {
      loadTags();
    }
  }, [user]);

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

  const handleEditDialogOpen = (tag) => {
    setCurrentTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteDialogOpen = (tag) => {
    setCurrentTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  // Form handling
  const resetForm = () => {
    setTagName('');
    setTagColor('#1976d2');
    setCurrentTag(null);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await dbService.addTag(tagName, tagColor, user.id);
      handleAddDialogClose();
      loadTags();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await dbService.updateTag(currentTag.id, tagName, tagColor);
      handleEditDialogClose();
      loadTags();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dbService.deleteTag(currentTag.id);
      handleDeleteDialogClose();
      loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tags
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Create New Tag
        </Button>
      </Box>

      {tags.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No tags yet. Create your first tag!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tags.map((tag) => (
            <Grid item key={tag.id} xs={12} sm={6} md={4} lg={3}>
              <Paper sx={{ p: 2, position: 'relative', borderTop: `4px solid ${tag.color}` }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <IconButton size="small" onClick={() => handleEditDialogOpen(tag)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteDialogOpen(tag)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Chip
                    label={tag.name}
                    sx={{
                      bgcolor: tag.color,
                      color: 'white',
                      fontWeight: 'bold',
                      mr: 1
                    }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {/* Count of notes using this tag could go here */}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Tag Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create New Tag
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
              label="Tag Name"
              fullWidth
              variant="outlined"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              required
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tag Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: tagColor,
                    borderRadius: 1,
                    mr: 2,
                    border: '1px solid #ddd'
                  }}
                />
                <Typography>{tagColor}</Typography>
              </Box>
              <CompactPicker
                color={tagColor}
                onChange={(color) => setTagColor(color.hex)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleAddDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create Tag
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Tag
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
              label="Tag Name"
              fullWidth
              variant="outlined"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              required
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tag Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: tagColor,
                    borderRadius: 1,
                    mr: 2,
                    border: '1px solid #ddd'
                  }}
                />
                <Typography>{tagColor}</Typography>
              </Box>
              <CompactPicker
                color={tagColor}
                onChange={(color) => setTagColor(color.hex)}
              />
            </Box>
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
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the tag "{currentTag?.name}"? This may affect notes that use this tag.
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

export default Tags; 