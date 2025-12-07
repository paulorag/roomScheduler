"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { BookingSummary } from "@/types";

export default function MyBookings() {
    const router = useRouter();
    const [bookings, setBookings] = useState<BookingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = Cookies.get("room_token");
        if (!token) {
            router.push("/login");
            return;
        }

        async function fetchMyBookings() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/bookings/my`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (res.ok) {
                    setBookings(await res.json());
                } else {
                    setError("Erro ao carregar suas reservas.");
                }
            } catch (err) {
                setError("Erro de conexão.");
            } finally {
                setLoading(false);
            }
        }
        fetchMyBookings();
    }, [router]);

    async function handleCancel(id: number) {
        if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;
        setSuccess("");
        setError("");

        const token = Cookies.get("room_token");
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.ok) {
                setBookings(bookings.filter((b) => b.id !== id));
                setSuccess("Reserva cancelada com sucesso.");
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Não foi possível cancelar.");
            }
        } catch (err) {
            setError("Erro de rede.");
        }
    }

    function canCancel(startAt: string): boolean {
        const now = new Date();
        const bookingStart = new Date(startAt);
        const diffInHours =
            (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffInHours >= 24;
    }

    function formatDate(isoString: string) {
        return new Date(isoString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (loading)
        return (
            <div className="p-8 text-center text-slate-500">Carregando...</div>
        );

    return (
        <main className="min-h-screen py-8 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Minhas Reservas
                </h1>
                <p className="text-slate-500 mb-8">
                    Gerencie seus agendamentos futuros.
                </p>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 text-sm text-blue-800 flex gap-2 shadow-sm">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 flex-shrink-0"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>
                        Política de Cancelamento: Reservas só podem ser
                        canceladas com <strong>24 horas de antecedência</strong>
                        .
                    </span>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-4 border border-red-200 shadow-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-4 border border-green-200 shadow-sm">
                        {success}
                    </div>
                )}

                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-md border border-slate-200 text-center">
                            <p className="text-slate-500">
                                Você ainda não tem reservas.
                            </p>
                        </div>
                    ) : (
                        bookings.map((booking) => {
                            const isCancellable = canCancel(booking.startAt);
                            return (
                                <div
                                    key={booking.id}
                                    className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-lg transition-shadow duration-200"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">
                                            {booking.roomName}
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium text-xs">
                                                {formatDate(booking.startAt)}
                                            </span>
                                            até
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium text-xs">
                                                {
                                                    formatDate(
                                                        booking.endAt
                                                    ).split(" ")[1]
                                                }
                                            </span>
                                        </p>
                                    </div>

                                    {isCancellable ? (
                                        <button
                                            onClick={() =>
                                                handleCancel(booking.id)
                                            }
                                            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition text-sm font-medium cursor-pointer shadow-sm"
                                        >
                                            Cancelar Reserva
                                        </button>
                                    ) : (
                                        <span
                                            className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium border border-slate-200 cursor-not-allowed select-none"
                                            title="Menos de 24h para o início"
                                        >
                                            Não cancelável
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
