export interface Room {
    id: number;
    name: string;
    capacity: number;
}

export interface BookingSummary {
    id: number;
    roomName: string;
    userName: string;
    userEmail: string;
    startAt: string;
    endAt: string;
}
