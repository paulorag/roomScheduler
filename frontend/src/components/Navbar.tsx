"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = Cookies.get("room_token");
        const hasToken = !!token;

        if (isLoggedIn !== hasToken) {
            setIsLoggedIn(hasToken);
        }
    }, [pathname, isLoggedIn]);

    function handleLogout() {
        Cookies.remove("room_token");
        setIsLoggedIn(false);
        router.push("/login");
        router.refresh();
    }

    if (pathname === "/login" || pathname === "/register") return null;

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition tracking-tight"
                >
                    RoomScheduler
                </Link>

                {/* Ações */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/admin"
                                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
                            >
                                Painel Admin
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-600 hover:text-red-800 transition cursor-pointer"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-3 items-center">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition px-3 py-2"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
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
