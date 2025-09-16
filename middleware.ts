// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon: string;
  roles: Role[];
}

interface TokenPayload {
  sub: number;
  name: string;
  role: string;
  roleId: number;
  iat: number;
  exp: number;
}

// Cache para menus
let menusCache: MenuItem[] | null = null;
let cacheTimestamp = 0;

async function fetchMenusFromAPI(): Promise<MenuItem[]> {
  // Cache de 5 minutos para evitar muitas requisições
  if (menusCache && Date.now() - cacheTimestamp < 300000) {
    return menusCache;
  }

  try {
    const response = await fetch('http://localhost:3000/menus', {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menus: ${response.status}`);
    }

    const menus = await response.json();
    menusCache = menus;
    cacheTimestamp = Date.now();
    
    return menus;
  } catch (error) {
    console.error('Error fetching menus from API:', error);
    return menusCache || [];
  }
}

// function decodeToken(token: string): TokenPayload | null {
//   try {
//     // Pega a parte do payload do token JWT
//     const payload = token.split('.')[1];
    
//     // Converte base64url para base64 normal
//     const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
//     // Decodifica base64
//     const decoded = atob(base64);
    
//     return JSON.parse(decoded);
//   } catch (error) {
//     console.error('Error decoding token:', error);
//     return null;
//   }
// }

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/register", "/reset-password"];
  const apiPaths = ["/api/"];

  // Ignora rotas de API
  if (apiPaths.some(apiPath => pathname.startsWith(apiPath))) {
    return NextResponse.next();
  }

  // Redireciona para login se não tiver token em rotas protegidas
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Se já está logado, redireciona das rotas públicas
  if (token && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Verificação de autorização baseada em role
  if (token && !publicPaths.includes(pathname)) {
    try {
      // Decodifica o token para obter a roleId do usuário
      const decoded: TokenPayload = jwtDecode(token);
      
      // if (!decoded || !decoded.roleId) {
      //   console.warn('Token inválido ou sem roleId');
      //   return NextResponse.redirect(new URL("/404", req.url));
      // }

      const userRoleId = decoded.roleId;
      console.log(`Usuário roleId: ${userRoleId} tentando acessar: ${pathname}`);

      // Busca os menus da API NestJS
      const menus = await fetchMenusFromAPI();
      
      // Encontra o menu correspondente à rota atual
      const menuForCurrentPath = menus.find(menu => 
        pathname === menu.path || 
        pathname.startsWith(`${menu.path}/`) ||
        (menu.path !== '/' && pathname.startsWith(menu.path))
      );

      // Se a rota está protegida por algum menu, verifica permissão
      if (menuForCurrentPath) {
        const hasPermission = menuForCurrentPath.roles.some(
          role => role.id === userRoleId
        );

        // if (!hasPermission) {
        //   console.warn(`Acesso negado: Usuário roleId ${userRoleId} tentou acessar ${pathname}`);
        //   return NextResponse.redirect(new URL("/404", req.url));
        // }
        
        console.log(`Acesso permitido: Usuário roleId ${userRoleId} para ${pathname}`);
      } else {
        console.log(`Rota não mapeada: ${pathname} - acesso permitido`);
      }

    } catch (error) {
      console.error('Error in middleware:', error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};



// // middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//     const token = req.cookies.get("token")?.value;
//     const { pathname } = req.nextUrl;

//     const publicPaths = ["/login", "/register", "/reset-password"];

//     if (!token && !publicPaths.includes(pathname)) {
//         return NextResponse.redirect(new URL("/login", req.url));
//     }

//     if (token && publicPaths.includes(pathname)) {
//         return NextResponse.redirect(new URL("/", req.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: ["/((?!_next|public|favicon.ico).*)"], 
// };
