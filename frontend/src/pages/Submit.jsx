import { useState } from 'react';
import { api, getUser } from '../api.js';
import LocationPicker from '../LocationPicker.jsx';

const CATEGORIES = ['Roads', 'Water', 'Electricity', 'Sanitation', 'Education', 'Healthcare', 'Agriculture', 'Corruption', 'Other'];

export default function Submit() {
  const [f, setF] = useState({ title: '', description: '', category: 'Roads', location_id: null });
  const [msg, setMsg] = useState('');
  if (!getUser()) return <p className="card">Please <a href="/login">log in</a> to submit a complaint.</p>;

  const send = async () => {
    try { const r = await api('/complaints', { method: 'POST', body: f }); setMsg(`Submitted. Your complaint ID: ${r.id}`); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <div className="card">
      <h2>Submit a complaint</h2>
      <LocationPicker onChange={id => setF(x => ({ ...x, location_id: id }))} />
      <p><select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></p>
      <p><input placeholder="Title" maxLength={100} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></p>
      <p><textarea rows={5} placeholder="Describe the problem" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></p>
      <p className="muted">Complaints are public. Do not include phone numbers or ID numbers.</p>
      <button onClick={send}>Submit</button> <span className="muted">{msg}</span>
    </div>
  );
}
