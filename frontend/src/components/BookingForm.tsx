"use client";

import { useState } from "react";

interface BookingFormProps {
    roomId: number;
}

export default function BookingForm({ roomId }: BookingFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleReserve(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setIsSuccess(false);

        try {
            console.log("--- INICIANDO RESERVA ---");

            const payload = {
                roomId,
                startAt: startAt + ":00",
                endAt: endAt + ":00",
            };

            console.log("Payload enviado:", payload);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            console.log("Status da resposta:", res.status);

            let data = null;
            try {
                const text = await res.text();
                console.log("Corpo da resposta (Raw):", text);
                data = text ? JSON.parse(text) : {};
            } catch (jsonError) {
                console.error("Erro ao fazer parse do JSON:", jsonError);
                data = {
                    error: "Erro inesperado no formato da resposta do servidor.",
                };
            }

            if (res.ok) {
                setIsSuccess(true);
                setMessage("Reserva realizada com sucesso!");
                setTimeout(() => {
                    setIsOpen(false);
                    setStartAt("");
                    setEndAt("");
                    setMessage("");
                }, 2000);
            } else {
                setIsSuccess(false);
                console.log("Tratando erro...", data);

                let errorMsg = "Ocorreu um erro desconhecido.";

                if (data.error) {
                    errorMsg = data.error;
                } else if (typeof data === "string") {
                    errorMsg = data;
                } else if (Object.keys(data).length > 0) {
                    const firstError = Object.values(data)[0];
                    if (typeof firstError === "string") {
                        errorMsg = firstError;
                    } else {
                        errorMsg = JSON.stringify(data);
                    }
                }

                setMessage(`Atenção: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Erro crítico no frontend:", error);
            setMessage("Erro de conexão. Verifique se o backend está rodando.");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
                Reservar
            </button>
        );
    }

    return (
        <form
            onSubmit={handleReserve}
            className="mt-4 p-4 bg-gray-50 rounded border border-blue-100"
        >
            <h3 className="font-bold text-sm mb-2 text-gray-700">
                Nova Reserva
            </h3>

            <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-1">
                    Início
                </label>
                <input
                    type="datetime-local"
                    required
                    className="w-full border p-2 rounded text-sm focus:outline-blue-500"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Fim</label>
                <input
                    type="datetime-local"
                    required
                    className="w-full border p-2 rounded text-sm focus:outline-blue-500"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                />
            </div>

            {/* Área de Mensagens - Renderização Condicional Protegida */}
            {message && (
                <div
                    className={`p-2 mb-3 rounded text-sm font-medium ${
                        isSuccess
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {message}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                    {loading ? "Processando..." : "Confirmar"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(false);
                        setMessage("");
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-400 font-semibold"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
