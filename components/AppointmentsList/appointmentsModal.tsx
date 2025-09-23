"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useToast } from "../Toast/Toast";

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment?: any;
  onSaved?: () => void; 
}

const STATUS_OPTIONS = ["pendente", "confirmado", "cancelado", "completado"];

function decodeJwt(token: string | null) {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}

export default function AppointmentModal({
  open,
  onClose,
  appointment,
  onSaved,
}: AppointmentModalProps) {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (appointment) {
    const d = new Date(appointment.scheduled_date);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setDate(localIso);
    setNotes(appointment.notes ?? "");
    setStatus(appointment.status ?? STATUS_OPTIONS[0]);
    } else {
    setDate("");
    setNotes("");
    setStatus(STATUS_OPTIONS[0]);
    }
  }, [appointment]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const decoded = decodeJwt(token);
      const userIdFromToken = decoded?.sub;

      // monta payload usando ISO string (server espera ISO)
      const payload: any = {
        scheduled_date: date ? new Date(date).toISOString() : null,
        notes,
        status,
      };

      // se for criação, atribuímos user_id pelo token (se existir)
      if (!appointment) {
        if (userIdFromToken) payload.user_id = userIdFromToken;
      } else {
        // edição: se appointment já tem user_id, preserve; senão use token
        payload.user_id = userIdFromToken;
      }

      if (appointment && appointment.id) {
        // PUT (editar)
        await api.put(`/appointments/${appointment.id}`, payload);
        showToast("Agendamento atualizado com sucesso!", "success");
      } else {
        // POST (criar)
        await api.post(`/appointments`, payload);
        showToast("Agendamento criado com sucesso!", "success");
      }

      // opcional: callback para recarregar a lista (se você passar)
      if (typeof onSaved === "function") {
        try {
          await onSaved();
        } catch {
          // ignore
        }
      }

      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar agendamento:", err);
      // tenta mostrar mensagem do backend se existir
      const message = err?.response?.data?.message ?? "Erro ao salvar agendamento.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {appointment ? "Editar Agendamento" : "Novo Agendamento"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Data e hora
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 border px-3 py-2 rounded-md w-full"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Notas
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 border px-3 py-2 rounded-md w-full"
              placeholder="Notas do agendamento"
              rows={4}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 border px-3 py-2 rounded-md w-full"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md cursor-pointer bg-red-600 text-white hover:bg-red-700 font-bold"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`px-4 py-2 rounded-md cursor-pointer text-white font-bold ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={loading}
            >
              {loading ? (appointment ? "Salvando..." : "Criando...") : appointment ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
