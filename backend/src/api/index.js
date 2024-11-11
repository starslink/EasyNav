import express from 'express';
import cors from 'cors';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import dotenv from 'dotenv';
import {authRouter} from '../routes/auth.js';
import {groupsRouter} from '../routes/groups.js';
import {linksRouter} from '../routes/links.js';
import {initializeDatabase} from '../db/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({path: join(__dirname, '../.env')});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize database
try {
    await initializeDatabase();
    console.log('Database initialized successfully');
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/links', linksRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({status: 'ok'});
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
