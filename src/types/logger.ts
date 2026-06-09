import { LEVELS, STACKS } from "../constants/logger.js";

export type StackType = (typeof STACKS)[number];

export type LevelType = (typeof LEVELS)[number];

export interface LogRequestBody {
  stack: StackType;
  level: LevelType;
  package: string;
  message: string;
}
