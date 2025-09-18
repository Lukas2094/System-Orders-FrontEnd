"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
    if (typeof window !== "undefined") {
        if (document.cookie.includes("token=")) {
        router.push("/");
        }
    }
    }, [router]);

    // const handleLogin = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     try {
    //         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             credentials: "include",
    //             body: JSON.stringify({ email, password }),
    //         });

    //         const data = await res.json();

    //        if (res.ok) {
    //             if (typeof window !== "undefined") {
    //                 localStorage.setItem("token", data.access_token);
    //             }
    //             document.cookie = `token=${data.access_token}; path=/; max-age=3600`;

    //             setMessage("Redirecionando...");
    //             window.location.href = "/";
    //         } else {
    //             throw new Error(data.message || "Login falhou");
    //         }
    //     } catch (error) {
    //         setMessage((error as Error).message);
    //     }
    // };

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const res = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password },
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, 
        }
        );

   
        const { access_token } = res.data;

        if (access_token) {

        document.cookie = `token=${access_token}; path=/; max-age=3600; Secure; SameSite=Strict`;

        setMessage("Redirecionando...");
        window.location.href = "/";
        }

    } catch (error: any) {
        setMessage(
        error.response?.data?.message || "Login falhou. Verifique suas credenciais."
        );
    }
    };

  
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white/90 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Bem-vindo 👋</h2>

                {message && (
                    <div className="mb-4 text-center text-sm font-medium text-green-600 bg-red-100 py-2 px-3 rounded-lg">
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleLogin(e as any);
                            }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer"
                    >
                        Entrar
                    </button>
                </form>

                <div className="flex justify-between mt-6 text-sm text-gray-600">
                    <a href="/register" className="hover:text-blue-600 transition">Criar conta</a>
                    <a href="/reset-password" className="hover:text-blue-600 transition">Esqueci a senha</a>
                </div>
            </div>
        </div>
    );
}