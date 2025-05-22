import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth.routes';

const app = express();

// Konfiguracja CORS
app.use(cors({
  origin: 'http://localhost:3000', // adres frontendu
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routers
app.use('/health', healthRouter);
app.use('/auth', authRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
