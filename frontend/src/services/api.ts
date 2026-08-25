import Cookies from "js-cookie";
import {
    AuthResponse,
    BookingPayload,
    BookingSummary,
    LoginPayload,
    RegisterPayload,
    Room,
    RoomPayload,
    User,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export class ApiError extends Error {
    status: number;
    fields?: Record<string, string>;

    constructor(message: string, status: number, fields?: Record<string, string>) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fields = fields;
    }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = Cookies.get("room_token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 204) {
        return {} as T;
    }

    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch {
            data = null;
        }
    }

    if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
            Cookies.remove("room_token");
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        }

        const errorMessage = data?.error || data?.message || "Erro na requisição.";
        throw new ApiError(errorMessage, response.status, data?.fields);
    }

    return data as T;
}

export const api = {
    auth: {
        login: (payload: LoginPayload) =>
            request<AuthResponse>("/auth/login", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        register: (payload: RegisterPayload) =>
            request<AuthResponse>("/auth/register", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
    },
    rooms: {
        list: () => request<Room[]>("/rooms", { cache: "no-store" }),
        create: (payload: RoomPayload) =>
            request<Room>("/rooms", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        update: (id: number, payload: RoomPayload) =>
            request<Room>(`/rooms/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            }),
        delete: (id: number) =>
            request<void>(`/rooms/${id}`, {
                method: "DELETE",
            }),
    },
    bookings: {
        listAll: () => request<BookingSummary[]>("/bookings"),
        listMy: () => request<BookingSummary[]>("/bookings/my"),
        create: (payload: BookingPayload) =>
            request<BookingSummary>("/bookings", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        cancel: (id: number) =>
            request<void>(`/bookings/${id}`, {
                method: "DELETE",
            }),
    },
    users: {
        list: () => request<User[]>("/users"),
        delete: (id: number) =>
            request<void>(`/users/${id}`, {
                method: "DELETE",
            }),
        updateRole: (id: number, role: "ADMIN" | "USER") =>
            request<void>(`/users/${id}/role`, {
                method: "PATCH",
                body: JSON.stringify({ role }),
            }),
    },
};
