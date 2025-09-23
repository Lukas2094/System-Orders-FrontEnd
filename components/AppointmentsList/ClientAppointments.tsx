"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { io } from "socket.io-client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useToast } from "../Toast/Toast";
import AppointmentModal from "./appointmentsModal";

export default function ClientAppointments({ initialAppointments }: any) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket"],
    });

    socket.on("appointmentCreated", (appointment) => {
      setAppointments((prev: any) => [...prev, appointment]);
    });

    socket.on("appointmentUpdated", (appointment) => {
      setAppointments((prev: any) =>
        prev.map((a: any) => (a.id === appointment.id ? appointment : a))
      );
    });

    socket.on("appointmentDeleted", (id) => {
      setAppointments((prev: any[]) => prev.filter((a) => a.id !== id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleDateClick = (arg: any) => {
    setSelected({ scheduled_date: arg.dateStr });
    setOpen(true);
  };

  const handleEventClick = (info: any) => {
    const appt = appointments.find((a: any) => a.id === +info.event.id);
    setSelected(appt);
    setOpen(true);
  };

    const handleEventDrop = async (info: any) => {
    const id = info.event.id;
    const newDate = info.event.start;

    // ❌ Bloqueia datas anteriores à hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignora horário
    if (newDate < today) {
        showToast("Não é permitido mover para datas passadas.", "error");
        info.revert(); // volta o evento para a posição original
        return;
    }

    try {
        await api.put(`/appointments/${id}`, {
        scheduled_date: newDate,
        });

        setAppointments((prev: any) =>
        prev.map((a: any) =>
            a.id === +id ? { ...a, scheduled_date: newDate } : a
        )
        );

        showToast("Agendamento atualizado com sucesso!", "success");
    } catch (err) {
        console.error("Erro ao mover evento:", err);
        showToast("Erro ao atualizar agendamento.", "error");
        info.revert(); // volta se falhar
    }
    };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📅 Agenda
        </h2>

        <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={appointments.map((a: any) => ({
            id: a.id.toString(),
            title: a.user?.name || "Usuário",
            extendedProps: {
            status: a.status,
            date: new Date(a.scheduled_date).toLocaleDateString("pt-BR"),
            time: new Date(a.scheduled_date).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            },
            start: a.scheduled_date,
            backgroundColor:
            a.status === "pendente"
                ? "#facc15"
                : a.status === "confirmado"
                ? "#22c55e"
                : a.status === "cancelado"
                ? "#ef4444"
                : "#3b82f6",
            }))}
            eventContent={(arg) => {
            const { status, date, time } = arg.event.extendedProps as any;

            const STATUS_COLORS: Record<string, string> = {
                pendente: "#facc15",
                confirmado: "#22c55e",
                cancelado: "#ef4444",
                completado: "#3b82f6",
            };

            return (
                <div className="flex flex-col text-xs p-1 leading-tight">
                <span className="font-semibold text-[13px]">{arg.event.title}</span>
                <span className="flex items-center gap-1 text-[12px] text-gray-700 capitalize">
                    <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: STATUS_COLORS[status] || "#ccc" }}
                    />
                    {status}
                </span>
                <span className="text-[12px] text-gray-500">
                    {date} {time}
                </span>
                </div>
            );
            }}
        dateClick={(info) => {
            const hasEvent = appointments.some(
            (a: any) =>
                new Date(a.scheduled_date).toDateString() ===
                info.date.toDateString()
            );

            if (!hasEvent) {
            setSelected({ scheduled_date: info.dateStr });
            setOpen(true);
            }
        }}
        eventClick={(info) => {
            const appt = appointments.find((a: any) => a.id === +info.event.id);
            if (appt) {
            setSelected(appt);
            setOpen(true);
            }
        }}
        editable={true}
        eventDrop={handleEventDrop}
        height="80vh"
        />


        <AppointmentModal
            open={open}
            onClose={() => setOpen(false)}
            appointment={selected || undefined}
        />
    </div>
  );
}
