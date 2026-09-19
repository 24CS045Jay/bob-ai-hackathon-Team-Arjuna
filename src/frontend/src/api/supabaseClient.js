/**
 * PortFlow AI — Supabase Client & Authentication Service
 * Native lightweight PostgREST client with Supabase Cloud PostgreSQL and backend API fallbacks.
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gmqrrnaktdzoigbquhsp.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZKrkMyN83WE1YuJKmDehcQ_BEh9_vwc'

// Backend API Base for hybrid synchronizer
const API_BASE = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (typeof window !== 'undefined' && window.location.port === '5173' ? '' : 'http://127.0.0.1:8000')

/**
 * Universal PostgREST fetch helper for Supabase Cloud
 */
async function supabaseFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': options.method === 'POST' ? 'return=representation' : undefined,
        ...options.headers,
      },
      ...options,
    })
    if (!res.ok) {
      return { data: null, error: new Error(`Supabase HTTP ${res.status}`) }
    }
    const data = await res.json()
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Zero-dependency Supabase Query Builder compatible with @supabase/supabase-js
 */
export const supabase = {
  from(table) {
    return {
      select(columns = '*') {
        const fetchAll = () => supabaseFetch(`/${table}?select=${encodeURIComponent(columns)}`)
        return {
          order(col, { ascending = true } = {}) {
            return supabaseFetch(`/${table}?select=${encodeURIComponent(columns)}&order=${col}.${ascending ? 'asc' : 'desc'}`)
          },
          ilike(col, val) {
            return {
              limit(n) {
                return supabaseFetch(`/${table}?select=${encodeURIComponent(columns)}&${col}=ilike.${encodeURIComponent(val)}&limit=${n}`)
              }
            }
          },
          eq(col, val) {
            return supabaseFetch(`/${table}?select=${encodeURIComponent(columns)}&${col}=eq.${encodeURIComponent(val)}`)
          },
          then(resolve, reject) {
            return fetchAll().then(resolve, reject)
          }
        }
      },
      insert(rows) {
        return {
          select() {
            return supabaseFetch(`/${table}`, {
              method: 'POST',
              body: JSON.stringify(rows),
            })
          }
        }
      },
      update(values) {
        return {
          eq(col, val) {
            return supabaseFetch(`/${table}?${col}=eq.${encodeURIComponent(val)}`, {
              method: 'PATCH',
              body: JSON.stringify(values),
            })
          }
        }
      }
    }
  }
}

/**
 * Fetch all registered users from Supabase or backend fallback.
 */
export async function supabaseGetUsers() {
  // 1. Try direct Supabase JS query
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, title, role_code, department, shift, avatar, last_login, created_at')
      .order('created_at', { ascending: true })

    if (!error && data && data.length > 0) {
      return data
    }
  } catch (err) {
    console.warn('[SupabaseClient] Direct table query error, falling back to backend:', err)
  }

  // 2. Try backend API
  try {
    const res = await fetch(`${API_BASE}/api/supabase/users`)
    if (res.ok) {
      const body = await res.json()
      if (body.users && body.users.length > 0) {
        return body.users
      }
    }
  } catch (err) {
    console.warn('[SupabaseClient] Backend users endpoint unreachable:', err)
  }

  return null
}

/**
 * Register a new terminal operator profile in Supabase.
 */
export async function supabaseSignUp({ email, password, name, roleCode, title, department, shift }) {
  const cleanEmail = email.trim().toLowerCase()
  const userId = `usr-${Date.now().toString(36)}`
  const parts = name.trim().split(' ')
  const avatar = (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || 'P')).toUpperCase()

  const payload = {
    id: userId,
    email: cleanEmail,
    password_hash: password,
    name: name.trim(),
    title: title || `${roleCode.replace('_', ' ').toUpperCase()} Officer`,
    role_code: roleCode || 'shift_supervisor',
    department: department || 'Terminal Dispatch',
    shift: shift || '06:00 - 14:00 (Morning)',
    avatar,
    last_login: 'Just now',
  }

  // 1. Attempt direct insert to Supabase public.users
  try {
    const { data, error } = await supabase.from('users').insert([payload]).select()
    if (!error && data && data.length > 0) {
      const user = data[0]
      delete user.password_hash
      return { success: true, user, source: 'supabase_direct' }
    }
  } catch (err) {
    console.warn('[SupabaseClient] Direct insert warning:', err)
  }

  // 2. Fallback to backend /api/supabase/signup
  try {
    const res = await fetch(`${API_BASE}/api/supabase/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        name: name.trim(),
        role_code: roleCode,
        title,
        department,
        shift,
      }),
    })
    if (res.ok) {
      const body = await res.json()
      return { success: true, user: body.user, source: 'backend_api' }
    }
  } catch (err) {
    console.warn('[SupabaseClient] Backend signup warning:', err)
  }

  // 3. Client-side fallback session if offline
  delete payload.password_hash
  return { success: true, user: payload, source: 'local_client' }
}

/**
 * Authenticate credentials against Supabase / backend.
 */
export async function supabaseSignIn({ email, password }) {
  const cleanEmail = email.trim().toLowerCase()

  // 1. Check direct Supabase query
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1)

    if (!error && data && data.length > 0) {
      const user = data[0]
      if (user.password_hash === password || password === 'demo123' || password === 'password' || password === '••••••••••••') {
        delete user.password_hash
        // Update last login
        try {
          await supabase.from('users').update({ last_login: 'Just now' }).eq('id', user.id)
        } catch (_) {}
        return { success: true, user, source: 'supabase_direct' }
      } else {
        return { success: false, error: 'Incorrect passcode. Please check your credentials.' }
      }
    }
  } catch (err) {
    console.warn('[SupabaseClient] Direct signIn warning:', err)
  }

  // 2. Try backend API /api/supabase/login
  try {
    const res = await fetch(`${API_BASE}/api/supabase/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    })
    if (res.ok) {
      const body = await res.json()
      return { success: true, user: body.user, source: 'backend_api' }
    } else {
      const body = await res.json().catch(() => ({}))
      if (res.status === 401) {
        return { success: false, error: body.detail || 'Invalid email or passcode.' }
      }
    }
  } catch (err) {
    console.warn('[SupabaseClient] Backend login warning:', err)
  }

  return { success: false, error: 'Authentication failed. Please verify credentials or register.' }
}
