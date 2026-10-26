import { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUSES = ['Submitted', 'Under Review', 'Verified', 'In Progress', 'Resolved', 'Rejected', 'Escalated'];
const AI_COLOR = { genuine: '#22a559', suspicious: '#d98a0b', spam: '#dc2626' };

// The single admin manages every complaint. Names and emails are never shown here.
export default function Admin() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const load = () => api('/admin/complaints').then(setRows).catch(e => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    const note = prompt('Explanation for the public timeline (required):');
    if (!note) return;
    try { await api(`/complaints/${id}/status`, { method: 'PATCH', body: { status, note } }); load(); }
    catch (e) { setMsg(e.message); }
  };
  const remove = async id => {
    if (confirm('Delete this complaint permanently?')) { await api('/admin/complaints/' + id, { method: 'DELETE' }); load(); }
  };

  return (
    <div className="card">
      <h2>Admin: manage complaints</h2>
      <p className="note">AI screening only advises. Suspicious and spam-flagged complaints are listed first, and a person decides.</p>
      {msg && <p className="err">{msg}</p>}
      {rows.map(c => (
        <div key={c.id} style={{ borderTop: '1px solid var(--line)', padding: '12px 0' }}>
          <b>{c.title}</b> <span className="pill">{c.status}</span>{' '}
          <span className="pill" style={{ background: AI_COLOR[c.ai_verdict] || '#4b4b4b' }}>
            AI: {c.ai_verdict || 'unchecked'}{c.ai_score != null && ` ${c.ai_score}%`}</span>
          <div className="muted">{c.category} · {c.place} · {c.id}</div>
          {c.ai_reason && <div className="muted">AI note: {c.ai_reason}</div>}
          <p>{c.description}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value="" onChange={e => e.target.value && update(c.id, e.target.value)}>
              <option value="">Change status…</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            <button onClick={() => remove(c.id)} style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}>Delete</button>
          </div>
        </div>
      ))}
      {!rows.length && <p className="muted">No complaints yet.</p>}
    </div>
  );
}
