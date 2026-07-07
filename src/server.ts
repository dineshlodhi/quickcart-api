import { createApp } from './app.js';
import { seedDatabase } from './data/seed.js';
import config from './config/index.js';

// ── Bootstrap ─────────────────────────────────────
// Separate app creation from server startup.
// This separation makes the app testable without starting a real HTTP server.

const app = createApp();

seedDatabase();

const server = app.listen(config.port, () => {
  console.log(`\n🚀 ${config.appName} is running`);
  console.log(`   Environment: ${config.env}`);
  console.log(`   URL: http://localhost:${config.port}`);
  console.log(`   Health: http://localhost:${config.port}/health\n`);
});

// ── Graceful Shutdown ─────────────────────────────
// Cloud platforms (like Render) send SIGTERM to tell the container to stop.
// We must stop accepting new requests and finish active ones before exiting.
function shutdown(signal: string) {
  console.log(`\n[${signal}] Received. Starting graceful shutdown...`);
  
  // server.close() stops accepting new connections but keeps existing ones open
  // until they finish processing.
  server.close(() => {
    console.log('HTTP server closed.');
    // Here you would also close database connections cleanly.
    console.log('Graceful shutdown complete. Exiting process.');
    process.exit(0);
  });

  // Force exit if connections take too long to close (e.g., 10 seconds)
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref(); // unref() prevents this timer itself from keeping the process alive
}

// Listen for termination signals
process.on('SIGINT', () => shutdown('SIGINT'));   // Triggered by Ctrl+C in terminal
process.on('SIGTERM', () => shutdown('SIGTERM')); // Triggered by Docker/Render stop command
