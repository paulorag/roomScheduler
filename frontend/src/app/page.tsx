"use client";

import { useEffect, useState } from "react";
import BookingForm from "@/components/BookingForm";
import { Room } from "@/types";

export default function Home() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRooms() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/rooms`,
                    {
                        cache: "no-store",
                    }
                );
                if (res.ok) {
                    setRooms(await res.json());
                }
            } catch (error) {
                console.error("Erro ao buscar salas", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRooms();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-slate-500 font-medium animate-pulse">
                    Carregando espaços...
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100">
            {/* --- HERO SECTION --- */}
            <section className="bg-slate-900 py-20 md:py-32 text-center px-4 shadow-xl border-b border-slate-800 relative overflow-hidden">
                {/* Efeito de fundo sutil (opcional) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        Agende seu espaço com{" "}
                        <span className="text-indigo-500">inteligência</span>.
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        O sistema corporativo definitivo para evitar conflitos
                        de horário e garantir que sua equipe tenha o lugar
                        perfeito para colaborar.
                    </p>

                    <div className="flex justify-center gap-4">
                        <a
                            href="#salas"
                            className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-full hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/50 cursor-pointer transform hover:-translate-y-1"
                        >
                            Ver Salas Disponíveis
                        </a>
                    </div>
                </div>
            </section>

            {/* --- SEÇÃO DE DIFERENCIAIS (Conteúdo Novo) --- */}
            <section className="py-16 px-6 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                Sem Conflitos
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Algoritmo inteligente que impede reservas
                                duplicadas no mesmo horário.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                Seguro
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Controle de acesso rigoroso para garantir que
                                apenas autorizados reservem.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                Responsivo
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Acesse e reserve de qualquer dispositivo, seja
                                desktop ou mobile.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- LISTA DE SALAS (ID para Scroll) --- */}
            <section id="salas" className="max-w-7xl mx-auto py-16 px-6">
                <div className="flex items-center justify-between mb-8 border-l-4 border-indigo-600 pl-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Espaços Disponíveis
                    </h2>
                    <span className="text-slate-500 text-sm">
                        {rooms.length} salas encontradas
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 group"
                        >
                            {/* Cabeçalho do Card */}
                            <div className="bg-slate-50 p-5 border-b border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                    {room.name}
                                </h3>
                            </div>

                            {/* Corpo do Card */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-slate-600 mb-8 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-200">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">
                                        Capacidade: {room.capacity}
                                    </span>
                                </div>

                                <BookingForm
                                    roomId={room.id}
                                    roomName={room.name}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
