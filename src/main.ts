import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import compression from 'compression';

// Security middleware
import helmet from 'helmet';
import cors from 'cors';
import { HealthRouter } from './routes/HealthRouter.js';
import { UserRouter } from './routes/UserRouter.js';
import { InventoryRouter } from './routes/InventoryRouter.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: `${process.env.SERVER_URL}:${process.env.SERVER_PORT}`,
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());

app.use('/health', HealthRouter);
app.use('/user', UserRouter);
app.use('/inventory', InventoryRouter);

const server = app.listen(Number(process.env.SERVER_PORT), String(process.env.SERVER_IP), () => {
  mongoose.set('strictQuery', false);
  mongoose.connect(`${process.env.MONGO_URL}`).catch(() => {
    console.error(
      "Initial Connection Failed - Ensure you've configured your environment's MONGO_URL!"
    );
  });

  const db = mongoose.connection;
  db.on('error', () => {
    console.error('Could not connect to Mongo - restart the server.');
  });
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });

  console.log(`Listening at ${process.env.SERVER_URL}:${process.env.SERVER_PORT}`);
});

server.on('error', console.error);
