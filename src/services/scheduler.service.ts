import type {
    OptimizationResult,
    VehicleTask,
} from "../types/vehicles.types.js";

export function optimizeSchedule(
    tasks: VehicleTask[],
    maxHours: number
): OptimizationResult {
    const n = tasks.length;

    const dp = Array.from(
        { length: n + 1 },
        () => Array(maxHours + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {
        const currentTask = tasks[i - 1]!;

        for (let hours = 0; hours <= maxHours; hours++) {
            if (currentTask.Duration <= hours) {
                dp[i]![hours] = Math.max(
                    currentTask.Impact + dp[i - 1]![hours - currentTask.Duration]!,
                    dp[i - 1]![hours]!
                );
            } else {
                dp[i]![hours] = dp[i - 1]![hours]!;
            }
        }
    }

    let hours = maxHours;
    const selectedTasks: VehicleTask[] = [];

    for (let i = n; i > 0; i--) {
        if (dp[i]![hours] !== dp[i - 1]![hours]) {
            const task = tasks[i - 1]!;
            selectedTasks.push(task);
            hours -= task.Duration;
        }
    }

    return {
        selectedTasks,
        totalImpact: dp[n]![maxHours]!,
    };
}