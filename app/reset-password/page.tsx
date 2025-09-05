"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("http://localhost:3000/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            alert("Se este email existir, você receberá instruções de redefinição.");
        } else {
            alert("Erro ao solicitar redefinição.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleReset} className="bg-white p-8 rounded-2xl shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Redefinir Senha</h2>

                <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border rounded mb-4"
                    required
                />

                <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
                    Enviar Link
                </button>

                <div className="text-center mt-4 text-sm">
                    <a href="/login" className="text-blue-500 hover:underline">Voltar ao login</a>
                </div>
            </form>
        </div>
    );
}
