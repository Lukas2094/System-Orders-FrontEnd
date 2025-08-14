import './globals.css';
import Sidebar from '@/components/Sidebar/Sidebar';

export const metadata = {
  title: 'Dashboard',
  description: 'Exemplo de dashboard com Next.js e NestJS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-100 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
