import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '192.168.1.94';
app.listen(PORT, () => console.log(`Server running on port http://${HOST}:${PORT}`));