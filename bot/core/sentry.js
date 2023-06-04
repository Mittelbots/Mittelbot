const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

module.exports.sentryInit = () => {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // Alternatively, use `process.env.npm_package_version` for a dynamic release version
        // if your build tool supports it.
        release: process.env.npm_package_version,
        environment: process.env.NODE_ENV,

        tracesSampleRate: 0.8,
        attachStacktrace: true,
        profilesSampleRate: 0.8,
        integrations: [
            new ProfilingIntegration(),
          ],
    });
};
