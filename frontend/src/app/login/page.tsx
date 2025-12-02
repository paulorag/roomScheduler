"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (res.ok) {
                const data = await res.json();
                Cookies.set("room_token", data.token, { expires: 1 / 12 }); // 2 horas
                router.push("/");
            } else {
                // Tenta ler a mensagem de erro do backend, se houver
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Credenciais inválidas.");
            }
        } catch (err) {
            console.error(err);
            setError(
                "Erro ao conectar com o servidor. Verifique se o backend está rodando."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        // Layout centralizado com fundo suave
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Acesse sua conta para gerenciar reservas
                    </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email Corporativo
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 bg-white"
                            placeholder="seu.nome@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 bg-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? "Autenticando..." : "Acessar Painel"}
                    </button>
                </form>
            </div>
        </div>
    );
}
