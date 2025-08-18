"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(""); // Estado para exibir mensagem
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token") || document.cookie.includes("token=");
            if (token) router.push("/");
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Armazena em ambos (cookie para middleware, localStorage para client-side)
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", data.access_token);
                }
                document.cookie = `token=${data.access_token}; path=/; max-age=3600`;

                setMessage("Redirecionando...");
                window.location.href = "/"; // Redirecionamento garantido
            } else {
                throw new Error(data.message || "Login falhou");
            }
        } catch (error) {
            setMessage((error as Error).message);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                {message && (
                    <div className="mb-4 text-green-600 font-semibold text-center">
                        {message}
                    </div>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border rounded mb-4"
                    required
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border rounded mb-4"
                    required
                />

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Entrar
                </button>

                <div className="flex justify-between mt-4 text-sm">
                    <a href="/register" className="text-blue-500 hover:underline">Criar conta</a>
                    <a href="/reset-password" className="text-blue-500 hover:underline">Esqueci a senha</a>
                </div>
            </form>
        </div>
    );
}
