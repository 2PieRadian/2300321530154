import {
    ACCESS_CODE,
    BASE_URL,
    CLIENT_ID,
    CLIENT_SECRET,
} from "../config/constants.js";

import type { AuthResponse } from "../types/vehicles.types.js";

export async function getAccessToken(): Promise<string> {
    const response = await fetch(`${BASE_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({
            email: "ramanbhardwaj2005@gmail.com",
            name: "Raman Bhardwaj",
            rollNo: "2300321530154",
            accessCode: ACCESS_CODE,
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
        }),
    });

    if (!response.ok) {
        throw new Error("Authentication Failed");
    }

    const data: AuthResponse = await response.json();

    return data.access_token;
}