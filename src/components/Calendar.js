import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import dbService from '../database/db-service';
import { AuthContext } from './AuthContext';

const Calendar = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [view, setView] = useState('month'); // 'month', 'week', or 'day'
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState({});

  // Load data
  useEffect(() => {
    if (user) {
      loadAssignments();
      loadExams();
      loadSubjects();
    }
  }, [user]);

  const loadAssignments = async () => {
    try {
      const fetchedAssignments = await dbService.getAssignments(user.id);
      setAssignments(fetchedAssignments || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadExams = async () => {
    try {
      const fetchedExams = await dbService.getExams(user.id);
      setExams(fetchedExams || []);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const fetchedSubjects = await dbService.getSubjects(user.id);
      const subjectsMap = {};
      fetchedSubjects.forEach(subject => {
        subjectsMap[subject.id] = subject;
      });
      setSubjects(subjectsMap);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  // Navigation functions
  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  const goToPrev = () => {
    if (view === 'month') {
      setCurrentDate(currentDate.subtract(1, 'month'));
    } else if (view === 'week') {
      setCurrentDate(currentDate.subtract(1, 'week'));
    } else {
      setCurrentDate(currentDate.subtract(1, 'day'));
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(currentDate.add(1, 'month'));
    } else if (view === 'week') {
      setCurrentDate(currentDate.add(1, 'week'));
    } else {
      setCurrentDate(currentDate.add(1, 'day'));
    }
  };

  // Generate calendar days for month view
  const generateMonthDays = () => {
    const firstDayOfMonth = currentDate.startOf('month');
    const lastDayOfMonth = currentDate.endOf('month');
    const startDay = firstDayOfMonth.day(); // 0 (Sunday) to 6 (Saturday)
    
    // Generate array of days including padding for previous and next months
    const days = [];
    
    // Previous month's days
    if (startDay > 0) {
      for (let i = startDay; i > 0; i--) {
        const day = dayjs(firstDayOfMonth).subtract(i, 'day');
        days.push({
          date: day,
          isCurrentMonth: false
        });
      }
    }
    
    // Current month's days
    const daysInMonth = lastDayOfMonth.date();
    for (let i = 0; i < daysInMonth; i++) {
      const day = dayjs(firstDayOfMonth).add(i, 'day');
      days.push({
        date: day,
        isCurrentMonth: true
      });
    }
    
    // Next month's days to fill remaining cells (to make sure we have complete weeks)
    const totalDaysDisplayed = Math.ceil((days.length) / 7) * 7;
    const remainingDays = totalDaysDisplayed - days.length;
    
    for (let i = 1; i <= remainingDays; i++) {
      const day = dayjs(lastDayOfMonth).add(i, 'day');
      days.push({
        date: day,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    
    // Filter assignments for this date
    const dateAssignments = assignments.filter(assignment => {
      if (!assignment.due_date) return false;
      const assignmentDate = dayjs(assignment.due_date).format('YYYY-MM-DD');
      return assignmentDate === dateStr;
    });
    
    // Filter exams for this date
    const dateExams = exams.filter(exam => {
      if (!exam.exam_date) return false;
      const examDate = dayjs(exam.exam_date).format('YYYY-MM-DD');
      return examDate === dateStr;
    });
    
    return [...dateAssignments.map(a => ({ ...a, type: 'assignment' })), 
            ...dateExams.map(e => ({ ...e, type: 'exam' }))];
  };

  // Render month view
  const renderMonthView = () => {
    const days = generateMonthDays();
    
    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return (
      <Box sx={{ 
        maxWidth: 400, 
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        overflow: 'hidden'
      }}>
        {/* Day headers */}
        <Grid container sx={{ my: 2 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayName) => (
            <Grid item xs key={dayName} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {dayName}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* Calendar days by week */}
        <Box sx={{ px: 2, pb: 2 }}>
          {weeks.map((week, weekIndex) => (
            <Grid container key={`week-${weekIndex}`} sx={{ mb: 2 }}>
              {week.map((day, dayIndex) => {
                const isToday = day.date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
                const events = getEventsForDate(day.date);
                const hasEvents = events.length > 0;
                
                return (
                  <Grid item xs key={`${weekIndex}-${dayIndex}`} sx={{ textAlign: 'center' }}>
                    <Box 
                      sx={{ 
                        position: 'relative',
                        width: 36, 
                        height: 36, 
                        mx: 'auto',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isToday ? 'primary.main' : 'transparent',
                        opacity: day.isCurrentMonth ? 1 : 0.3
                      }}
                    >
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontWeight: isToday ? 'bold' : 'normal',
                          color: isToday ? 'white' : 'text.primary'
                        }}
                      >
                        {day.date.date()}
                      </Typography>
                      {hasEvents && !isToday && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: 2,
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: 'primary.main'
                          }} 
                        />
                      )}
                    </Box>
                    {events.length > 0 && day.isCurrentMonth && (
                      <Box sx={{ mt: 1 }}>
                        {events.slice(0, 1).map((event, idx) => {
                          const subjectColor = event.subject_id && subjects[event.subject_id] 
                            ? subjects[event.subject_id].color 
                            : '#757575';
                          
                          return (
                            <Box 
                              key={`${event.id}-${idx}`} 
                              sx={{ 
                                height: 4, 
                                width: '70%',
                                mx: 'auto',
                                mb: 0.5, 
                                borderRadius: 1,
                                bgcolor: subjectColor,
                              }}
                              title={event.title}
                            />
                          );
                        })}
                        
                        {events.length > 1 && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            +{events.length - 1}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Box>
      </Box>
    );
  };

  // Generate week days for week view
  const generateWeekDays = () => {
    const startOfWeek = currentDate.startOf('week');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push({
        date: dayjs(startOfWeek).add(i, 'day'),
        isCurrentMonth: dayjs(startOfWeek).add(i, 'day').month() === currentDate.month()
      });
    }
    
    return days;
  };

  // Render week view
  const renderWeekView = () => {
    const days = generateWeekDays();
    
    return (
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        overflow: 'hidden'
      }}>
        {/* Day headers */}
        <Grid container sx={{ my: 2 }}>
          {days.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                {day.date.format('ddd')}
              </Typography>
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  mx: 'auto',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: day.date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') ? 'primary.main' : 'transparent',
                  opacity: day.isCurrentMonth ? 1 : 0.5
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontWeight: day.date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') ? 'bold' : 'normal',
                    color: day.date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') ? 'white' : 'text.primary'
                  }}
                >
                  {day.date.date()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        {/* Events for the week */}
        <Box sx={{ px: 2, pb: 2 }}>
          {days.map((day, dayIndex) => {
            const events = getEventsForDate(day.date);
            if (events.length === 0) return null;
            
            return (
              <Box key={dayIndex} sx={{ mb: 2, opacity: day.isCurrentMonth ? 1 : 0.7 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {day.date.format('dddd, MMM D')}
                </Typography>
                {events.map((event, idx) => {
                  const subjectColor = event.subject_id && subjects[event.subject_id] 
                    ? subjects[event.subject_id].color 
                    : '#757575';
                  
                  return (
                    <Box 
                      key={idx} 
                      sx={{ 
                        p: 1, 
                        mb: 1, 
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        borderLeft: `4px solid ${subjectColor}`,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.type === 'exam' ? 'Exam' : 'Assignment'} - {subjects[event.subject_id]?.name || 'No Subject'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            );
          })}
          {days.every(day => getEventsForDate(day.date).length === 0) && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic', py: 4 }}>
              No events scheduled for this week
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Render day view
  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    const dayName = currentDate.format('dddd');
    const dayNumber = currentDate.date();
    const monthName = currentDate.format('MMMM');
    
    return (
      <Box sx={{ 
        maxWidth: 500, 
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        overflow: 'hidden',
        p: 3
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          mb: 3
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {dayName}
          </Typography>
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: currentDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') ? 'primary.main' : 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 1
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: currentDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') ? 'white' : 'text.primary'
              }}
            >
              {dayNumber}
            </Typography>
          </Box>
          <Typography variant="subtitle1">
            {monthName} {currentDate.year()}
          </Typography>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          Events
        </Typography>
        
        {events.length > 0 ? (
          events.map((event, idx) => {
            const subjectColor = event.subject_id && subjects[event.subject_id] 
              ? subjects[event.subject_id].color 
              : '#757575';
            
            return (
              <Paper
                key={idx}
                elevation={0}
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderLeft: `4px solid ${subjectColor}`,
                  bgcolor: event.type === 'exam' ? 'rgba(244, 67, 54, 0.05)' : 'rgba(33, 150, 243, 0.05)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subjects[event.subject_id]?.name || 'No Subject'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Box 
                    sx={{ 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1, 
                      bgcolor: event.type === 'exam' ? 'error.light' : 'primary.light',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      mr: 1
                    }}
                  >
                    {event.type === 'exam' ? 'EXAM' : 'ASSIGNMENT'}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {event.type === 'exam' 
                      ? `Exam Date: ${dayjs(event.exam_date).format('MMM D, YYYY')}` 
                      : `Due Date: ${dayjs(event.due_date).format('MMM D, YYYY')}`}
                  </Typography>
                </Box>
              </Paper>
            );
          })
        ) : (
          <Box sx={{ 
            py: 4, 
            textAlign: 'center',
            bgcolor: 'background.default',
            borderRadius: 2
          }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No events scheduled for today
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Calendar
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ButtonGroup variant="outlined" size="small">
            <Button onClick={() => setView('month')} variant={view === 'month' ? 'contained' : 'outlined'}>
              Month
            </Button>
            <Button onClick={() => setView('week')} variant={view === 'week' ? 'contained' : 'outlined'}>
              Week
            </Button>
            <Button onClick={() => setView('day')} variant={view === 'day' ? 'contained' : 'outlined'}>
              Day
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ mr: 1 }}>
            {view === 'month' 
              ? currentDate.format('MMMM YYYY')
              : view === 'week'
                ? `Week of ${currentDate.startOf('week').format('MMM D')} - ${currentDate.endOf('week').format('MMM D')}`
                : currentDate.format('MMMM D, YYYY')
            }
          </Typography>
          <IconButton size="small" onClick={goToPrev}>
            <PrevIcon />
          </IconButton>
          <IconButton size="small" onClick={goToNext}>
            <NextIcon />
          </IconButton>
        </Box>
        
        <Button variant="text" onClick={goToToday} color="primary">
          Today
        </Button>
      </Box>

      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </Box>
  );
};

export default Calendar; 