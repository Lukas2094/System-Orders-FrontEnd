"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type RoleContextType = {
  role: any | null;
  name: string | null;
  setRole: (role: any | null) => void;
  setNameContext: (name: string | null) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<any | null>(null);
  const [name, setNameContext] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); 
    // console.log("🔑 Token encontrado no localStorage:", token);

    if (!token) {
      console.warn("⚠️ Nenhum token encontrado no localStorage.");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);

      if (decoded?.roleId) {
        setRole(decoded.roleId);
      }

      if (decoded?.name) {
        setNameContext(decoded.name);
      }
    } catch (e) {
      console.error("❌ Erro ao decodificar token no client:", e);
    }
  }, []); 

  return (
    <RoleContext.Provider value={{ role, setRole, name, setNameContext }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole deve ser usado dentro de RoleProvider");
  return context;
}