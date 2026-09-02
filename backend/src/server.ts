/**
 * OSINET Backend — Server Entry Point
 */
import { config } from './config/env';
import { logger } from './utils/logger';

// Load env first
import './config/env';

async function bootstrap() {
  try {
    // Import app after config is validated
    const { default: app } = await import('./app');

    // Register development providers
    if (config.isDevelopment) {
      const { MockDevProvider } = await import('./services/providers/MockDevProvider');
      const { providerRegistry } = await import('./services/providers/ProviderInterface');
      providerRegistry.register(new MockDevProvider());
      logger.info('[Server] Mock development provider registered');
    }

    const server = app.listen(config.server.port, () => {
      logger.info(
        `[Server] OSINET API running on port ${config.server.port} (${config.server.nodeEnv})`
      );
      logger.info(`[Server] Health endpoint: http://localhost:${config.server.port}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('[Server] Server closed. Exiting.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('[Server] Failed to start', { error: String(err) });
    process.exit(1);
  }
}

bootstrap();
