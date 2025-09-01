import './globals.css';
import Sidebar from '@/components/Sidebar/Sidebar';
import { cookies } from 'next/headers';
import { RoleProvider } from "@/utils/RoleContext";
import jwt from "jsonwebtoken";
import { useUserSocket } from '@/utils/useUserSocket';
import UserSocketInit from '@/utils/UserSocketInit';

export const metadata = {
  title: 'Dashboard',
  description: 'Exemplo de dashboard com Next.js e NestJS',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isAuthenticated = !!token;

  let roleFromSSR = null;
  let nameFromSSR = null;
  let userId: number | null = null;
  if (token) {
    try {
      const decoded: any = jwt.decode(token);
      roleFromSSR = decoded?.role || null;
      nameFromSSR = decoded?.name || null;
      userId = decoded?.sub || null;
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
    }
  }

  return (
    <html lang="pt-BR">
      <body className="flex h-screen overflow-hidden">
        <RoleProvider initialRole={roleFromSSR} initialName={nameFromSSR} >
        {isAuthenticated && <Sidebar />}
        <main
          className={`${isAuthenticated ? 'flex-1' : 'w-full'} 
            p-6 bg-gray-100 overflow-y-auto`}
          >
            {userId && <UserSocketInit userId={userId} />}
          {children}
        </main>
        </RoleProvider>
      </body>
    </html>
  )
}
