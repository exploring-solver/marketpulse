const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Campaign } = require('./models/Campaign');
const { Client } = require('./models/Client');
const { Analytics } = require('./models/Analytics');
const dashboardRoutes = require('./routes/dashboard');
const clientRoutes = require('./routes/client');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.get('/',(req,res) => {
  res.json("Welcome to JalSync API by team ramanujan (sih-2024)!!")
});
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', clientRoutes);
app.use('/api', analyticsRoutes);
app.use('/api',settingsRoutes);

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'password',
}

const start = async () => {
  await connectDB();
  
  // Dynamically import AdminJS and related packages
  const { default: AdminJS } = await import('adminjs');
  const AdminJSMongoose = await import('@adminjs/mongoose');
  const { buildAuthenticatedRouter } = await import('@adminjs/express');
  const session = await import('express-session');
  const { default: MongoStore } = await import('connect-mongo');
  
  // Import the models
  const User = require('./models/User');
  
  // Register AdminJS Mongoose adapter
  AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  });

  // Configure AdminJS
  const adminOptions = {
    resources: [
      { 
        resource: User,
        options: { 
          parent: { name: 'User Management' },
          properties: {
            password: { 
              isVisible: { list: false, edit: true, create: true },
              type: 'password'
            },
            createdAt: {
              isVisible: { list: true, edit: false, create: false }
            }
          },
          actions: {
            new: {
              before: async (request) => {
                if(request.payload.password) {
                  request.payload.password = await bcrypt.hash(request.payload.password, 10);
                }
                return request;
              },
            },
            edit: {
              before: async (request) => {
                if(request.payload.password) {
                  request.payload.password = await bcrypt.hash(request.payload.password, 10);
                }
                return request;
              },
            }
          }
        }
      },
      { resource: Campaign, options: { parent: { name: 'Campaign Management' }}},
      { resource: Client, options: { parent: { name: 'Client Management' }}},
      { resource: Analytics, options: { parent: { name: 'Analytics Management' }}}
    ],
    rootPath: '/admin',
    branding: {
      companyName: 'MarketPulse Admin',
      logo: false,
      softwareBrothers: false
    }
  };
  
  const admin = new AdminJS(adminOptions);

  // Setup admin router with authentication
  const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessions',
    stringify: false,
    autoRemove: 'interval',
    autoRemoveInterval: 1
  });

  const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      return Promise.resolve(DEFAULT_ADMIN);
    }
    const user = await User.findOne({ email });
    if (user && user.role === 'admin') {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        return user;
      }
    }
    return null;
  };

  const adminRouter = buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'sessionsecret',
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: process.env.ADMIN_SESSION_SECRET || 'sessionsecret',
      cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      },
      name: 'adminjs',
    }
  );

  app.use(admin.options.rootPath, adminRouter);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
  });
};

start();