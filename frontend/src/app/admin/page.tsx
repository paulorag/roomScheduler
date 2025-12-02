"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { BookingSummary } from "@/types";

export default function AdminDashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState<BookingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomCapacity, setNewRoomCapacity] = useState("");
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    async function handleCreateRoom(e: React.FormEvent) {
        e.preventDefault();
        const token = Cookies.get("room_token");

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: newRoomName,
                capacity: Number(newRoomCapacity),
            }),
        });

        // Limpa e recarrega (o ideal seria atualizar o state, mas reload funciona pro MVP)
        setIsCreatingRoom(false);
        setNewRoomName("");
        setNewRoomCapacity("");
        window.location.reload();
    }

    useEffect(() => {
        const token = Cookies.get("room_token");
        if (!token) {
            router.push("/login");
            return;
        }

        async function fetchBookings() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                } else if (res.status === 403 || res.status === 401) {
                    setError("Sessão expirada ou sem permissão.");
                    router.push("/login");
                } else {
                    setError("Erro ao carregar reservas.");
                }
            } catch (err) {
                setError("Erro de conexão com o servidor.");
            } finally {
                setLoading(false);
            }
        }

        fetchBookings();
    }, [router]);

    function formatDate(isoString: string) {
        return new Date(isoString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                Carregando painel...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Painel Administrativo
                    </h1>
                    <button
                        onClick={() => {
                            Cookies.remove("room_token");
                            router.push("/login");
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                        Sair (Logout)
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setIsCreatingRoom(!isCreatingRoom)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer font-medium"
                    >
                        + Nova Sala
                    </button>
                </div>

                {isCreatingRoom && (
                    <form
                        onSubmit={handleCreateRoom}
                        className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 flex gap-4 items-end"
                    >
                        <div className="flex-1">
                            <label className="block text-sm text-slate-600 mb-1">
                                Nome da Sala
                            </label>
                            <input
                                required
                                className="w-full border p-2 rounded bg-white text-slate-900"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm text-slate-600 mb-1">
                                Capacidade
                            </label>
                            <input
                                type="number"
                                required
                                className="w-full border p-2 rounded bg-white text-slate-900"
                                value={newRoomCapacity}
                                onChange={(e) =>
                                    setNewRoomCapacity(e.target.value)
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 h-10 cursor-pointer"
                        >
                            Salvar
                        </button>
                    </form>
                )}

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sala
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reservado Por
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Início
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fim
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        Nenhuma reserva encontrada.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {booking.roomName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{booking.userName}</div>
                                            <div className="text-xs text-gray-400">
                                                {booking.userEmail}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(booking.startAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(booking.endAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
