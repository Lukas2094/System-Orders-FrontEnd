"use client";

import { useUserSocket } from "@/utils/useUserSocket";

export default function UserSocketInit({ userId }: { userId: number }) {
    useUserSocket(userId);
    return null;
}
