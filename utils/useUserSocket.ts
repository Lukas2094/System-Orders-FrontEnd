
"use client";

import { useEffect } from "react";
import io from "socket.io-client";
import { useRole } from "./RoleContext";

let socket: any;

export function useUserSocket(userId: number) {
    const { setRole, setNameContext } = useRole();

    useEffect(() => {
        if (!socket) {
            socket = io("http://localhost:3000"); 
        }

        socket.on(`user-updated-${userId}`, (data: { role: any; name: string }) => {
            setRole(data.role);
            setNameContext(data.name);
        });

        return () => {
            socket.off(`user-updated-${userId}`);
        };
    }, [userId, setRole, setNameContext]);
}
