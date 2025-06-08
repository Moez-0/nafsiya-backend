const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const forumRoutes = require('./routes/forumRoutes');
const userRoutes = require('./routes/userRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const specialistsRoutes = require('./routes/specialistsRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const agoraRoutes = require('./routes/agoraRoutes');

const app = express();

// 1. Security headers
app.use(helmet());

// 2. Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Enable CORS
app.use(cors());

// 4. Body parsers (should come before other middleware)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Cookie parser
app.use(cookieParser());

// // 6. Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // 7. Data sanitization
// app.use(mongoSanitize());
// app.use(xss());

// // 8. Prevent parameter pollution
// app.use(hpp());

// 9. Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/forum', forumRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/specialists', specialistsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/agora', agoraRoutes);


// 10. Error handler (should be last)
app.use(errorHandler);

module.exports = app;