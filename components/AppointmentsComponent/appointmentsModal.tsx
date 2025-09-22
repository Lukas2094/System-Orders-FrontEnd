"use client";

import { useState, useEffect } from "react";

interface AppointmentModalProps {
    open: boolean;
    onClose: () => void;
    appointment?: any; // se vier preenchido, é edição
    onSaved: () => void; // callback para recarregar a lista
}

const STATUS_OPTIONS = ["pendente", "confirmado", "cancelado" , "concluido"];

export default function AppointmentModal({
    open,
    onClose,
    appointment,
    onSaved,
}: AppointmentModalProps) {
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState(STATUS_OPTIONS[0]);

    useEffect(() => {
        if (appointment) {
            setDate(appointment.scheduled_date?.slice(0, 16) || "");
            setNotes(appointment.notes || "");
            setStatus(appointment.status || STATUS_OPTIONS[0]);
        } else {
            setDate("");
            setNotes("");
            setStatus(STATUS_OPTIONS[0]);
        }
    }, [appointment]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const method = appointment ? "PUT" : "POST";
        const url = appointment
            ? `${process.env.NEXT_PUBLIC_API_URL}/appointments/${appointment.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/appointments`;

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                scheduled_date: date,
                notes,
                status, // adiciona o status
                user_id: appointment?.user_id || 1, // ⚠️ ajustar para pegar usuário logado
            }),
        });

        if (res.ok) {
            onSaved();
            onClose();
        } else {
            alert("Erro ao salvar agendamento");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {appointment ? "Editar Agendamento" : "Novo Agendamento"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border px-3 py-2 rounded-md w-full"
                    />
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="border px-3 py-2 rounded-md w-full"
                        placeholder="Notas do agendamento"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border px-3 py-2 rounded-md w-full"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};