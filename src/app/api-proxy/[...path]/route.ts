import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params, 'PATCH');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Construir el path completo
    const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
    
    // Construir la URL completa
    const baseApiUrl = API_URL.replace(/\/$/, ''); // Remover trailing slash
    const queryString = request.nextUrl.search; // Preservar query params
    const url = `${baseApiUrl}/${path}${queryString}`;
    
    console.log('[API Proxy]', {
      method,
      path,
      url,
      apiUrl: API_URL,
      baseApiUrl
    });
    
    // Preparar el body si existe
    let body: string | undefined;
    const contentType = request.headers.get('content-type');
    
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (e) {
        console.error('[API Proxy] Error reading body:', e);
      }
    }
    
    // Preparar headers
    const headers: HeadersInit = {
      'Content-Type': contentType || 'application/json',
    };
    
    // Copiar headers importantes (excepto host y connection)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Hacer la petición al backend
    const response = await fetch(url, {
      method,
      headers,
      body,
      // Permitir redirects
      redirect: 'follow',
    });
    
    // Leer la respuesta
    const data = await response.text();
    
    // Crear la respuesta con los mismos headers
    const nextResponse = new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
    });
    
    // Copiar headers relevantes
    response.headers.forEach((value, key) => {
      // Evitar copiar headers que causan problemas
      const lowerKey = key.toLowerCase();
      if (
        !lowerKey.includes('content-encoding') &&
        !lowerKey.includes('transfer-encoding') &&
        !lowerKey.includes('connection') &&
        !lowerKey.includes('content-length') // Next.js maneja esto automáticamente
      ) {
        nextResponse.headers.set(key, value);
      }
    });
    
    // Agregar CORS headers si es necesario
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  } catch (error: any) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al conectar con el servidor',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

