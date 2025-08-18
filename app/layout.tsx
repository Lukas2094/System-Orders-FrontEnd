import './globals.css';
import Sidebar from '@/components/Sidebar/Sidebar';
import { cookies } from 'next/headers';

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

  return (
    <html lang="pt-BR">
      <body className="flex">
        {isAuthenticated && <Sidebar />}
        <main className={`${isAuthenticated ? 'flex-1' : 'w-full'} p-6 bg-gray-100 min-h-screen`}>
          {children}
        </main>
      </body>
    </html>
  )
}