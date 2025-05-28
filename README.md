# Student Note Manager

A desktop application for students to organize their notes, track assignments, and manage exams. Built with Electron, React, and SQLite.

## Features

- **User Authentication**: Secure login and registration system
- **Notes Management**: Create, edit, and organize notes by subjects
- **Assignment Tracking**: Keep track of assignment deadlines and status
- **Exam Management**: Organize exam preparation with progress tracking
- **Calendar View**: Visual timeline of deadlines and events
- **Tags**: Tag and categorize notes for easy retrieval
- **Export Options**: Save notes in different formats

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React**: UI component library
- **SQLite**: Local database for data storage
- **Material-UI**: Modern UI components

## Installation and Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Development Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd student-note-manager
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

### Building for Production

1. Build the application
   ```
   npm run build
   ```

2. The built application will be available in the `build` directory.

## Database Schema

The application uses SQLite for local data storage with the following tables:

- `users`: Store user authentication information
- `subjects`: Subject categories for organizing notes
- `notes`: Notes content and metadata
- `tags`: Tags for additional note categorization
- `note_tags`: Junction table for note-tag relationships
- `assignments`: Assignment details and deadlines
- `exams`: Exam information and preparation progress

## Future Enhancements

- Cloud sync for data backup
- Rich text formatting with markdown support
- Study analytics and statistics
- Integration with calendar applications
- Mobile companion app

## License

MIT 