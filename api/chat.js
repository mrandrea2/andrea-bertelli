module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { system, message } = req.body;
  if (!message || !system) return res.status(400).json({ error: 'Parametri mancanti' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, system, messages: [{ role: 'user', content: message }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: 'Errore API: ' + (data.error?.message || '') });
    return res.status(200).json({ reply: data.content?.map(b => b.text || '').join('') || '' });
  } catch (err) {
    return res.status(500).json({ error: 'Errore server: ' + err.message });
  }
}
