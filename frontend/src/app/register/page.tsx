"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role: "USER",
                    }),
                }
            );

            if (res.ok) {
                const data = await res.json();

                Cookies.set("room_token", data.token, { expires: 1 / 12 });

                router.push("/");
                router.refresh();
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Erro ao criar conta.");
            }
        } catch (err) {
            setError("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Crie sua conta
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Comece a reservar espaços hoje mesmo
                    </p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 bg-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 bg-white"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Criando..." : "Cadastrar"}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Já tem uma conta?{" "}
                    <Link
                        href="/login"
                        className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                    >
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}
