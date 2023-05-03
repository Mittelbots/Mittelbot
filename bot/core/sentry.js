const Sentry = require('@sentry/node');

module.exports.sentryInit = (client) => {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // Alternatively, use `process.env.npm_package_version` for a dynamic release version
        // if your build tool supports it.
        release: 'process.env.npm_package_version',
        envoirment: 'production',

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
        attachStacktrace: true,
    });
};
