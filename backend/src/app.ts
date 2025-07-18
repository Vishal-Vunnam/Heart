import express from 'express';
import postRoutes from './controllers/postController';
import userRoutes from './controllers/userController';
import imageRoutes from './controllers/imageController';
const app = express();

app.use(express.json({ limit: '10mb' })); 

app.use('/api', postRoutes);
app.use('/api', userRoutes);
app.use('/api', imageRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;