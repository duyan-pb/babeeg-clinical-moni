type KVStore = Record<string, unknown>

const STORAGE_KEY = 'spark-kv-mock'
const LOAD_TIMEOUT_MS = 800

function loadStore(): KVStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as KVStore) : {}
  } catch {
    return {}
  }
}

function saveStore(store: KVStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore write failures in demo mode
  }
}

async function handleKvRequest(
  url: URL,
  init: RequestInit | undefined,
  store: KVStore
): Promise<Response> {
  const path = url.pathname
  const key = path.replace('/_spark/kv', '').replace(/^\//, '')

  // List keys
  if (path === '/_spark/kv' && (!init || init.method === 'GET')) {
    return new Response(JSON.stringify(Object.keys(store)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!key) {
    return new Response('Missing key', { status: 400 })
  }

  if (!init || init.method === 'GET') {
    if (!(key in store)) {
      return new Response('Not found', { status: 404 })
    }
    return new Response(JSON.stringify(store[key]), { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  if (init.method === 'POST') {
    const body = init.body
    let parsed
    if (typeof body === 'string') {
      parsed = JSON.parse(body)
    } else if (body instanceof Blob) {
      parsed = JSON.parse(await body.text())
    }
    store[key] = parsed
    saveStore(store)
    return new Response(JSON.stringify(parsed ?? null), { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  if (init.method === 'DELETE') {
    delete store[key]
    saveStore(store)
    return new Response('', { status: 204 })
  }

  return new Response('Unsupported method', { status: 405 })
}

export async function installSparkMock(): Promise<void> {
  if ((window as any).__sparkMockInstalled) {
    return
  }
  ; (window as any).__sparkMockInstalled = true

  const kvStore = loadStore()
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? new URL(input, window.location.origin)
      : input instanceof URL ? input : new URL(input.url)

    if (url.pathname.startsWith('/_spark/kv')) {
      return handleKvRequest(url, init, kvStore)
    }

    if (url.pathname === '/_spark/user') {
      return new Response(JSON.stringify({ login: 'demo-user', name: 'BabEEG Demo' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.pathname === '/_spark/loaded') {
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    return originalFetch(input as any, init)
  }

    ; (window as any).spark = {
      user: async () => ({ login: 'demo-user', name: 'BabEEG Demo' }),
      kv: {
        keys: async () => Object.keys(kvStore),
        get: async (key: string) => kvStore[key],
        set: async (key: string, value: unknown) => {
          kvStore[key] = value
          saveStore(kvStore)
        },
        delete: async (key: string) => {
          delete kvStore[key]
          saveStore(kvStore)
        },
      },
      llm: async () => ({ choices: [] }),
      llmPrompt: async () => ({ choices: [] }),
    }
}

export async function bootstrapSparkRuntime(): Promise<'spark' | 'mock'> {
  const forceMock = true // Forced to avoid 401 errors in dev environment
  // const forceMock = import.meta.env.VITE_SPARK_MODE === 'mock'
  if (!forceMock) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS)
    try {
      const res = await fetch('/_spark/kv', { method: 'GET', signal: controller.signal })
      clearTimeout(timer)
      if (res.ok || res.status === 404) {
        return 'spark'
      }
    } catch {
      // fall through to mock
    }
  }
  await installSparkMock()
  return 'mock'
}
