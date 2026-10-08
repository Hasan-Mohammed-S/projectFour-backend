require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.disable('x-powered-by');
app.use(helmet());

const origins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: origins,
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('tiny'));
}

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/product'));
app.use('/stores', require('./routes/stores'));
app.use('/orders', require('./routes/order'));
app.use('/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({ message: 'Marketplace API is running.' });
});

app.get('/protected', require('./middleware/isSignedIn'), (req, res) => {
  res.json({ user: req.user });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use(require('./middleware/errorHandler'));

async function start() {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith('replace_')
  ) {
    throw new Error('Set JWT_SECRET to at least 32 random characters.');
  }

  await require('./config/database')();

  const server = app.listen(process.env.PORT || 3000, () => {
    console.log('API ready.');
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await require('mongoose').disconnect();
        process.exit(0);
      });
    });
  }
}

if (require.main === module) {
  start().catch((error) => {
    const message = String(error.message).replace(
      /mongodb(?:\+srv)?:\/\/\S+/gi,
      '[MongoDB URI redacted]'
    );

    console.error('Startup failed:', {
      name: error.name,
      code: error.code,
      message,
    });

    process.exitCode = 1;
  });
}

module.exports = app;