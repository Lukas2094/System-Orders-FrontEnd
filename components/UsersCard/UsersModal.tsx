"use client";

import { api } from "@/utils/api";
import { maskPhone, validateEmail } from "@/utils/functions/masks";
import { useRole } from "@/utils/RoleContext";
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
    const [phone, setPhone] = useState(user?.phone || "");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState(user?.role?.id || "");
    const { setRole, setNameContext } = useRole();

    useEffect(() => {
        setName(user?.name || "");
        setEmail(user?.email || "");
        setPhone(user?.phone || "");
        setRoleId(user?.role?.id || "");
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            alert("Email inválido!");
            return;
        }

        try {
            if (user) {
                // Atualizar usuário
                await api.put(`/users/${user.id}`, {
                    name,
                    email,
                    password: password || undefined,
                    phone,
                    roleId: Number(roleId),
                });
            } else {
                await api.post(`/auth/register`, {
                    name,
                    email,
                    password,
                    phone,
                    roleId: Number(roleId),
                });
            }

            const selectedRole = roles.find(r => r.id === Number(roleId));
            if (selectedRole) {
                setRole(selectedRole);
            }

            setNameContext(name);
            onClose();
        } catch (err: any) {
            console.error("Erro ao salvar usuário:", err);
            alert(err?.response?.data?.message || "Erro ao salvar usuário.");
        }
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
                            onBlur={() => {
                                if (!validateEmail(email)) alert("Email inválido!");
                            }}
                            required
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Telefone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(maskPhone(e.target.value))}
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
                                    {role.name.toUpperCase()}
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