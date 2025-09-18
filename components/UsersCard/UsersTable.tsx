"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import UserModal from "./UsersModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { api } from "@/utils/api";
import { useRole } from "@/utils/RoleContext";

type UserTableProps = {
    users: any[];
    roles: any[];
    loggedUser?: any;
};

const socket = io(api.defaults.baseURL, {
    transports: ["websocket"],
});

export default function UsersTable({ users, roles, loggedUser }: UserTableProps) {
    const [userList, setUserList] = useState(users);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setRole, setNameContext } = useRole();
    
    useEffect(() => {
        socket.on("userCreated", (newUser) => setUserList((prev) => [...prev, newUser]));
        socket.on("userUpdated", (updatedUser) => {
            setUserList((prev) =>
                prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            );
    
            if (loggedUser?.sub === updatedUser.id) {
                setRole(updatedUser.role);
                setNameContext(updatedUser.name);
            }
        });
        socket.on("userDeleted", (userId) =>
            setUserList((prev) => prev.filter((u) => u.id !== userId))
        );
        return () => {
            socket.off("userCreated");
            socket.off("userUpdated");
            socket.off("userDeleted");
        };
    }, []);

    const deleteUser = async (id: number) => {
        try {
            await api.delete(`/users/${id}`);
            setUserList((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error("Erro ao deletar usuário:", err);
            alert("Não foi possível deletar o usuário.");
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={() => {
                    setSelectedUser(null);
                    setIsModalOpen(true);
                }}
                className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg flex items-center gap-2"
            >
                Novo Usuário
            </button>

            <div className="overflow-x-auto shadow rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {userList.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.phone ?? "Sem Telefone"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.role?.name.toUpperCase() || "—"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                                    <button
                                        onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                        className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded text-white transition"
                                        title="Editar"
                                    >
                                        <FaEdit size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user.id)}
                                        className="bg-red-600 hover:bg-red-700 p-2 rounded text-white transition"
                                        title="Excluir"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <UserModal user={selectedUser} roles={roles} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}