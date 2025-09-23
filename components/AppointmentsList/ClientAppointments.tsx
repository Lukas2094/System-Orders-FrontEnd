"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { io } from "socket.io-client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useToast } from "../Toast/Toast";
import AppointmentModal from "./appointmentsModal";
import { FaTrash, FaTrashAlt } from "react-icons/fa";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

export default function ClientAppointments({ initialAppointments }: any) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); 
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

    socket.on("appointmentDeleted", (data: any) => {
      if (!data) return;

      const deletedId = typeof data === "object" ? data.id : data;
      if (!deletedId) return;

      setAppointments((prev: any[]) => prev.filter((a: any) => a.id !== deletedId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleEventDrop = async (info: any) => {
    const id = info.event.id;
    const newDate = info.event.start;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate < today) {
      showToast("Não é permitido mover para datas passadas.", "error");
      info.revert();
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
      info.revert();
    }
  };

    const handleEventDragStop = async (info: any) => {
        const trashEl = document.getElementById("trash");
        const trashRect = trashEl?.getBoundingClientRect();
        if (!trashRect) return;

        const x = info.jsEvent.clientX;
        const y = info.jsEvent.clientY;

        const insideTrash =
          x >= trashRect.left &&
          x <= trashRect.right &&
          y >= trashRect.top &&
          y <= trashRect.bottom;

        if (insideTrash) {
          if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
            info.revert();
            return;
          }

          try {
            setIsDeleting(true); // 🔥 ativa animação
            await api.delete(`/appointments/${info.event.id}`);

            setAppointments((prev: any[]) =>
              prev.filter((a) => a.id !== +info.event.id)
            );

            info.event.remove();
            showToast("Agendamento excluído com sucesso!", "success");
          } catch (err) {
            console.error(err);
            showToast("Erro ao excluir agendamento.", "error");
            info.revert();
          } finally {
            setTimeout(() => setIsDeleting(false), 600); 
          }
        }
      };


  return (
    <div className="relative bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Agenda</h2>

      <FullCalendar
        key={appointments.length}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        droppable={true}
        locale={ptBrLocale}
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
              <span className="font-semibold text-[13px]">
                {arg.event.title}
              </span>
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
          setSelected({ scheduled_date: info.dateStr });
          setOpen(true);
        }}
        eventClick={(info) => {
          const appt = appointments.find((a: any) => a.id === +info.event.id);
          if (appt) {
            setSelected(appt);
            setOpen(true);
          }
        }}
        eventDrop={handleEventDrop}
        eventDragStop={handleEventDragStop}
        height="80vh"
      />


      {/* 🔴 Lixeira fixa */}
      <div
        id="trash"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          setIsDeleting(true);
          setTimeout(() => setIsDeleting(false), 1200);
        }}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-red-500 text-white rounded-full 
                  flex items-center justify-center shadow-lg cursor-pointer z-50 
                  hover:bg-red-600 transition
                  ${isDeleting ? "shake" : ""}`}
      >
        {isDeleting ? <FaTrashAlt size={28} /> : <FaTrash size={28} />}
      </div>

      <AppointmentModal
        open={open}
        onClose={() => setOpen(false)}
        appointment={selected || undefined}
      />
    </div>
  );
}