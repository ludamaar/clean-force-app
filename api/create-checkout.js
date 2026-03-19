const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://cleanforce.com.mx");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { priceId, mode, trabajadorId, trabajadorNombre, empleadorEmail } = req.body;

  if (!priceId || !mode) return res.status(400).json({ error: "Faltan parámetros" });

  const PRICES = {
    premium_trabajadora: "price_1TCVLdHT5v0CwRrABlfokFC4",
    suscripcion_empleador: "price_1TCVMSHT5v0CwRrAxUDGZGSl",
    ver_contacto: "price_1TCVNWHT5v0CwRrAw40cg2A0",
    comision_contratacion: "price_1TCVPWHT5v0CwRrAgtaFi5ue",
  };

  if (!Object.values(PRICES).includes(priceId)) {
    return res.status(400).json({ error: "Precio no válido" });
  }

  try {
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode, // "subscription" o "payment"
      success_url: `https://cleanforce.com.mx?pago=exitoso&tipo=${mode}${trabajadorId ? "&trabajador=" + trabajadorId : ""}`,
      cancel_url: `https://cleanforce.com.mx?pago=cancelado`,
      metadata: {
        trabajador_id: trabajadorId || "",
        trabajador_nombre: trabajadorNombre || "",
        empleador_email: empleadorEmail || "",
      },
    };

    if (empleadorEmail) {
      sessionConfig.customer_email = empleadorEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};
