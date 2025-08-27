"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type RoleContextType = {
  role: any; // pode ser tipado melhor, ex: { id: number, name: string }
  setRole: (role: any) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<any>(null);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
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
