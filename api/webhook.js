const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jyeibolwspcrincdyqps.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function sbUpdate(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function sbPost(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { trabajador_id, empleador_email } = session.metadata;
    const priceId = session.line_items?.data?.[0]?.price?.id;

    const PRICES = {
      "price_1TCVLdHT5v0CwRrABlfokFC4": "premium_trabajadora",
      "price_1TCVMSHT5v0CwRrAxUDGZGSl": "suscripcion_empleador",
      "price_1TCVNWHT5v0CwRrAw40cg2A0": "ver_contacto",
      "price_1TCVPWHT5v0CwRrAgtaFi5ue": "comision_contratacion",
    };

    const tipo = PRICES[priceId] || "desconocido";

    // Registrar pago en Supabase
    await sbPost("pagos", {
      stripe_session_id: session.id,
      tipo,
      trabajador_id: trabajador_id || null,
      empleador_email: empleador_email || null,
      monto: session.amount_total / 100,
      moneda: session.currency,
      estado: "completado",
    });

    // Si es perfil premium, actualizar trabajadora
    if (tipo === "premium_trabajadora" && trabajador_id) {
      await sbUpdate("trabajadores", trabajador_id, {
        premium: true,
        premium_hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  res.status(200).json({ received: true });
};
