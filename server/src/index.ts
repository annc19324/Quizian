import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quiz.routes';
import uploadRoutes from './routes/upload.routes';
import path from 'path';

// ...

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('Quizian API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
