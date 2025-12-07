"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    sub: string;
    role: string;
    exp: number;
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = Cookies.get("room_token");
        const hasToken = !!token;

        if (isLoggedIn !== hasToken) {
            setIsLoggedIn(hasToken);
        }

        if (token) {
            try {
                const decoded = jwtDecode<TokenPayload>(token);
                setIsAdmin(decoded.role === "ADMIN");
            } catch (error) {
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    }, [pathname, isLoggedIn]);

    function handleLogout() {
        Cookies.remove("room_token");
        setIsLoggedIn(false);
        setIsAdmin(false);
        router.push("/login");
        router.refresh();
    }

    if (pathname === "/login" || pathname === "/register") return null;

    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold text-white hover:text-indigo-400 transition tracking-tight flex items-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-indigo-500"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H18V3.75a.75.75 0 000 1.5H3zm3 16.5h12V3.75H6v15z"
                            clipRule="evenodd"
                        />
                        <path
                            fillRule="evenodd"
                            d="M6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 6.75zM6 10.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6 14.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z"
                            clipRule="evenodd"
                        />
                    </svg>
                    RoomScheduler
                </Link>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/my-bookings"
                                className="text-sm font-medium text-slate-300 hover:text-white transition"
                            >
                                Minhas Reservas
                            </Link>

                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="text-sm font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition shadow-sm border border-indigo-500"
                                >
                                    Painel Admin
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-400 hover:text-red-300 transition cursor-pointer"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-3 items-center">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-2"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition shadow-sm border border-indigo-500"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
