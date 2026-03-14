import express from 'express';
import { errorHandler } from './utils/errorHandler';
import authRouter from './modules/auth/auth.router';
import cookieParser from "cookie-parser"
const app = express();


app.use(express.json());
app.use(cookieParser())

app.use('/auth', authRouter);

// Global error handler (should be after routes)
app.use(errorHandler);
    

export default app;