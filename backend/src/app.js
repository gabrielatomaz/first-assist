import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database.js';
import incidentRoutes from './routes/incidentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import aiSuggestionRoutes from './routes/aiSuggestionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import tbaRoutes from './routes/tbaRoutes.js';
import accessRequestRoutes from './routes/accessRequestRoutes.js';
import { swaggerSpec } from './config/swagger.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/incidents', authMiddleware, incidentRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/ai-suggestions', authMiddleware, aiSuggestionRoutes);
app.use('/api/events', authMiddleware, eventRoutes);
app.use('/api/teams', authMiddleware, teamRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/tba', authMiddleware, tbaRoutes);

export { app };
