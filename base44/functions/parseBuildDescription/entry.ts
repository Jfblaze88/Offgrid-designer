import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const description = String(body?.description || '').trim().slice(0, 1200);
    if (description.length < 3) return Response.json({ error: 'Please describe your build.' }, { status: 400 });

    const prompt = `You are an off-grid 12V electrical designer. Read this description of a camper / van / RV / boat / tiny house build and list every electrical appliance it implies.

Description: """${description}"""

Rules:
- Return at most 15 appliances.
- Use realistic typical wattage for each device (running watts, not surge).
- hours_per_day is realistic average daily runtime. A compressor fridge cycles: use about 8 hours of compressor run time. "all day" for a laptop means about 8 hours.
- power_type "DC" for native 12V devices (12V fridge, fans, LED lights, water pump, USB). "AC" for anything needing 230V/120V through an inverter (induction hob, microwave, coffee machine, mains-only laptop charger, hair dryer).
- surge_watts: startup surge for motors/compressors/induction, otherwise same as watts.
- quantity: how many of that appliance ("two fans" => quantity 2), default 1.
- category must be one of: Kitchen, Climate, Lighting, Electronics, Water, Comfort.
- Always include interior LED lighting and a water pump if the build clearly has them; do not invent unrelated devices.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          appliances: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                category: { type: 'string', enum: ['Kitchen', 'Climate', 'Lighting', 'Electronics', 'Water', 'Comfort'] },
                watts: { type: 'number' },
                hours_per_day: { type: 'number' },
                power_type: { type: 'string', enum: ['DC', 'AC'] },
                surge_watts: { type: 'number' },
                quantity: { type: 'number' }
              },
              required: ['name', 'watts', 'power_type']
            }
          }
        },
        required: ['appliances']
      }
    });

    const appliances = (result?.appliances || []).slice(0, 15).map((a) => ({
      name: String(a.name || 'Appliance'),
      category: a.category || 'Electronics',
      watts: Math.max(0, Number(a.watts) || 0),
      hours_per_day: Math.max(0, Number(a.hours_per_day) || 0),
      power_type: a.power_type === 'AC' ? 'AC' : 'DC',
      surge_watts: Math.max(0, Number(a.surge_watts) || Number(a.watts) || 0),
      quantity: Math.max(1, Math.round(Number(a.quantity) || 1))
    }));

    return Response.json({ appliances });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}