import { useState } from 'react';
import { api } from '../api.js';

export default function Track() {
  const [id, setId] = useState('');
  const [c, setC] = useState(null);
  const [err, setErr] = useState('');
  const find = async () => { try { setErr(''); setC(await api('/complaints/' + id.trim().toUpperCase())); } catch (e) { setC(null); setErr(e.message); } };
  return (
    <div className="card">
      <h2>Track a complaint</h2>
      <div style={{ display: 'flex', gap: 8 }}><input placeholder="JS-2026-AB12CD" value={id} onChange={e => setId(e.target.value)} /><button onClick={find}>Track</button></div>
      {err && <p className="err">{err}</p>}
      {c && (<><h3>{c.title} <span className="pill">{c.status}</span></h3><p className="muted">Reported by: {c.reporter}</p><p>{c.description}</p>
        {c.timeline.map((t, i) => <p key={i}><b>{t.status}</b> <span className="muted">{new Date(t.created_at).toLocaleString()}</span><br />{t.note}</p>)}</>)}
    </div>
  );
}
