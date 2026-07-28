import app from "./app";
import connectDB from "./config/database";
import config from "./config/index";

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(error.name, error.message);
  process.exit(1);
});

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log(`
╔══════════════════════════════════════════════════════╗
║  🏛️  Dangila Digital Woreda Services API           ║
║  🌐 Environment: ${config.server.nodeEnv.padEnd(34)}║
║  🔗 URL: http://${config.server.host}:${String(config.server.port).padEnd(32)}║
║  📚 API Docs: http://${config.server.host}:${String(config.server.port)}/api/v1  ║
║  🩺 Health: http://${config.server.host}:${String(config.server.port)}/health     ║
╚══════════════════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (error: Error) => {
      console.error("UNHANDLED REJECTION! Shutting down...");
      console.error(error.name, error.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown on SIGTERM
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("Process terminated");
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
