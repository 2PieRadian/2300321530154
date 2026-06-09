import { BASE_URL } from "../config/constants.js";
import type { VehicleTask } from "../types/vehicles.types.js";

export async function fetchVehicles(token: string): Promise<VehicleTask[]> {
    const response = await fetch(`${BASE_URL}/vehicles`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed To Fetch Vehicles");
    }

    const data = await response.json();

    return data.vehicles;
}