import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

// Import styles
import './styles.css';

// Import auth context
import { AuthProvider } from './components/AuthContext';

// Import pages
import Assignments from './components/Assignments';
import Calendar from './components/Calendar';
import Exams from './components/Exams';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import Notes from './components/Notes';
import Register from './components/Register';
import Subjects from './components/Subjects';
import Tags from './components/Tags';

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? children : <Navigate to="/login" />;
};

// Main App component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/notes" />} />
                <Route path="notes" element={<Notes />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="exams" element={<Exams />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="tags" element={<Tags />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 