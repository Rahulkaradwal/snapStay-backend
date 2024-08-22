const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const AppError = require('./utils/AppError');
const path = require('path');
const bodyParser = require('body-parser');
const bookingController = require('./controllers/bookingController');

const app = express();
// Trust the proxy to get the correct client IP
// app.set('trust proxy', 1);

// CORS configuration to allow all origins and credentials
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // Allow all origins
  },
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board

// webhook url

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());

app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  message: 'Too many requests from this IP, please try again after an hour',
});
// app.use('/api', limiter);

// Static files
app.use(express.static(`${__dirname}/public`));

// Routes
const CabinRouter = require('./routes/cabinRoute');
const BookingRouter = require('./routes/bookingRoute');
const GuestRouter = require('./routes/guestRoute');
const UserRouter = require('./routes/userRoute');
const SettingsRouter = require('./routes/settingsRoute');

// app.use((req, res, next) => {
//   console.log('request url', req.originalUrl);
//   next();
// });

app.use('/cabins', CabinRouter);
app.use('/bookings', BookingRouter);
app.use('/guests', GuestRouter);
app.use('/users', UserRouter);
app.use('/settings', SettingsRouter);

// Handling unmatched routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'An unknown error occurred',
  });
});

module.exports = app;
