import express from 'express';
import { healthRouter } from './routes/health';

const app = express();
app.use(express.json());
app.use('/health', healthRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
