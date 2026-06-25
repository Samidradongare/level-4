import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

/**
 * Initialize Sentry instrumentation tracking inside backend env
 */
export function initSentry(environment: string = "production") {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log("⚠️ Warning: SENTRY_DSN not found in environment. Skipping Sentry initialization.");
    return;
  }

  Sentry.init({
    dsn: dsn,
    environment: environment,
    tracesSampleRate: 1.0,
  });

  console.log("✅ Sentry tracking initialized successfully.");
}

/**
 * Capture an error exception and push to Sentry aggregator
 */
export function errorHandler(err: Error) {
  console.error("Captured exception:", err.message);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
}

/**
 * Capture structured custom events details to Sentry feed
 */
export function captureEvent(
  eventName: string,
  data: Record<string, any>
) {
  console.log(`Event captured: ${eventName}`, data);
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(`Event: ${eventName}`, "info");
    Sentry.setContext(eventName, data);
  }
}
