// This file re-exports from logger-edge for backward compatibility
// For Edge Runtime compatibility, this now uses the console-based logger
// For Node.js file logging, import directly from logger-node.js

export { createLogger, handlePrismaUniqueError } from "./logger-edge";
