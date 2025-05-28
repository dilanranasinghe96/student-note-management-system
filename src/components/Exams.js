import {
    Add as AddIcon,
    CalendarToday as CalendarIcon,
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
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    Slider,
    TextField,
    Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import dbService from '../database/db-service';
import { AuthContext } from './AuthContext';

const Exams = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examDate, setExamDate] = useState(dayjs());
  const [subjectId, setSubjectId] = useState('');
  const [progress, setProgress] = useState(0);

  // Load data
  useEffect(() => {
    if (user) {
      loadExams();
      loadSubjects();
    }
  }, [user]);

  // Load filtered exams when subject filter changes
  useEffect(() => {
    if (user) {
      loadExams();
    }
  }, [selectedSubject]);

  const loadExams = async () => {
    try {
      let fetchedExams;
      if (selectedSubject === 'all') {
        fetchedExams = await dbService.getExams(user.id);
      } else {
        fetchedExams = await dbService.getExams(user.id, selectedSubject);
      }
      setExams(fetchedExams || []);
    } catch (error) {
      console.error('Error loading exams:', error);
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

  const handleEditDialogOpen = (exam) => {
    setCurrentExam(exam);
    setTitle(exam.title);
    setDescription(exam.description || '');
    setExamDate(exam.exam_date ? dayjs(exam.exam_date) : dayjs());
    setSubjectId(exam.subject_id);
    setProgress(exam.progress || 0);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteDialogOpen = (exam) => {
    setCurrentExam(exam);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  // Form handling
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setExamDate(dayjs());
    setSubjectId('');
    setProgress(0);
    setCurrentExam(null);
  };

  const handleSubjectChange = (event) => {
    setSubjectId(event.target.value);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await dbService.addExam(
        title,
        description,
        examDate.format('YYYY-MM-DD'),
        subjectId,
        user.id
      );
      handleAddDialogClose();
      loadExams();
    } catch (error) {
      console.error('Error adding exam:', error);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await dbService.updateExam(
        currentExam.id,
        title,
        description,
        examDate.format('YYYY-MM-DD'),
        progress,
        subjectId
      );
      handleEditDialogClose();
      loadExams();
    } catch (error) {
      console.error('Error updating exam:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dbService.deleteExam(currentExam.id);
      handleDeleteDialogClose();
      loadExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const handleProgressChange = async (examId, newProgress) => {
    try {
      const exam = exams.find(e => e.id === examId);
      await dbService.updateExam(
        examId,
        exam.title,
        exam.description,
        exam.exam_date,
        newProgress,
        exam.subject_id
      );
      loadExams();
    } catch (error) {
      console.error('Error updating exam progress:', error);
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

  // Check if an exam is upcoming soon (within 7 days)
  const isUpcomingSoon = (examDate) => {
    const today = dayjs();
    const examDay = dayjs(examDate);
    const diffDays = examDay.diff(today, 'day');
    return diffDays >= 0 && diffDays <= 7;
  };

  // Get days until exam
  const getDaysUntilExam = (examDate) => {
    const today = dayjs();
    const examDay = dayjs(examDate);
    return examDay.diff(today, 'day');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Exams
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add New Exam
        </Button>
      </Box>

      {/* Filter by subject */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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

      {/* Exams grid */}
      {exams.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No exams yet. Add your first exam!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {exams.map((exam) => {
            const examDayjs = dayjs(exam.exam_date);
            const daysUntil = getDaysUntilExam(exam.exam_date);
            const isPast = daysUntil < 0;
            const isNearFuture = !isPast && daysUntil <= 7;
            
            return (
              <Grid item key={exam.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderTop: `4px solid ${getSubjectColor(exam.subject_id)}`,
                    bgcolor: isPast ? 'rgba(0, 0, 0, 0.03)' : isNearFuture ? 'rgba(255, 152, 0, 0.05)' : 'white'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {exam.title}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditDialogOpen(exam)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteDialogOpen(exam)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Chip 
                        label={getSubjectName(exam.subject_id)}
                        size="small"
                        sx={{ 
                          bgcolor: getSubjectColor(exam.subject_id),
                          color: 'white',
                          mr: 1
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                        <Typography variant="body2">
                          {examDayjs.format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {exam.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {exam.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Preparation Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                          {exam.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={exam.progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: exam.progress === 100 ? 'success.main' : 'primary.main'
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ borderTop: '1px solid #eee', p: 2 }}>
                    {isPast ? (
                      <Typography variant="body2" color="text.secondary">
                        Exam date has passed
                      </Typography>
                    ) : (
                      <Typography 
                        variant="body2" 
                        color={daysUntil <= 3 ? 'error.main' : daysUntil <= 7 ? 'warning.main' : 'text.secondary'}
                        fontWeight={daysUntil <= 7 ? 'bold' : 'normal'}
                      >
                        {daysUntil === 0 
                          ? 'Today!' 
                          : daysUntil === 1 
                            ? 'Tomorrow!' 
                            : `${daysUntil} days left`}
                      </Typography>
                    )}
                    <Box sx={{ ml: 'auto' }}>
                      <Slider
                        size="small"
                        value={exam.progress || 0}
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                        sx={{ width: 120 }}
                        onChange={(_, value) => handleProgressChange(exam.id, value)}
                      />
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add Exam Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Exam
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
              label="Exam Title"
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
                label="Exam Date"
                value={examDate}
                onChange={(newValue) => setExamDate(newValue)}
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
              Add Exam
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Exam
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
              label="Exam Title"
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
                label="Exam Date"
                value={examDate}
                onChange={(newValue) => setExamDate(newValue)}
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
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Preparation Progress: {progress}%</Typography>
              <Slider
                value={progress}
                onChange={(_, value) => setProgress(value)}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
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
        <DialogTitle>Delete Exam</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentExam?.title}"? This action cannot be undone.
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

export default Exams; 