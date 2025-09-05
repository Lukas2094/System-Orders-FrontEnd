import './globals.css';
import Sidebar from '@/components/Sidebar/Sidebar';
import { cookies } from 'next/headers';
import { RoleProvider } from "@/utils/RoleContext";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isAuthenticated = !!token;

  return (
    <html lang="pt-BR">
      <body className="flex h-screen overflow-hidden !bg-gradient-to-br from-blue-600 via-indigo-700 to-sky-500">
        <RoleProvider>
        {isAuthenticated && <Sidebar />}
        <main
          className={`${isAuthenticated ? 'flex-1' : 'w-full'} 
            p-6 overflow-y-auto`}
          >
          {children}
        </main>
        </RoleProvider>
      </body>
    </html>
  )
}
