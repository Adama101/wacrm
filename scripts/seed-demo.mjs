/**
 * Seeds a local demo user + sample CRM data (Node 20+, fetch only).
 * Usage: node scripts/seed-demo.mjs
 */

const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const DEMO_EMAIL = "demo@wacrm.local";
const DEMO_PASSWORD = "demo123456";
const DEMO_NAME = "Demo Admin";

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

function daysAgo(n, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

async function rest(path, { method = "GET", body, prefer } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...headers,
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return data;
}

async function ensureUser() {
  const listed = await fetch(`${API_URL}/auth/v1/admin/users`, {
    headers,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  });

  const existing = (listed.users ?? listed).find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    await fetch(`${API_URL}/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: DEMO_NAME },
      }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
    });
    return existing.id;
  }

  const created = await fetch(`${API_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: DEMO_NAME },
    }),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  });

  return created.id;
}

async function clearUserData(userId) {
  for (const table of [
    "broadcasts",
    "automations",
    "deals",
    "pipelines",
    "conversations",
    "contacts",
    "tags",
    "custom_fields",
    "message_templates",
  ]) {
    await rest(`/rest/v1/${table}?user_id=eq.${userId}`, { method: "DELETE" });
  }
}

async function seed(userId) {
  await clearUserData(userId);

  await rest(`/rest/v1/profiles?user_id=eq.${userId}`, {
    method: "PATCH",
    body: { full_name: DEMO_NAME, email: DEMO_EMAIL },
  });

  const tagRows = await rest("/rest/v1/tags", {
    method: "POST",
    prefer: "return=representation",
    body: [
      { user_id: userId, name: "VIP", color: "#f59e0b" },
      { user_id: userId, name: "Lead", color: "#3b82f6" },
      { user_id: userId, name: "Customer", color: "#22c55e" },
      { user_id: userId, name: "Support", color: "#a855f7" },
      { user_id: userId, name: "Staff", color: "#0ea5e9" },
      { user_id: userId, name: "FOH", color: "#14b8a6" },
      { user_id: userId, name: "BOH", color: "#f43f5e" },
      { user_id: userId, name: "Crew", color: "#6366f1" },
      { user_id: userId, name: "Ground", color: "#8b5cf6" },
      { user_id: userId, name: "Associate", color: "#06b6d4" },
      { user_id: userId, name: "Shift-Lead", color: "#eab308" },
      { user_id: userId, name: "Accountability", color: "#f97316" },
      { user_id: userId, name: "Incident", color: "#ef4444" },
      { user_id: userId, name: "Guest", color: "#84cc16" },
      { user_id: userId, name: "Passenger", color: "#38bdf8" },
      { user_id: userId, name: "Shopper", color: "#a3e635" },
      { user_id: userId, name: "IRROPS", color: "#fb7185" },
      { user_id: userId, name: "BOPIS", color: "#2dd4bf" },
    ],
  });
  const tagByName = Object.fromEntries(tagRows.map((t) => [t.name, t.id]));

  const contactDefs = [
    {
      phone: "+15550101",
      name: "Alice Johnson",
      email: "alice@acme.com",
      company: "Acme Corp",
      tags: ["VIP", "Customer"],
    },
    {
      phone: "+15550102",
      name: "Bob Smith",
      email: "bob@startup.io",
      company: "Startup.io",
      tags: ["Lead"],
    },
    {
      phone: "+15550103",
      name: "Carol Lee",
      email: "carol@retail.co",
      company: "Retail Co",
      tags: ["Customer", "Support", "Shopper"],
    },
    {
      phone: "+15550104",
      name: "Diego Alvarez",
      email: "diego@nimbus.dev",
      company: "Nimbus",
      tags: ["Lead", "VIP"],
    },
    {
      phone: "+15550105",
      name: "Elena Rossi",
      email: "elena@freshfoods.com",
      company: "Fresh Foods",
      tags: ["Customer", "Guest"],
    },
    {
      phone: "+15551001",
      name: "Maya Chen",
      email: "maya@bistro.local",
      company: "Harbor Bistro",
      tags: ["Staff", "FOH", "Accountability"],
    },
    {
      phone: "+15551002",
      name: "Jordan Pike",
      email: "jordan@bistro.local",
      company: "Harbor Bistro",
      tags: ["Staff", "BOH", "Accountability"],
    },
    {
      phone: "+15551003",
      name: "Sam Okonkwo",
      email: "sam@airlink.local",
      company: "AirLink Station",
      tags: ["Staff", "Ground", "Accountability"],
    },
    {
      phone: "+15551004",
      name: "Riley Nguyen",
      email: "riley@airlink.local",
      company: "AirLink Station",
      tags: ["Staff", "Crew", "Shift-Lead"],
    },
    {
      phone: "+15551005",
      name: "Priya Shah",
      email: "priya@urbanmart.local",
      company: "Urban Mart",
      tags: ["Staff", "Associate", "Accountability"],
    },
    {
      phone: "+15551006",
      name: "Chris Patel",
      email: "chris@urbanmart.local",
      company: "Urban Mart",
      tags: ["Staff", "Shift-Lead", "BOPIS"],
    },
    {
      phone: "+15552001",
      name: "Guest Hanna Wells",
      email: "hanna@example.com",
      company: "Walk-in",
      tags: ["Guest", "VIP"],
    },
    {
      phone: "+15552002",
      name: "Passenger Omar Haddad",
      email: "omar@example.com",
      company: "Flight AA214",
      tags: ["Passenger", "IRROPS"],
    },
  ];

  const contactRows = await rest("/rest/v1/contacts", {
    method: "POST",
    prefer: "return=representation",
    body: contactDefs.map(({ tags: _t, ...c }) => ({ ...c, user_id: userId })),
  });
  const contactByPhone = Object.fromEntries(
    contactRows.map((c) => [c.phone, c.id]),
  );

  await rest("/rest/v1/contact_tags", {
    method: "POST",
    prefer: "return=minimal",
    body: contactDefs.flatMap((c) =>
      c.tags.map((tagName) => ({
        contact_id: contactByPhone[c.phone],
        tag_id: tagByName[tagName],
      })),
    ),
  });

  const dueSoon = new Date(Date.now() + 45 * 60_000).toISOString();
  await rest("/rest/v1/contact_notes", {
    method: "POST",
    prefer: "return=minimal",
    body: [
      {
        contact_id: contactByPhone["+15550101"],
        user_id: userId,
        note_text: "Interested in annual plan. Follow up next week.",
      },
      {
        contact_id: contactByPhone["+15550102"],
        user_id: userId,
        note_text: "Booked a product demo for Thursday.",
      },
      {
        contact_id: contactByPhone["+15551001"],
        user_id: userId,
        note_text: `[TASK] due=${dueSoon} | Confirm section 12–18 set and water service ready`,
      },
      {
        contact_id: contactByPhone["+15551002"],
        user_id: userId,
        note_text: "[DONE] | Prep list complete through grill station",
      },
      {
        contact_id: contactByPhone["+15551003"],
        user_id: userId,
        note_text: "[BLOCKED] | Wheelchair assist delayed — vendor late to gate B4",
      },
      {
        contact_id: contactByPhone["+15551005"],
        user_id: userId,
        note_text: `[TASK] due=${dueSoon} | Clear BOPIS rack A and SMS ready orders`,
      },
      {
        contact_id: contactByPhone["+15552002"],
        user_id: userId,
        note_text: "[INCIDENT] severity=medium | Misconnect risk on AA214 delay",
      },
    ],
  });

  const [pipeline] = await rest("/rest/v1/pipelines", {
    method: "POST",
    prefer: "return=representation",
    body: [{ user_id: userId, name: "Sales Pipeline" }],
  });

  const stageRows = await rest("/rest/v1/pipeline_stages", {
    method: "POST",
    prefer: "return=representation",
    body: [
      { pipeline_id: pipeline.id, name: "New Lead", position: 0, color: "#94a3b8" },
      { pipeline_id: pipeline.id, name: "Qualified", position: 1, color: "#3b82f6" },
      { pipeline_id: pipeline.id, name: "Proposal", position: 2, color: "#f59e0b" },
      { pipeline_id: pipeline.id, name: "Won", position: 3, color: "#22c55e" },
    ],
  });
  const stageByName = Object.fromEntries(stageRows.map((s) => [s.name, s.id]));

  const convDefs = [
    {
      phone: "+15550101",
      status: "open",
      last_message_text: "Sounds good — can we start next month?",
      last_message_at: daysAgo(0, 15),
      unread_count: 1,
    },
    {
      phone: "+15550102",
      status: "pending",
      last_message_text: "Thanks! Looking forward to the demo.",
      last_message_at: daysAgo(1, 11),
      unread_count: 0,
    },
    {
      phone: "+15550103",
      status: "open",
      last_message_text: "My order hasn't arrived yet.",
      last_message_at: daysAgo(0, 10),
      unread_count: 2,
    },
    {
      phone: "+15550104",
      status: "closed",
      last_message_text: "We'll revisit in Q3.",
      last_message_at: daysAgo(5, 16),
      unread_count: 0,
    },
  ];

  const convRows = await rest("/rest/v1/conversations", {
    method: "POST",
    prefer: "return=representation",
    body: convDefs.map((c) => ({
      user_id: userId,
      contact_id: contactByPhone[c.phone],
      status: c.status,
      last_message_text: c.last_message_text,
      last_message_at: c.last_message_at,
      unread_count: c.unread_count,
    })),
  });
  const convByPhone = Object.fromEntries(
    convDefs.map((c, i) => [c.phone, convRows[i].id]),
  );

  await rest("/rest/v1/messages", {
    method: "POST",
    prefer: "return=minimal",
    body: [
      {
        conversation_id: convByPhone["+15550101"],
        sender_type: "customer",
        content_text: "Hi — interested in your WhatsApp CRM.",
        status: "read",
        created_at: daysAgo(2, 9),
      },
      {
        conversation_id: convByPhone["+15550101"],
        sender_type: "agent",
        content_text: "Happy to help! We can set you up this week.",
        status: "read",
        created_at: daysAgo(2, 10),
      },
      {
        conversation_id: convByPhone["+15550101"],
        sender_type: "customer",
        content_text: "Sounds good — can we start next month?",
        status: "delivered",
        created_at: daysAgo(0, 15),
      },
      {
        conversation_id: convByPhone["+15550102"],
        sender_type: "agent",
        content_text: "Hi Bob — confirming your demo for Thursday at 2pm.",
        status: "read",
        created_at: daysAgo(1, 10),
      },
      {
        conversation_id: convByPhone["+15550102"],
        sender_type: "customer",
        content_text: "Thanks! Looking forward to the demo.",
        status: "read",
        created_at: daysAgo(1, 11),
      },
      {
        conversation_id: convByPhone["+15550103"],
        sender_type: "customer",
        content_text: "Hello, I need help with shipping.",
        status: "delivered",
        created_at: daysAgo(0, 9),
      },
      {
        conversation_id: convByPhone["+15550103"],
        sender_type: "customer",
        content_text: "My order hasn't arrived yet.",
        status: "delivered",
        created_at: daysAgo(0, 10),
      },
      {
        conversation_id: convByPhone["+15550104"],
        sender_type: "agent",
        content_text: "Sharing the pricing deck we discussed.",
        status: "read",
        created_at: daysAgo(6, 14),
      },
      {
        conversation_id: convByPhone["+15550104"],
        sender_type: "customer",
        content_text: "We'll revisit in Q3.",
        status: "read",
        created_at: daysAgo(5, 16),
      },
    ],
  });

  await rest("/rest/v1/deals", {
    method: "POST",
    prefer: "return=minimal",
    body: [
      {
        user_id: userId,
        pipeline_id: pipeline.id,
        stage_id: stageByName["Proposal"],
        contact_id: contactByPhone["+15550101"],
        conversation_id: convByPhone["+15550101"],
        title: "Acme — Annual license",
        value: 4800,
        currency: "USD",
        status: "open",
        expected_close_date: new Date(Date.now() + 14 * 86400000)
          .toISOString()
          .slice(0, 10),
      },
      {
        user_id: userId,
        pipeline_id: pipeline.id,
        stage_id: stageByName["Qualified"],
        contact_id: contactByPhone["+15550102"],
        conversation_id: convByPhone["+15550102"],
        title: "Startup.io — Starter plan",
        value: 990,
        currency: "USD",
        status: "open",
        expected_close_date: new Date(Date.now() + 21 * 86400000)
          .toISOString()
          .slice(0, 10),
      },
      {
        user_id: userId,
        pipeline_id: pipeline.id,
        stage_id: stageByName["New Lead"],
        contact_id: contactByPhone["+15550104"],
        conversation_id: convByPhone["+15550104"],
        title: "Nimbus — Team seats",
        value: 2400,
        currency: "USD",
        status: "open",
        expected_close_date: null,
      },
      {
        user_id: userId,
        pipeline_id: pipeline.id,
        stage_id: stageByName["Won"],
        contact_id: contactByPhone["+15550105"],
        conversation_id: null,
        title: "Fresh Foods — Support upsell",
        value: 600,
        currency: "USD",
        status: "won",
        expected_close_date: null,
      },
    ],
  });

  const [template] = await rest("/rest/v1/message_templates", {
    method: "POST",
    prefer: "return=representation",
    body: [
      {
        user_id: userId,
        name: "welcome_offer",
        category: "Marketing",
        language: "en_US",
        body_text:
          "Hi {{1}}, welcome to WACRM! Reply YES to book a quick onboarding call.",
        footer_text: "Reply STOP to opt out",
        status: "Approved",
      },
    ],
  });

  const [broadcast] = await rest("/rest/v1/broadcasts", {
    method: "POST",
    prefer: "return=representation",
    body: [
      {
        user_id: userId,
        name: "March welcome campaign",
        template_name: template.name,
        template_language: "en_US",
        status: "sent",
        total_recipients: 3,
        sent_count: 3,
        delivered_count: 2,
        read_count: 1,
        failed_count: 0,
      },
    ],
  });

  await rest("/rest/v1/broadcast_recipients", {
    method: "POST",
    prefer: "return=minimal",
    body: [
      {
        broadcast_id: broadcast.id,
        contact_id: contactByPhone["+15550102"],
        status: "read",
        sent_at: daysAgo(3, 9),
        delivered_at: daysAgo(3, 9),
        read_at: daysAgo(3, 10),
      },
      {
        broadcast_id: broadcast.id,
        contact_id: contactByPhone["+15550104"],
        status: "delivered",
        sent_at: daysAgo(3, 9),
        delivered_at: daysAgo(3, 9),
        read_at: null,
      },
      {
        broadcast_id: broadcast.id,
        contact_id: contactByPhone["+15550105"],
        status: "sent",
        sent_at: daysAgo(3, 9),
        delivered_at: null,
        read_at: null,
      },
    ],
  });

  const [automation] = await rest("/rest/v1/automations", {
    method: "POST",
    prefer: "return=representation",
    body: [
      {
        user_id: userId,
        name: "Tag new VIP keywords",
        description: "When an inbound message contains VIP, tag the contact.",
        trigger_type: "keyword",
        trigger_config: { keywords: ["VIP", "premium"] },
        is_active: true,
        execution_count: 2,
        last_executed_at: daysAgo(1, 14),
      },
    ],
  });

  await rest("/rest/v1/automation_steps", {
    method: "POST",
    prefer: "return=minimal",
    body: [
      {
        automation_id: automation.id,
        step_type: "add_tag",
        step_config: { tag_name: "VIP" },
        position: 0,
      },
      {
        automation_id: automation.id,
        step_type: "send_message",
        step_config: { text: "Thanks! A specialist will follow up shortly." },
        position: 1,
      },
    ],
  });
}

async function main() {
  console.log(`Seeding against ${API_URL}`);
  const userId = await ensureUser();
  console.log(`Demo user: ${DEMO_EMAIL} (${userId})`);
  await seed(userId);
  console.log("Seed complete.");
  console.log("");
  console.log("Login at http://localhost:3000/login");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
