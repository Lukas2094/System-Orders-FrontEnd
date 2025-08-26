import UserTable from '@/components/UsersCard/UsersTable';
import { api } from '@/utils/api';

export default async function UsersPage() {

    const res = await api.get('/users');
    const usersSSR = res.data;

    const resRoles = await api.get('/roles');;
    const roles = await resRoles.data;


    return (
        <div className="flex">
            <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Pedidos</h2>
                <UserTable users={usersSSR} roles={roles} />
            </main>
        </div>
    );
}
