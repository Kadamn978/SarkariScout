import * as Sentry from '@sentry/react'

let initialized = false

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn || import.meta.env.DEV) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
  })
  initialized = true
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (initialized) {
    Sentry.captureException(error, { extra: context })
  } else if (import.meta.env.DEV) {
    console.error('[Sentry-stub]', error, context)
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (initialized) {
    Sentry.captureMessage(message, level)
  }
}

export function setSentryUser(user: { id: string; email?: string }) {
  if (initialized) {
    Sentry.setUser({ id: user.id, email: user.email })
  }
}
