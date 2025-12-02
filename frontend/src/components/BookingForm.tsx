"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface BookingFormProps {
    roomId: number;
    roomName: string; // NOVO PROP para exibir o nome no modal
}

export default function BookingForm({ roomId, roomName }: BookingFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Inicia os inputs com a data/hora atual formatada para o datetime-local
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const defaultStart = now.toISOString().slice(0, 16);
    const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);

    const [startAt, setStartAt] = useState(defaultStart);
    const [endAt, setEndAt] = useState(defaultEnd);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);
    const router = useRouter();

    async function handleReserve(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const token = Cookies.get("room_token");
        if (!token) {
            setMessage({
                text: "Você precisa fazer login para reservar.",
                type: "error",
            });
            setTimeout(() => router.push("/login"), 1500);
            setLoading(false);
            return;
        }

        try {
            const payload = {
                roomId,
                startAt: startAt + ":00", // Adiciona segundos para o padrão ISO
                endAt: endAt + ":00",
            };

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            let data;
            try {
                data = await res.json();
            } catch (e) {
                data = null;
            }

            if (res.ok) {
                setMessage({
                    text: "Reserva confirmada com sucesso!",
                    type: "success",
                });
                setTimeout(() => {
                    setIsOpen(false);
                    setMessage(null);
                }, 2000);
            } else {
                // Tenta extrair a mensagem de erro mais amigável possível
                const errorMsg =
                    data?.error ||
                    data?.message ||
                    JSON.stringify(data) ||
                    "Erro ao realizar reserva.";
                setMessage({ text: errorMsg, type: "error" });
            }
        } catch (error) {
            setMessage({
                text: "Erro de conexão com o servidor.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    // Botão Inicial (Que abre o modal)
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                // MUDANÇA: Cor Indigo e estilo mais moderno
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition focus:ring-4 focus:ring-indigo-200"
            >
                Agendar Horário
            </button>
        );
    }

    // Modal do Formulário
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 bg-indigo-600">
                    <h3 className="text-lg font-bold text-white">
                        Nova Reserva
                    </h3>
                    <p className="text-indigo-100 text-sm">{roomName}</p>
                </div>

                <form onSubmit={handleReserve} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Início
                            </label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-600"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Fim
                            </label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-600"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`mt-6 p-4 rounded-lg text-sm text-center font-medium ${
                                message.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : "bg-red-50 text-red-700 border border-red-100"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setMessage(null);
                            }}
                            // Botão Cancelar mais discreto
                            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            // Botão Confirmar com a cor de destaque
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition font-semibold"
                        >
                            {loading ? "Confirmando..." : "Confirmar Reserva"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
