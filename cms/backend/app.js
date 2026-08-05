const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const app = express();
app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = [
  env.CLIENT_ORIGIN,
  'https://localhost',
  'capacitor://localhost'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api', apiLimiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (req, res) => {
  res.json({
    message: 'Complaint Management System API is running',
    status: 'ok'
  });
});
app.get('/health', (req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
