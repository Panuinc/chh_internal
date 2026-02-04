import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // Auth
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),
  
  // App URLs
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL"),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  
  // LINE (Optional but recommended)
  LINE_CHANNEL_ACCESS_TOKEN: z.string().optional(),
  LINE_VISITOR_GROUP_ID: z.string().optional(),
  
  // Business Central (Optional)
  BC_AUTH_URL: z.string().url().optional(),
  BC_CLIENT_ID: z.string().optional(),
  BC_CLIENT_SECRET: z.string().optional(),
  BC_SCOPE: z.string().optional(),
  BC_BASE_URL: z.string().optional(),
  BC_TENANT_ID: z.string().optional(),
  BC_ENVIRONMENT: z.string().optional(),
  BC_COMPANY: z.string().optional(),
  BC_DEBUG: z.enum(["true", "false"]).default("false"),
  
  // Printer (Optional)
  RFID_PRINTER_IP: z.string().optional(),
  RFID_PRINTER_PORT: z.string().regex(/^\d+$/, "RFID_PRINTER_PORT must be a number").optional().transform(val => val ? parseInt(val, 10) : undefined),
  
  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Set defaults
    if (!process.env.LOG_LEVEL) {
      process.env.LOG_LEVEL = "info";
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      console.error("❌ Environment validation failed:");
      missingVars.forEach(v => console.error(`  - ${v}`));
      process.exit(1);
    }
    throw error;
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  validateEnv();
}

export { validateEnv };
