import { validateLogPackageName } from "./utils/validations.js";
import { LEVELS, STACKS } from "./constants/logger.js";

const LOG_API = "http://4.224.186.213/evaluation-service/logs";

export async function Log(
  stack: string,
  level: string,
  packageName: string,
  message: string,
): Promise<void> {
  try {
    if (!STACKS.includes(stack as any)) {
      throw new Error(`Invalid stack name: ${stack}`);
    }

    if (!LEVELS.includes(level as any)) {
      throw new Error(`Invalid level value: ${level}`);
    }

    if (!validateLogPackageName(stack, packageName)) {
      throw new Error(
        `Invalid package name: ${packageName} for stack: ${stack}`,
      );
    }

    const logRequestBody = {
      stack: stack as any,
      level: level as any,
      package: packageName,
      message,
    };

    await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logRequestBody),
    });

    console.log("Log sent successfully");
  } catch (error) {
    console.error("Error occurred while logging: ", error);
  }
}
