"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { BookingSummary, Room } from "@/types";

export default function AdminDashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState<BookingSummary[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomCapacity, setNewRoomCapacity] = useState("");
    const [createMsg, setCreateMsg] = useState("");

    useEffect(() => {
        const token = Cookies.get("room_token");
        if (!token) {
            router.push("/login");
            return;
        }

        async function fetchData() {
            try {
                const [resBookings, resRooms] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                    }),
                ]);

                if (resBookings.ok && resRooms.ok) {
                    const bookingsData = await resBookings.json();
                    const roomsData = await resRooms.json();
                    setBookings(bookingsData);
                    setRooms(roomsData);
                } else if (
                    resBookings.status === 403 ||
                    resBookings.status === 401
                ) {
                    setError("Acesso negado. Você precisa ser ADMIN.");
                } else {
                    setError("Erro ao carregar dados do servidor.");
                }
            } catch (err) {
                setError("Erro de conexão. Verifique o backend.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [router]);

    async function handleCreateRoom(e: React.FormEvent) {
        e.preventDefault();
        setCreateMsg("");
        const token = Cookies.get("room_token");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/rooms`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: newRoomName,
                        capacity: Number(newRoomCapacity),
                    }),
                }
            );

            if (res.ok) {
                const createdRoom = await res.json();
                setCreateMsg("Sala criada com sucesso!");
                setRooms([...rooms, createdRoom]);
                setNewRoomName("");
                setNewRoomCapacity("");
                setTimeout(() => {
                    setIsCreatingRoom(false);
                    setCreateMsg("");
                }, 1500);
            } else {
                setCreateMsg("Erro ao criar sala. Verifique permissões.");
            }
        } catch (error) {
            setCreateMsg("Erro de conexão.");
        }
    }

    async function handleDeleteRoom(id: number) {
        if (!confirm("Tem certeza? Isso pode afetar o histórico de reservas."))
            return;

        const token = Cookies.get("room_token");
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.ok || res.status === 204) {
                setRooms(rooms.filter((r) => r.id !== id));
            } else {
                alert("Erro ao deletar sala.");
            }
        } catch (error) {
            alert("Erro de conexão.");
        }
    }

    // Helper de Data
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
            <div className="p-8 text-center text-slate-500">
                Carregando painel...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Painel Administrativo
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <section className="mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-xl font-bold text-slate-700">
                            Gerenciar Salas
                        </h2>
                        {!isCreatingRoom && (
                            <button
                                onClick={() => setIsCreatingRoom(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm font-medium text-sm flex items-center gap-2"
                            >
                                <span>+</span> Nova Sala
                            </button>
                        )}
                    </div>

                    {isCreatingRoom && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in fade-in slide-in-from-top-2">
                            <form
                                onSubmit={handleCreateRoom}
                                className="flex flex-col md:flex-row gap-4 items-end"
                            >
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nome
                                    </label>
                                    <input
                                        required
                                        className="w-full border border-slate-300 p-2.5 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Ex: Sala VIP"
                                        value={newRoomName}
                                        onChange={(e) =>
                                            setNewRoomName(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Capacidade
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-slate-300 p-2.5 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Ex: 10"
                                        value={newRoomCapacity}
                                        onChange={(e) =>
                                            setNewRoomCapacity(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                        type="submit"
                                        className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-semibold flex-1"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingRoom(false)}
                                        className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-200 font-semibold"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                            {createMsg && (
                                <p className="mt-3 text-sm text-green-600 font-medium">
                                    {createMsg}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center group"
                            >
                                <div>
                                    <p className="font-bold text-slate-800">
                                        {room.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Capacidade: {room.capacity} pessoas
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition"
                                    title="Excluir Sala"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {rooms.length === 0 && (
                            <p className="text-slate-500 text-sm italic">
                                Nenhuma sala cadastrada.
                            </p>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-700 mb-4">
                        Todas as Reservas
                    </h2>
                    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Sala
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Quem Reservou
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Início
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Fim
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center text-slate-500"
                                        >
                                            Nenhuma reserva encontrada no
                                            sistema.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {booking.roomName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                <div className="font-medium">
                                                    {booking.userName}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {booking.userEmail}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {formatDate(booking.startAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {formatDate(booking.endAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
