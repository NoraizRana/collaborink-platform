import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, connectRedis } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting Collaborink Server...');
    
    // Connect databases
    await connectDB();
    await connectRedis();

    // Start HTTP server
    const server = require('http').createServer(app);
    
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║         ✅ COLLABORINK SERVER RUNNING ✅           ║
║                                                    ║
║  🌐 API:  http://localhost:${PORT}                     ║
║  📝 Env:  ${process.env.NODE_ENV || 'development'}                 ║
║  🗄️  DB:   Connected                               ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();