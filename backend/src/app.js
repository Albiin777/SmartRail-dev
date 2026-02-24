
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/corsOptions.js';
import indexRoutes from './routes/index.routes.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
