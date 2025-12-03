"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { BookingSummary, Room, User } from "@/types";

export default function AdminDashboard() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"ROOMS" | "USERS" | "BOOKINGS">(
        "ROOMS"
    );

    const [bookings, setBookings] = useState<BookingSummary[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
    const [roomName, setRoomName] = useState("");
    const [roomCapacity, setRoomCapacity] = useState("");

    useEffect(() => {
        const token = Cookies.get("room_token");
        if (!token) {
            router.push("/login");
            return;
        }

        async function fetchAllData() {
            try {
                const headers = { Authorization: `Bearer ${token}` };

                const [resRooms, resBookings, resUsers] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
                        headers,
                        cache: "no-store",
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
                        headers,
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
                        headers,
                    }),
                ]);

                if (resRooms.ok) setRooms(await resRooms.json());
                if (resBookings.ok) setBookings(await resBookings.json());

                if (resUsers.ok) {
                    setUsers(await resUsers.json());
                } else if (resUsers.status === 403 || resUsers.status === 401) {
                    setFeedback({
                        text: "Acesso limitado. Algumas funções requerem admin.",
                        type: "error",
                    });
                }
            } catch (err) {
                setFeedback({
                    text: "Erro de conexão com o servidor.",
                    type: "error",
                });
            } finally {
                setLoading(false);
            }
        }

        fetchAllData();
    }, [router]);

    function handleTabChange(tab: "ROOMS" | "USERS" | "BOOKINGS") {
        setActiveTab(tab);
        setFeedback(null);
        setIsFormOpen(false);
    }

    function openEditRoom(room: Room) {
        setEditingRoomId(room.id);
        setRoomName(room.name);
        setRoomCapacity(String(room.capacity));
        setIsFormOpen(true);
        setFeedback(null);
    }

    async function handleSaveRoom(e: React.FormEvent) {
        e.preventDefault();
        setFeedback(null);
        const token = Cookies.get("room_token");
        const isEditing = editingRoomId !== null;

        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_URL}/rooms/${editingRoomId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/rooms`;

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: roomName,
                    capacity: Number(roomCapacity),
                }),
            });

            if (res.ok) {
                const savedRoom = await res.json();
                if (isEditing) {
                    setRooms(
                        rooms.map((r) =>
                            r.id === editingRoomId ? savedRoom : r
                        )
                    );
                    setFeedback({
                        text: "Sala atualizada com sucesso!",
                        type: "success",
                    });
                } else {
                    setRooms([...rooms, savedRoom]);
                    setFeedback({
                        text: "Sala criada com sucesso!",
                        type: "success",
                    });
                }

                setEditingRoomId(null);
                setRoomName("");
                setRoomCapacity("");
                setIsFormOpen(false);
            } else {
                setFeedback({
                    text: "Erro ao salvar sala. Verifique permissões.",
                    type: "error",
                });
            }
        } catch (error) {
            setFeedback({ text: "Erro de rede.", type: "error" });
        }
    }

    async function handleDeleteRoom(id: number) {
        if (!confirm("Tem certeza? Isso pode apagar histórico de reservas!"))
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
                setFeedback({ text: "Sala excluída.", type: "success" });
            } else {
                setFeedback({ text: "Erro ao excluir sala.", type: "error" });
            }
        } catch (error) {
            setFeedback({ text: "Erro de rede.", type: "error" });
        }
    }

    async function handleDeleteUser(id: number) {
        if (!confirm("Banir este usuário permanentemente?")) return;
        const token = Cookies.get("room_token");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.ok) {
                setUsers(users.filter((u) => u.id !== id));
                setFeedback({ text: "Usuário removido.", type: "success" });
            } else {
                setFeedback({
                    text: "Erro ao remover usuário.",
                    type: "error",
                });
            }
        } catch (error) {
            setFeedback({ text: "Erro de rede.", type: "error" });
        }
    }

    async function handlePromoteUser(id: number, currentRole: string) {
        const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
        if (!confirm(`Mudar permissão para ${newRole}?`)) return;

        const token = Cookies.get("room_token");
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ role: newRole }),
                }
            );

            if (res.ok) {
                setUsers(
                    users.map((u) =>
                        u.id === id ? { ...u, role: newRole } : u
                    )
                );
                setFeedback({
                    text: "Permissão alterada com sucesso!",
                    type: "success",
                });
            } else {
                setFeedback({
                    text: "Erro ao alterar permissão.",
                    type: "error",
                });
            }
        } catch (error) {
            setFeedback({ text: "Erro de rede.", type: "error" });
        }
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

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                Carregando painel...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">
                    Painel Administrativo
                </h1>

                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
                    <button
                        onClick={() => handleTabChange("ROOMS")}
                        className={`px-6 py-3 font-medium text-sm transition border-b-2 ${
                            activeTab === "ROOMS"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Salas
                    </button>
                    <button
                        onClick={() => handleTabChange("USERS")}
                        className={`px-6 py-3 font-medium text-sm transition border-b-2 ${
                            activeTab === "USERS"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Usuários
                    </button>
                    <button
                        onClick={() => handleTabChange("BOOKINGS")}
                        className={`px-6 py-3 font-medium text-sm transition border-b-2 ${
                            activeTab === "BOOKINGS"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Todas as Reservas
                    </button>
                </div>

                {feedback && (
                    <div
                        className={`p-4 rounded-lg mb-6 border ${
                            feedback.type === "success"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-red-50 text-red-700 border-red-100"
                        }`}
                    >
                        {feedback.text}
                    </div>
                )}

                {activeTab === "ROOMS" && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setIsFormOpen(!isFormOpen);
                                    setEditingRoomId(null);
                                    setRoomName("");
                                    setRoomCapacity("");
                                    setFeedback(null);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm"
                            >
                                {isFormOpen
                                    ? "Fechar Formulário"
                                    : "+ Nova Sala"}
                            </button>
                        </div>

                        {isFormOpen && (
                            <form
                                onSubmit={handleSaveRoom}
                                className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end animate-in fade-in"
                            >
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nome
                                    </label>
                                    <input
                                        required
                                        className="w-full border p-2 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={roomName}
                                        onChange={(e) =>
                                            setRoomName(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Capacidade
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full border p-2 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={roomCapacity}
                                        onChange={(e) =>
                                            setRoomCapacity(e.target.value)
                                        }
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded font-semibold w-full md:w-auto h-10 hover:bg-green-700 transition"
                                >
                                    {editingRoomId ? "Atualizar" : "Salvar"}
                                </button>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md transition"
                                >
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            {room.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Capacidade: {room.capacity}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditRoom(room)}
                                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition"
                                            title="Editar"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteRoom(room.id)
                                            }
                                            className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                                            title="Excluir"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {rooms.length === 0 && (
                                <p className="text-slate-500 col-span-3 text-center italic py-4">
                                    Nenhuma sala cadastrada.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "USERS" && (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Permissão
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50 transition"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === "ADMIN"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-3">
                                            <button
                                                onClick={() =>
                                                    handlePromoteUser(
                                                        user.id,
                                                        user.role
                                                    )
                                                }
                                                className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                            >
                                                {user.role === "ADMIN"
                                                    ? "Rebaixar"
                                                    : "Promover"}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(user.id)
                                                }
                                                className="text-red-600 hover:text-red-900 hover:underline"
                                            >
                                                Banir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- CONTEÚDO: RESERVAS --- */}
                {activeTab === "BOOKINGS" && (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Sala
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Início
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                        Fim
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center text-slate-500"
                                        >
                                            Nenhuma reserva encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                {booking.roomName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {booking.userName} <br />{" "}
                                                <span className="text-xs text-slate-400">
                                                    {booking.userEmail}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {formatDate(booking.startAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {formatDate(booking.endAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
