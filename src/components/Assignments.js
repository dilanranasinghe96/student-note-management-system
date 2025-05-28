import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import dbService from '../database/db-service';
import { AuthContext } from './AuthContext';

const Assignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(dayjs());
  const [subjectId, setSubjectId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Load data
  useEffect(() => {
    if (user) {
      loadAssignments();
      loadSubjects();
    }
  }, [user]);

  // Load filtered assignments when subject filter changes
  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [selectedSubject]);

  const loadAssignments = async () => {
    try {
      let fetchedAssignments;
      if (selectedSubject === 'all') {
        fetchedAssignments = await dbService.getAssignments(user.id);
      } else {
        fetchedAssignments = await dbService.getAssignments(user.id, selectedSubject);
      }
      setAssignments(fetchedAssignments || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
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

  // Handle dialog open/close
  const handleAddDialogOpen = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditDialogOpen = (assignment) => {
    setCurrentAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description || '');
    setDueDate(assignment.due_date ? dayjs(assignment.due_date) : dayjs());
    setSubjectId(assignment.subject_id);
    setIsCompleted(Boolean(assignment.is_completed));
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteDialogOpen = (assignment) => {
    setCurrentAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  // Form handling
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(dayjs());
    setSubjectId('');
    setIsCompleted(false);
    setCurrentAssignment(null);
  };

  const handleSubjectChange = (event) => {
    setSubjectId(event.target.value);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await dbService.addAssignment(
        title,
        description,
        dueDate.format('YYYY-MM-DD'),
        subjectId,
        user.id
      );
      handleAddDialogClose();
      loadAssignments();
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await dbService.updateAssignment(
        currentAssignment.id,
        title,
        description,
        dueDate.format('YYYY-MM-DD'),
        isCompleted,
        subjectId
      );
      handleEditDialogClose();
      loadAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dbService.deleteAssignment(currentAssignment.id);
      handleDeleteDialogClose();
      loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const handleToggleComplete = async (assignment) => {
    try {
      await dbService.updateAssignment(
        assignment.id,
        assignment.title,
        assignment.description,
        assignment.due_date,
        !assignment.is_completed,
        assignment.subject_id
      );
      loadAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  // Get subject color by ID
  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#757575';
  };

  // Check if an assignment is overdue
  const isOverdue = (dueDate) => {
    return dayjs(dueDate).isBefore(dayjs(), 'day') && !dayjs(dueDate).isSame(dayjs(), 'day');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Assignments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          New Assignment
        </Button>
      </Box>

      {/* Filter by subject */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
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

      {/* Assignments table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%">Status</TableCell>
              <TableCell width="30%">Title</TableCell>
              <TableCell width="20%">Subject</TableCell>
              <TableCell width="20%">Due Date</TableCell>
              <TableCell width="15%">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No assignments yet. Create your first assignment!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => {
                const assignmentDueDate = dayjs(assignment.due_date);
                const isAssignmentOverdue = isOverdue(assignment.due_date);
                
                return (
                  <TableRow 
                    key={assignment.id}
                    sx={{ 
                      bgcolor: assignment.is_completed 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : isAssignmentOverdue 
                          ? 'rgba(244, 67, 54, 0.1)' 
                          : 'inherit' 
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={Boolean(assignment.is_completed)}
                        onChange={() => handleToggleComplete(assignment)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          textDecoration: assignment.is_completed ? 'line-through' : 'none',
                          color: assignment.is_completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {assignment.title}
                      </Typography>
                      {assignment.description && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            textDecoration: assignment.is_completed ? 'line-through' : 'none'
                          }}
                        >
                          {assignment.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getSubjectName(assignment.subject_id)}
                        size="small"
                        sx={{ 
                          bgcolor: getSubjectColor(assignment.subject_id),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={isAssignmentOverdue && !assignment.is_completed ? 'error' : 'textPrimary'}
                        fontWeight={isAssignmentOverdue && !assignment.is_completed ? 'bold' : 'normal'}
                      >
                        {assignmentDueDate.format('MMM D, YYYY')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {isAssignmentOverdue && !assignment.is_completed 
                          ? `Overdue by ${dayjs().diff(assignmentDueDate, 'day')} days` 
                          : !assignment.is_completed && !assignmentDueDate.isSame(dayjs(), 'day')
                            ? `Due in ${assignmentDueDate.diff(dayjs(), 'day')} days`
                            : assignmentDueDate.isSame(dayjs(), 'day') && !assignment.is_completed
                              ? 'Due today'
                              : 'Completed'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditDialogOpen(assignment)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteDialogOpen(assignment)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Assignment Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Assignment
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectId}
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
            <Box sx={{ mt: 2, mb: 2 }}>
              <DatePicker 
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Box>
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleAddDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Assignment
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Assignment
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectId}
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
            <Box sx={{ mt: 2, mb: 2 }}>
              <DatePicker 
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Box>
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isCompleted} 
                  onChange={(e) => setIsCompleted(e.target.checked)} 
                />
              }
              label="Mark as completed"
              sx={{ mt: 2 }}
            />
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
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentAssignment?.title}"? This action cannot be undone.
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

export default Assignments; 