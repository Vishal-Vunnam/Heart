import express from 'express';
import postRoutes from './controllers/postController';
import userRoutes from './controllers/userController';
const app = express();

app.use(express.json());

app.use('/api', postRoutes);
app.use('/api', userRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;