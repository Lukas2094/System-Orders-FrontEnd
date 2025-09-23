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
        await api.delete(`/appointments/${info.event.id}`);

        // 🔥 Atualiza localmente também (feedback imediato)
        setAppointments((prev: any[]) =>
          prev.filter((a) => a.id !== info.event.id)
        );

        showToast("Agendamento excluído com sucesso!", "success");
      } catch (err) {
        console.error(err);
        showToast("Erro ao excluir agendamento.", "error");
        info.revert();
      }
    }
  };


  return (
    <div className="relative bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Agenda</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        droppable={true}
        selectable={true} // 🔥 habilita seleção de dias
        select={(info) => {
          // só abre se não tiver evento nesse dia
          const hasEvent = appointments.some(
            (a: any) =>
              new Date(a.scheduled_date).toDateString() ===
              new Date(info.start).toDateString()
          );

          if (!hasEvent) {
            setSelected({ scheduled_date: info.startStr });
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
        eventDrop={handleEventDrop}
        eventDragStop={handleEventDragStop}
        height="80vh"
      />


      {/* 🔴 Lixeira fixa */}
      <div
        id="trash"
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-500 text-white rounded-full 
                   flex items-center justify-center shadow-lg cursor-pointer z-50 
                   hover:bg-red-600 transition"
      >
        🗑️
      </div>

      <AppointmentModal
        open={open}
        onClose={() => setOpen(false)}
        appointment={selected || undefined}
      />
    </div>
  );
}