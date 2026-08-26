"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { api, ApiError } from "@/services/api";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const rules = useMemo(() => {
        return [
            {
                label: "Mínimo de 8 caracteres",
                valid: password.length >= 8,
            },
            {
                label: "Uma letra maiúscula (A-Z)",
                valid: /[A-Z]/.test(password),
            },
            {
                label: "Uma letra minúscula (a-z)",
                valid: /[a-z]/.test(password),
            },
            {
                label: "Um número (0-9)",
                valid: /[0-9]/.test(password),
            },
            {
                label: "Um caractere especial (@, #, $, %, etc.)",
                valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            },
        ];
    }, [password]);

    const isPasswordValid = useMemo(() => {
        return rules.every((rule) => rule.valid);
    }, [rules]);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!isPasswordValid) {
            setError("Por favor, atenda a todos os requisitos de segurança da senha.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas digitadas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const data = await api.auth.register({
                name,
                email,
                password,
            });

            Cookies.set("room_token", data.token, { expires: 1 / 12 });

            router.push("/");
            router.refresh();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Erro de conexão.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        Crie sua conta
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Comece a reservar salas e gerenciar reuniões
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
                            placeholder="Ex: João da Silva"
                            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 bg-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            E-mail Corporativo
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="usuario@empresa.com"
                            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 bg-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">
                                Senha
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Digite sua senha"
                            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-900 bg-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {password.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 animate-in fade-in">
                            <p className="font-semibold text-slate-700 mb-1">Requisitos de segurança:</p>
                            {rules.map((rule, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {rule.valid ? (
                                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">
                                            ✓
                                        </span>
                                    ) : (
                                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                                            •
                                        </span>
                                    )}
                                    <span className={rule.valid ? "text-green-700 font-medium" : "text-slate-500"}>
                                        {rule.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Confirmar Senha
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Confirme sua senha"
                            className={`w-full border p-3 rounded-lg focus:ring-2 outline-none transition text-slate-900 bg-white ${
                                passwordsMismatch
                                    ? "border-red-400 focus:ring-red-400"
                                    : passwordsMatch
                                    ? "border-green-500 focus:ring-green-400"
                                    : "border-slate-300 focus:ring-indigo-500"
                            }`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {passwordsMismatch && (
                            <p className="text-red-600 text-xs mt-1.5 font-medium">
                                ⚠ As senhas não conferem.
                            </p>
                        )}
                        {passwordsMatch && (
                            <p className="text-green-600 text-xs mt-1.5 font-medium">
                                ✓ As senhas são iguais.
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200 font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isPasswordValid || !passwordsMatch}
                        className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {loading ? "Criando Conta..." : "Cadastrar"}
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
