const DEV_FALLBACK_BASE = '/wp-json/polygon-plugin/v1'

function getBase(): string {
  const configured = window.polygonPluginSettings?.root
  if (configured) return configured.replace(/\/$/, '')
  return DEV_FALLBACK_BASE
}

function getNonce(): string | null {
  return window.polygonPluginSettings?.nonce ?? null
}

function buildHeaders(extra?: HeadersInit, mutating = false): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(extra as Record<string, string> | undefined),
  }
  if (mutating) {
    const nonce = getNonce()
    if (nonce) headers['X-WP-Nonce'] = nonce
  }
  return headers
}

async function request(endpoint: string, init: RequestInit, mutating: boolean): Promise<Response> {
  const url = `${getBase()}${endpoint}`
  const response = await fetch(url, {
    ...init,
    headers: buildHeaders(init.headers, mutating),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${init.method ?? 'GET'} ${endpoint}`)
  }
  return response
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await request(endpoint, { method: 'GET' }, false)
  return res.json() as Promise<T>
}

export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await request(endpoint, { method: 'POST', body: JSON.stringify(data) }, true)
  return res.json() as Promise<T>
}

export async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await request(endpoint, { method: 'PUT', body: JSON.stringify(data) }, true)
  return res.json() as Promise<T>
}

export async function apiDelete(endpoint: string): Promise<boolean> {
  const res = await request(endpoint, { method: 'DELETE' }, true)
  return res.ok
}
