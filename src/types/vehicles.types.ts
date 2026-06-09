export interface Depot {
    ID: number;
    MechanicHours: number;
}

export interface VehicleTask {
    TaskID: string;
    Duration: number;
    Impact: number;
}

export interface OptimizationResult {
    selectedTasks: VehicleTask[];
    totalImpact: number;
}

export interface AuthResponse {
    token_type: string;
    access_token: string;
    expires_in: number;
}