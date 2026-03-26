import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = 'hola@novaboda.es';
const DASHBOARD_URL = 'https://novaboda.com/vendor-dashboard.html';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await req.json();
  // Supabase DB webhook payload: { type: 'INSERT', table: 'vendors', record: {...} }
  const record = payload?.record;
  if (!record?.email) {
    return new Response('No email in payload', { status: 200 });
  }

  // Only send for genuinely new rows (not upsert updates)
  const createdAt = new Date(record.created_at || 0).getTime();
  const ageSeconds = (Date.now() - createdAt) / 1000;
  if (ageSeconds > 30) {
    return new Response('Not a new insert, skipping', { status: 200 });
  }

  const vendorName = record.name || 'Proveedor';
  const vendorEmail = record.contact_email || record.email;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `NOVA BODA <${FROM_EMAIL}>`,
      to: [vendorEmail],
      subject: 'Bienvenido a NOVA BODA — Completa tu perfil',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:2rem;color:#3a2f2a">
          <h1 style="color:#a8415d;margin-bottom:0.5rem">Hola, ${vendorName}.</h1>
          <p style="margin:0.75rem 0">Tu cuenta de proveedor en <strong>NOVA BODA</strong> está lista.</p>
          <p style="margin:0.75rem 0">Completa tu perfil para empezar a recibir solicitudes de parejas en Valencia.</p>
          <p style="margin:1.5rem 0">
            <a href="${DASHBOARD_URL}"
               style="background:#a8415d;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              Ir a mi panel →
            </a>
          </p>
          <p style="font-size:0.85rem;color:#78625a;margin-top:2rem">
            Recibiste este correo porque creaste una cuenta como proveedor en novaboda.com.<br>
            <a href="https://novaboda.com/privacy-policy.html" style="color:#a8415d">Política de privacidad</a>
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return new Response('Email send error', { status: 500 });
  }

  console.log(`Welcome email sent to ${vendorEmail}`);
  return new Response(JSON.stringify({ sent: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
