import { useState } from 'react';
import { api } from '../api.js';

const STATUSES = ['Under Review', 'Verified', 'In Progress', 'Resolved', 'Rejected', 'Escalated'];

// Officials and admins update a complaint by ID; an explanation is mandatory
export default function Official() {
  const [f, setF] = useState({ id: '', status: 'Verified', note: '' });
  const [msg, setMsg] = useState('');
  const save = async () => {
    try { await api(`/complaints/${f.id.trim().toUpperCase()}/status`, { method: 'PATCH', body: { status: f.status, note: f.note } }); setMsg('Updated.'); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <div className="card">
      <h2>Official panel</h2>
      <input placeholder="Complaint ID" value={f.id} onChange={e => setF({ ...f, id: e.target.value })} />
      <p><select value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></p>
      <p><textarea rows={3} placeholder="Official response / reason (required)" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></p>
      <button onClick={save}>Update</button> <span className="muted">{msg}</span>
    </div>
  );
}
