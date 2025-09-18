// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  iat: number;
  exp: number;
}

interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon: string;
}

const menuCache: Record<number, { menus: MenuItem[]; timestamp: number }> = {};

async function fetchMenusByRole(roleId: number): Promise<MenuItem[]> {
  const cached = menuCache[roleId];
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.menus;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus/role/${roleId}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar menus para role ${roleId}`);
    }

    const result = await response.json();
    const menus = result.data || [];

    menuCache[roleId] = { menus, timestamp: Date.now() };
    return menus;
  } catch (err) {
    console.error("Erro no fetchMenusByRole:", err);
    return [];
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || "";
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/register", "/reset-password", "/404"];
  const apiPaths = ["/api/"];

  // ignora rotas de API
  if (apiPaths.some(apiPath => pathname.startsWith(apiPath))) {
    return NextResponse.next();
  }

  // se não tem token e a rota não é pública → login
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // se já tem token e está em rota pública → redireciona para home
  if (token && ["/login", "/register", "/reset-password"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && !publicPaths.includes(pathname)) {

    if (token.trim() === "") {
     return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded: TokenPayload = jwtDecode(token);

      if (!decoded?.roleId) {
        console.warn("Token inválido ou sem roleId");
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const roleId = decoded.roleId;
      console.log(`Usuário roleId=${roleId} tentando acessar: ${pathname}`);

      if (roleId === 2) {
        console.log(`Acesso permitido: roleId=${roleId} (admin) em ${pathname}`);
        return NextResponse.next();
      }

      // pega menus permitidos para esse role
      const menus = await fetchMenusByRole(roleId);

      const allowedPaths = menus.map(m => m.path);

      // verifica se a rota está dentro dos menus principais
      const isAllowed =
        pathname === "/" || // 👈 permite sempre a home
        allowedPaths.some(
          path => pathname === path || pathname.startsWith(`${path}/`)
        );

      if (!isAllowed) {
        console.warn(`Acesso negado: roleId=${roleId} não tem permissão em ${pathname}`);
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (!isAllowed) {
        console.warn(`Acesso negado: roleId=${roleId} não tem permissão em ${pathname}`);
        return NextResponse.redirect(new URL("/", req.url));
      }

      console.log(`Acesso permitido: roleId=${roleId} em ${pathname}`);
    } catch (error) {
      console.error("Erro no middleware:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|imgs|public|\\.well-known).*)",
  ],
};
