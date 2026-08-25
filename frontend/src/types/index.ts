export interface Room {
    id: number;
    name: string;
    capacity: number;
}

export interface RoomPayload {
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

export interface BookingPayload {
    roomId: number;
    startAt: string;
    endAt: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export interface DecodedToken {
    sub: string;
    role: "ADMIN" | "USER";
    exp: number;
}
