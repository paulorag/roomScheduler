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
                Cookies.set("room_token", data.token, { expires: 1 / 12 });

                router.push("/");
            } else {
                setError("Email ou senha inválidos.");
            }
        } catch (err) {
            setError("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Acesso Restrito
                </h1>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full border p-2 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full border p-2 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
