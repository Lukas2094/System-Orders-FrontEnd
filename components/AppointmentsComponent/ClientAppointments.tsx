"use client";

import { useState } from "react";
import AppointmentModal from "./appointmentsModal";
import { api } from "@/utils/api";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

export default function ClientAppointments({
    initialAppointments,
}: {
    initialAppointments: any[];
}) {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);

    const STATUS_COLORS: Record<string, string> = {
        pendente: "bg-yellow-400",
        confirmado: "bg-green-500",
        cancelado: "bg-red-500",
    };

    const reloadAppointments = async () => {
        try {
            const res = await api.get("/appointments", {
                headers: { 'Cache-Control': 'no-store' }
            });
            setAppointments(res.data);
        } catch (error) {
            console.error("Erro ao carregar appointments:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Deseja realmente excluir este agendamento?")) return;

        try {
            await api.delete(`/appointments/${id}`);
            setAppointments(appointments.filter(a => a.id !== id));
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 inline-flex items-center">
                    📅 Lista de Agendamentos
                </h2>
                <button
                    onClick={() => {
                        setSelected(null);
                        setOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                    <FaPlus /> Novo Agendamento
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-600">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-4 py-3 text-center">ID</th>
                            <th className="px-4 py-3 text-center">Data</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Usuário</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-center">{appt.id}</td>
                                <td className="px-4 py-3 text-center">
                                    {new Date(appt.scheduled_date).toLocaleString("pt-BR")}
                                </td>
                                <td className="px-4 py-3 text-center flex items-center justify-center gap-2 mx-auto">
                                    <span
                                        className={`w-3 h-3 rounded-full ${STATUS_COLORS[appt.status] || "bg-gray-400"}`}
                                    />
                                    <span className="capitalize">{appt.status}</span>
                                </td>
                                <td className="px-4 py-3 text-center">{appt.user?.name}</td>
                                <td className="px-4 py-3 flex justify-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelected(appt);
                                            setOpen(true);
                                        }}
                                        className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
                                        title="Editar"
                                    >
                                        <FiEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(appt.id)}
                                        className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                        title="Excluir"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AppointmentModal
                open={open}
                onClose={() => setOpen(false)}
                appointment={selected || undefined}
                onSaved={reloadAppointments}
            />
        </div>

    );
}
