import express from 'express';
const app = express();

app.use(express.json());

// All your routes here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;