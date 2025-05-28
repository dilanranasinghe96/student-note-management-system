import {
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  ImportContacts as ExamIcon,
  LibraryBooks as NotesIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Try to register
    const result = await register(username, password);
    if (result.success) {
      navigate('/notes');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <Box sx={{ width: '100%', maxWidth: 450 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
            Create an account
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Register to start using Student Note Manager
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Typography variant="body1" component="label" sx={{ display: 'block', mb: 1 }}>
              Username
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { py: 0.5 }
              }}
            />
            
            <Typography variant="body1" component="label" sx={{ display: 'block', mb: 1 }}>
              Password
            </Typography>
            <TextField
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { py: 0.5 }
              }}
            />
            
            <Typography variant="body1" component="label" sx={{ display: 'block', mb: 1 }}>
              Confirm Password
            </Typography>
            <TextField
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { py: 0.5 }
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
            >
              Register
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={{ mr: 1 }}>
                Login
              </Typography>
            </Link>
          </Box>
        </Box>
      </div>

      <div className="benefits-sidebar">
        <Typography variant="h4" component="h2" gutterBottom fontWeight="500">
          Optimize Your Academic Success
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <div className="benefit-item">
            <Box sx={{ mr: 2, color: 'primary.main' }}>
              <NotesIcon fontSize="large" />
            </Box>
            <div>
              <Typography variant="h6">Organize Your Notes</Typography>
              <Typography variant="body2" color="text.secondary">
                Create and categorize notes by subjects for easy retrieval
              </Typography>
            </div>
          </div>

          <div className="benefit-item">
            <Box sx={{ mr: 2, color: 'primary.main' }}>
              <CalendarIcon fontSize="large" />
            </Box>
            <div>
              <Typography variant="h6">Track Assignments & Exams</Typography>
              <Typography variant="body2" color="text.secondary">
                Never miss a deadline with due date tracking and reminders
              </Typography>
            </div>
          </div>

          <div className="benefit-item">
            <Box sx={{ mr: 2, color: 'primary.main' }}>
              <AssignmentIcon fontSize="large" />
            </Box>
            <div>
              <Typography variant="h6">Visual Learning</Typography>
              <Typography variant="body2" color="text.secondary">
                Rich text editor with formatting for effective note-taking
              </Typography>
            </div>
          </div>

          <div className="benefit-item">
            <Box sx={{ mr: 2, color: 'primary.main' }}>
              <ExamIcon fontSize="large" />
            </Box>
            <div>
              <Typography variant="h6">Export and Share</Typography>
              <Typography variant="body2" color="text.secondary">
                Export your notes to PDF or text formats for sharing or backup
              </Typography>
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Register; 