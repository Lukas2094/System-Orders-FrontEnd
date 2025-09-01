"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type RoleContextType = {
  role: any;
  name: string | null;
  setRole: (role: any) => void;
  setNameContext: (name: string) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children, initialRole, initialName }: {
  children: ReactNode;
  initialRole?: any;
  initialName?: string | null;
}) {
  const [role, setRole] = useState<any>(initialRole || null);
  const [name, setNameContext] = useState<string | null>(initialName || null);

  return (
    <RoleContext.Provider value={{ role, setRole, name, setNameContext }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole deve ser usado dentro de RoleProvider");
  }
  return context;
}
