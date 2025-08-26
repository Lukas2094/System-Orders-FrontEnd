"use client";

import { useState, useEffect } from "react";

export default function UserModal({
    user,
    onClose,
    roles,
}: {
    user: any;
    onClose: () => void;
    roles: any[];
}) {
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState(user?.role?.id || "");

    // Se o usuário mudar, atualizar estados
    useEffect(() => {
        setName(user?.name || "");
        setEmail(user?.email || "");
        setRoleId(user?.role?.id || "");
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const method = user ? "PUT" : "POST";
        const url = user
            ? `http://localhost:3000/users/${user.id}`
            : `http://localhost:3000/auth/register`;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                password: password || undefined,
                roleId: Number(roleId),
            }),
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">
                    {user ? "Editar Usuário" : "Novo Usuário"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    {!user && (
                        <div>
                            <label className="block text-sm">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm">Role</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">Selecione...</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-400 text-white rounded cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}