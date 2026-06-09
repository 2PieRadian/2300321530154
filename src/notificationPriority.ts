import { getAccessToken } from "./services/auth.service.js";
import { BASE_URL } from "./config/constants.js";
import { Log } from "./logger-middleware/logger.js";

interface Notification {
    ID: string;
    Type: string;
    Message: string;
    Timestamp: string;
}

const TYPE_WEIGHTS: Record<string, number> = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

function getPriority(n: Notification): { weight: number, time: number } {
    return {
        weight: TYPE_WEIGHTS[n.Type] || 0,
        time: new Date(n.Timestamp).getTime()
    };
}

function compareNotifications(a: Notification, b: Notification): number {
    const pA = getPriority(a);
    const pB = getPriority(b);

    if (pA.weight !== pB.weight) {
        return pA.weight - pB.weight;
    }
    return pA.time - pB.time;
}

class NotificationMinHeap {
    private heap: Notification[] = [];
    private maxSize: number;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    public push(notification: Notification) {
        if (this.heap.length < this.maxSize) {
            this.heap.push(notification);
            this.bubbleUp(this.heap.length - 1);
        } else if (compareNotifications(notification, this.heap[0]!) > 0) {
            this.heap[0] = notification;
            this.sinkDown(0);
        }
    }

    public getSorted(): Notification[] {
        return [...this.heap].sort((a, b) => compareNotifications(b, a));
    }

    private bubbleUp(index: number) {
        const node = this.heap[index]!;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex]!;

            if (compareNotifications(node, parent) >= 0) break;

            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = node;
    }

    private sinkDown(index: number) {
        const length = this.heap.length;
        const node = this.heap[index]!;

        while (true) {
            const leftChildIdx = 2 * index + 1;
            const rightChildIdx = 2 * index + 2;
            let leftChild, rightChild;
            let swapIdx: number | null = null;

            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx]!;
                if (compareNotifications(leftChild, node) < 0) {
                    swapIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx]!;
                if (
                    (swapIdx === null && compareNotifications(rightChild, node) < 0) ||
                    (swapIdx !== null && compareNotifications(rightChild, leftChild!) < 0)
                ) {
                    swapIdx = rightChildIdx;
                }
            }

            if (swapIdx === null) break;

            this.heap[index] = this.heap[swapIdx]!;
            index = swapIdx;
        }
        this.heap[index] = node;
    }
}

async function fetchNotifications(token: string): Promise<Notification[]> {
    const response = await fetch(`${BASE_URL}/notifications`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const data = await response.json();
    return data.notifications || [];
}

const log = (message: string) => Log("backend", "info", "service", message);

async function main() {
    try {
        await log("Authenticating for Notifications...");
        const token = await getAccessToken();
        await log("Authentication Successful");

        await log("Fetching Notifications...");
        const notifications = await fetchNotifications(token);

        const topN = 10;
        const heap = new NotificationMinHeap(topN);

        for (const notification of notifications) {
            heap.push(notification);
        }

        const topNotifications = heap.getSorted();

        await log(`Displaying Top ${topN} Notifications`);

        const displayData = topNotifications.map((n, i) => ({
            Rank: i + 1,
            Type: n.Type,
            Message: n.Message,
            Timestamp: n.Timestamp,
            ID: n.ID
        }));

        console.table(displayData);

    } catch (error) {
        await Log("backend", "error", "service", "Notification Error: " + error);
        console.error(error);
    }
}

main();