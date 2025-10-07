"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useToast } from "../Toast/Toast";
import { IoMdClose } from "react-icons/io";

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

      const payload: any = {
        scheduled_date: date ? new Date(date).toISOString() : null,
        notes,
        status,
      };

      if (!appointment) {
        if (userIdFromToken) payload.user_id = userIdFromToken;
      } else {
        payload.user_id = userIdFromToken;
      }

      if (appointment && appointment.id) {
        await api.put(`/appointments/${appointment.id}`, payload);
        showToast("Agendamento atualizado com sucesso!", "success");
      } else {
        await api.post(`/appointments`, payload);
        showToast("Agendamento criado com sucesso!", "success");
      }

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
      const message = err?.response?.data?.message ?? "Erro ao salvar agendamento.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md lg:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <IoMdClose size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 lg:space-y-6">
          {/* Data e Hora */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
              required
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base resize-none"
              placeholder="Notas do agendamento"
              rows={4}
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors cursor-pointer text-sm lg:text-base order-2 sm:order-1 w-full sm:w-auto"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-white font-medium transition-colors cursor-pointer text-sm lg:text-base order-1 sm:order-2 w-full sm:w-auto ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {appointment ? "Salvando..." : "Criando..."}
                </span>
              ) : (
                appointment ? "Salvar" : "Criar Agendamento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}