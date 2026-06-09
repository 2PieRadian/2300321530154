import {
  BACKEND_PACKAGES,
  COMMON_PACKAGES,
  FRONTEND_PACKAGES,
} from "../constants/logger.js";

export function validateLogPackageName(stack: string, packageName: string) {
  const commonPackages = [...COMMON_PACKAGES];

  if (stack == "backend") {
    return [...BACKEND_PACKAGES, ...commonPackages].includes(
      packageName as any,
    );
  }

  if (stack == "frontend") {
    return [...FRONTEND_PACKAGES, ...commonPackages].includes(
      packageName as any,
    );
  }

  return false;
}
