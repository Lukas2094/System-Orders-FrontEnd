import DynamicMetadata from "@/components/SEO/Metadata";
import { api } from "@/utils/api";
import { cookies } from "next/headers";
import ClientAppointments from "@/components/AppointmentsComponent/ClientAppointments";

export default async function AppointmentsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await api.get("/appointments", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const appointments = res.data;

    return (
        <>
            <DynamicMetadata
                title="Gerenciamento de Agendamentos"
                description={`Sistema de Gerenciamento de Usuários com ${appointments.length} agendamentos cadastrados`}
                keywords={["usuarios", "gerenciamento", "agendamentos"]}
                ogImage="/usuarios-og-image.png"
            />

            {/* 🔹 Renderização SSR da lista + client component para modal */}
            <ClientAppointments initialAppointments={appointments} />
        </>
    );
}
