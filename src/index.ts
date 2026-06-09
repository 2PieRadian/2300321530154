import {
    fetchDepots,
} from "./services/depot.service.js";

import {
    fetchVehicles,
} from "./services/vechicle.service.js";

import {
    optimizeSchedule,
} from "./services/scheduler.service.js";

import {
    getAccessToken,
} from "./services/auth.service.js";

import {
    Log,
} from "./logger-middleware/logger.js";

const log = (message: string) => Log("backend", "info", "service", message);

async function main() {
    try {
        await log("Authenticating...");
        const token = await getAccessToken();
        await log("Authentication Successful");

        await log("Fetching Depots...");

        const depots = await fetchDepots(token);
        await log("Fetching Vehicles...");

        const vehicles = await fetchVehicles(token);

        for (const depot of depots) {
            await log(`\nDepot ${depot.ID}`);
            await log(`Mechanic Hours: ${depot.MechanicHours}`);

            const result = optimizeSchedule(
                vehicles,
                depot.MechanicHours
            );

            await log(`Total Impact: ${result.totalImpact}`);
            console.table(result.selectedTasks);
        }
    } catch (error) {
        await Log("backend", "error", "service", "Application Error: " + error);
        console.log(error);
    }
}

main();