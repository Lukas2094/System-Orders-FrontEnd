// app/users/page.tsx
import UserTable from '@/components/UsersCard/UsersTable';
import { api } from '@/utils/api';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import DynamicMetadata from '@/components/SEO/Metadata';

export default async function UsersPage() {
    
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    const decoded: any = token ? jwt.decode(token) : null;

    const res = await api.get('/users');
    const usersSSR = res.data;

    const resRoles = await api.get('/roles');
    const roles = resRoles.data;

    return (
        <>
            <DynamicMetadata 
                title="Gerenciamento de Usuários"
                description={`Sistema de Gerenciamento de Usuários com ${usersSSR.length} usuários cadastrados`}
                keywords={["usuarios", "gerenciamento"]}
                ogImage="/usuarios-og-image.png"
            />
            <div className="flex">
                <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                    <h2 className="text-2xl font-bold mb-4">Usuários</h2>
                    <UserTable
                        users={usersSSR}
                        roles={roles}
                        loggedUser={decoded} 
                    />
                </main>
            </div> 
        </>
      
    );
}
