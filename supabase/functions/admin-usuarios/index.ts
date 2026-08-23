import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const authHeader = req.headers.get('Authorization') ?? ''
  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const admin = createClient(url, serviceKey)
  const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })

  const {
    data: { user },
  } = await caller.auth.getUser()
  if (!user) return json(401, { error: 'No autenticado' })

  const { data: perfil } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin') return json(403, { error: 'Solo el administrador puede gestionar usuarios' })

  const body = await req.json()
  const { accion } = body

  if (accion === 'crear') {
    const { email, password, nombre_completo, role } = body
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) return json(400, { error: error.message })
    const { error: perfilError } = await admin
      .from('profiles')
      .insert({ id: data.user.id, email, nombre_completo, role: role ?? 'inspector' })
    if (perfilError) {
      // Sin esto, un usuario de auth.users queda huerfano (sin perfil) y bloquea el correo para siempre.
      await admin.auth.admin.deleteUser(data.user.id)
      return json(400, { error: perfilError.message })
    }
    return json(200, { ok: true, id: data.user.id })
  }

  if (accion === 'reset') {
    const { id, password } = body
    const { error } = await admin.auth.admin.updateUserById(id, { password })
    if (error) return json(400, { error: error.message })
    return json(200, { ok: true })
  }

  if (accion === 'eliminar') {
    const { id } = body
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return json(400, { error: error.message })
    return json(200, { ok: true })
  }

  return json(400, { error: 'Acción inválida' })
})
