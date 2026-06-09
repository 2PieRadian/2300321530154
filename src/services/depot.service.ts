import { BASE_URL } from "../config/constants.js";

import type { Depot } from "../types/vehicles.types.js";

export async function fetchDepots(token: string): Promise<Depot[]> {
    const response = await fetch(`${BASE_URL}/depots`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed To Fetch Depots");
    }

    const data = await response.json();

    return data.depots;
}