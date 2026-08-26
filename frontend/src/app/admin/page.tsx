"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { BookingSummary, Room, User } from "@/types";
import { api, ApiError } from "@/services/api";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminDashboard() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"ROOMS" | "USERS" | "BOOKINGS" | "ANALYTICS">("ROOMS");
    const [bookings, setBookings] = useState<BookingSummary[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    const [roomSearch, setRoomSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [bookingSearch, setBookingSearch] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
    const [roomName, setRoomName] = useState("");
    const [roomCapacity, setRoomCapacity] = useState("");

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        isDanger?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    useEffect(() => {
        const token = Cookies.get("room_token");
        if (!token) {
            router.push("/login");
            return;
        }

        async function fetchAllData() {
            try {
                const [resRooms, resBookings, resUsers] = await Promise.all([
                    api.rooms.list(),
                    api.bookings.listAll(),
                    api.users.list(),
                ]);

                setRooms(resRooms);
                setBookings(resBookings);
                setUsers(resUsers);
            } catch (err) {
                if (err instanceof ApiError) {
                    setFeedback({
                        text: err.message,
                        type: "error",
                    });
                } else {
                    setFeedback({
                        text: "Erro de conexão com o servidor.",
                        type: "error",
                    });
                }
            } finally {
                setLoading(false);
            }
        }
        fetchAllData();
    }, [router]);

    function handleTabChange(tab: "ROOMS" | "USERS" | "BOOKINGS" | "ANALYTICS") {
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
        const isEditing = editingRoomId !== null;

        try {
            if (isEditing) {
                const updated = await api.rooms.update(editingRoomId, {
                    name: roomName,
                    capacity: Number(roomCapacity),
                });
                setRooms(rooms.map((r) => (r.id === editingRoomId ? updated : r)));
                setFeedback({
                    text: "Sala atualizada com sucesso!",
                    type: "success",
                });
            } else {
                const created = await api.rooms.create({
                    name: roomName,
                    capacity: Number(roomCapacity),
                });
                setRooms([...rooms, created]);
                setFeedback({
                    text: "Sala criada com sucesso!",
                    type: "success",
                });
            }
            setEditingRoomId(null);
            setRoomName("");
            setRoomCapacity("");
            setIsFormOpen(false);
        } catch (error) {
            if (error instanceof ApiError) {
                setFeedback({ text: error.message, type: "error" });
            } else {
                setFeedback({ text: "Erro ao salvar sala.", type: "error" });
            }
        }
    }

    function requestDeleteRoom(id: number) {
        setModalConfig({
            isOpen: true,
            title: "Excluir Sala",
            message: "Tem certeza de que deseja excluir esta sala? Se houver reservas vinculadas, a exclusão será bloqueada.",
            confirmText: "Sim, Excluir",
            isDanger: true,
            onConfirm: async () => {
                setModalConfig((prev) => ({ ...prev, isOpen: false }));
                try {
                    await api.rooms.delete(id);
                    setRooms(rooms.filter((r) => r.id !== id));
                    setFeedback({ text: "Sala excluída com sucesso.", type: "success" });
                } catch (error) {
                    if (error instanceof ApiError) {
                        setFeedback({ text: error.message, type: "error" });
                    } else {
                        setFeedback({ text: "Erro ao excluir sala.", type: "error" });
                    }
                }
            },
        });
    }

    function requestDeleteUser(id: number) {
        setModalConfig({
            isOpen: true,
            title: "Banir Usuário",
            message: "Tem certeza de que deseja remover este usuário permanentemente do sistema?",
            confirmText: "Sim, Banir",
            isDanger: true,
            onConfirm: async () => {
                setModalConfig((prev) => ({ ...prev, isOpen: false }));
                try {
                    await api.users.delete(id);
                    setUsers(users.filter((u) => u.id !== id));
                    setFeedback({ text: "Usuário removido com sucesso.", type: "success" });
                } catch (error) {
                    if (error instanceof ApiError) {
                        setFeedback({ text: error.message, type: "error" });
                    } else {
                        setFeedback({ text: "Erro ao remover usuário.", type: "error" });
                    }
                }
            },
        });
    }

    function requestPromoteUser(id: number, currentRole: string) {
        const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
        setModalConfig({
            isOpen: true,
            title: "Alterar Permissão",
            message: `Deseja alterar o nível de permissão deste usuário para ${newRole}?`,
            confirmText: `Sim, mudar para ${newRole}`,
            isDanger: false,
            onConfirm: async () => {
                setModalConfig((prev) => ({ ...prev, isOpen: false }));
                try {
                    await api.users.updateRole(id, newRole);
                    setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
                    setFeedback({
                        text: "Permissão alterada com sucesso!",
                        type: "success",
                    });
                } catch (error) {
                    if (error instanceof ApiError) {
                        setFeedback({ text: error.message, type: "error" });
                    } else {
                        setFeedback({ text: "Erro ao alterar permissão.", type: "error" });
                    }
                }
            },
        });
    }

    function requestCancelBooking(id: number) {
        setModalConfig({
            isOpen: true,
            title: "Cancelar Reserva (Admin)",
            message: "Como Administrador, você pode cancelar qualquer reserva imediatamente. Confirmar cancelamento?",
            confirmText: "Sim, Cancelar Reserva",
            isDanger: true,
            onConfirm: async () => {
                setModalConfig((prev) => ({ ...prev, isOpen: false }));
                try {
                    await api.bookings.cancel(id);
                    setBookings(bookings.filter((b) => b.id !== id));
                    setFeedback({
                        text: "Reserva cancelada pelo administrador.",
                        type: "success",
                    });
                } catch (error) {
                    if (error instanceof ApiError) {
                        setFeedback({ text: error.message, type: "error" });
                    } else {
                        setFeedback({ text: "Erro ao cancelar reserva.", type: "error" });
                    }
                }
            },
        });
    }

    function exportBookingsCsv() {
        const headers = ["ID", "Sala", "Usuario", "Email", "Inicio", "Fim"];
        const rows = bookings.map((b) => [
            b.id,
            `"${b.roomName}"`,
            `"${b.userName}"`,
            `"${b.userEmail}"`,
            `"${b.startAt}"`,
            `"${b.endAt}"`,
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reservas_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportUsersCsv() {
        const headers = ["ID", "Nome", "Email", "Role"];
        const rows = users.map((u) => [
            u.id,
            `"${u.name}"`,
            `"${u.email}"`,
            `"${u.role}"`,
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `usuarios_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(roomSearch.toLowerCase())
    );

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.role.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredBookings = bookings.filter(
        (booking) =>
            booking.roomName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
            booking.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
            booking.userEmail.toLowerCase().includes(bookingSearch.toLowerCase())
    );

    // Analytics calculations
    const totalHoursBooked = bookings.reduce((acc, b) => {
        const start = new Date(b.startAt).getTime();
        const end = new Date(b.endAt).getTime();
        return acc + Math.max(0, (end - start) / (1000 * 60 * 60));
    }, 0);

    const roomBookingCounts: Record<string, number> = {};
    bookings.forEach((b) => {
        roomBookingCounts[b.roomName] = (roomBookingCounts[b.roomName] || 0) + 1;
    });

    if (loading)
        return (
            <div className="p-8 text-center text-slate-500">
                Carregando painel...
            </div>
        );

    return (
        <main className="min-h-screen py-8 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">
                    Painel Administrativo
                </h1>

                <div className="flex border-b border-slate-300 mb-8 overflow-x-auto">
                    {(["ROOMS", "USERS", "BOOKINGS", "ANALYTICS"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-6 py-3 font-medium text-sm transition border-b-2 cursor-pointer whitespace-nowrap ${
                                activeTab === tab
                                    ? "border-indigo-600 text-indigo-600 font-bold"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab === "ROOMS"
                                ? "Salas"
                                : tab === "USERS"
                                ? "Usuários"
                                : tab === "BOOKINGS"
                                ? "Todas as Reservas"
                                : "📈 Métricas & Ocupação"}
                        </button>
                    ))}
                </div>

                {feedback && (
                    <div
                        className={`p-4 rounded-lg mb-6 border animate-in fade-in slide-in-from-top-2 ${
                            feedback.type === "success"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                        {feedback.text}
                    </div>
                )}

                {activeTab === "ROOMS" && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Buscar salas por nome..."
                                className="w-full sm:w-72 border border-slate-300 px-3 py-2 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={roomSearch}
                                onChange={(e) => setRoomSearch(e.target.value)}
                            />

                            <button
                                onClick={() => {
                                    setIsFormOpen(!isFormOpen);
                                    setEditingRoomId(null);
                                    setRoomName("");
                                    setRoomCapacity("");
                                    setFeedback(null);
                                }}
                                className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm cursor-pointer shadow-sm transition"
                            >
                                {isFormOpen ? "Fechar Formulário" : "+ Nova Sala"}
                            </button>
                        </div>

                        {isFormOpen && (
                            <form
                                onSubmit={handleSaveRoom}
                                className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end animate-in fade-in"
                            >
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nome
                                    </label>
                                    <input
                                        required
                                        className="w-full border p-2 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Capacidade
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full border p-2 rounded text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={roomCapacity}
                                        onChange={(e) => setRoomCapacity(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded font-semibold w-full md:w-auto h-10 hover:bg-green-700 transition cursor-pointer"
                                >
                                    {editingRoomId ? "Atualizar" : "Salvar"}
                                </button>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex justify-between items-center hover:shadow-lg transition-shadow duration-200"
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
                                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition cursor-pointer"
                                            title="Editar"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => requestDeleteRoom(room.id)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded transition cursor-pointer"
                                            title="Excluir"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredRooms.length === 0 && (
                                <p className="text-slate-500 col-span-3 text-center italic py-4">
                                    Nenhuma sala encontrada.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "USERS" && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Buscar usuários por nome, email ou permissão..."
                                className="w-full sm:w-96 border border-slate-300 px-3 py-2 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />

                            <button
                                onClick={exportUsersCsv}
                                className="w-full sm:w-auto px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                                📊 Exportar CSV
                            </button>
                        </div>

                        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50/50">
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
                                    {filteredUsers.map((user) => (
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
                                                    onClick={() => requestPromoteUser(user.id, user.role)}
                                                    className="text-indigo-600 hover:text-indigo-900 hover:underline cursor-pointer"
                                                >
                                                    {user.role === "ADMIN" ? "Rebaixar" : "Promover"}
                                                </button>
                                                <button
                                                    onClick={() => requestDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-900 hover:underline cursor-pointer"
                                                >
                                                    Banir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "BOOKINGS" && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Buscar reservas por sala ou usuário..."
                                className="w-full sm:w-96 border border-slate-300 px-3 py-2 rounded-lg text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={bookingSearch}
                                onChange={(e) => setBookingSearch(e.target.value)}
                            />

                            <button
                                onClick={exportBookingsCsv}
                                className="w-full sm:w-auto px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                                📊 Exportar CSV
                            </button>
                        </div>

                        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50/50">
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
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredBookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                {booking.roomName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {booking.userName} <br />
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
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <button
                                                    onClick={() => requestCancelBooking(booking.id)}
                                                    className="text-red-600 hover:text-red-900 hover:underline cursor-pointer"
                                                >
                                                    Cancelar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredBookings.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                Nenhuma reserva encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "ANALYTICS" && (
                    <div className="space-y-8 animate-in fade-in">
                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <p className="text-sm font-medium text-slate-500">Total de Reservas</p>
                                <p className="text-3xl font-extrabold text-indigo-600 mt-2">{bookings.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <p className="text-sm font-medium text-slate-500">Salas Cadastradas</p>
                                <p className="text-3xl font-extrabold text-slate-800 mt-2">{rooms.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <p className="text-sm font-medium text-slate-500">Usuários Ativos</p>
                                <p className="text-3xl font-extrabold text-slate-800 mt-2">{users.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <p className="text-sm font-medium text-slate-500">Horas Reservadas</p>
                                <p className="text-3xl font-extrabold text-green-600 mt-2">{totalHoursBooked.toFixed(1)}h</p>
                            </div>
                        </div>

                        {/* Distribution and Ranking */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">
                                Utilização e Distribuição por Sala
                            </h3>

                            <div className="space-y-4">
                                {rooms.map((room) => {
                                    const count = roomBookingCounts[room.name] || 0;
                                    const percent = bookings.length > 0 ? (count / bookings.length) * 100 : 0;

                                    return (
                                        <div key={room.id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-slate-700">{room.name}</span>
                                                <span className="text-slate-500">{count} reserva(s) ({percent.toFixed(0)}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                {rooms.length === 0 && (
                                    <p className="text-slate-500 text-center py-4">Nenhuma sala para exibir métricas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                isDanger={modalConfig.isDanger}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
            />
        </main>
    );
}
