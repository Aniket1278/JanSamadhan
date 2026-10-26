import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Directory() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ search: '', category: '', status: '' });
  useEffect(() => {
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
    api('/complaints?' + qs).then(setRows);
  }, [f]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <div className="card">
      <h2>Public complaints</h2>
      <div className="grid">
        <input placeholder="Search" value={f.search} onChange={set('search')} />
        <select value={f.category} onChange={set('category')}><option value="">All categories</option>
          {['Roads', 'Water', 'Electricity', 'Sanitation', 'Education', 'Healthcare', 'Agriculture', 'Corruption', 'Other'].map(c => <option key={c}>{c}</option>)}</select>
        <select value={f.status} onChange={set('status')}><option value="">All statuses</option>
          {['Submitted', 'Under Review', 'Verified', 'In Progress', 'Resolved', 'Rejected', 'Escalated'].map(s => <option key={s}>{s}</option>)}</select>
      </div>
      {rows.map(r => <p key={r.id}><b>{r.title}</b> <span className="pill">{r.status}</span><br /><span className="muted">{r.category} · {r.place} · {r.id}</span></p>)}
      {!rows.length && <p className="muted">No complaints match.</p>}
    </div>
  );
}
