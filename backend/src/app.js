import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import incidentRoutes from './routes/incidentRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/incidents', incidentRoutes);

export { app };
