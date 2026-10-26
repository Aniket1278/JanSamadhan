import { useEffect, useState } from 'react';
import { api } from '../api.js';

// How responsive MPs and MLAs have been to verified complaints on this platform
export default function Scorecard() {
  const [role, setRole] = useState('');
  const [rows, setRows] = useState([]);
  useEffect(() => { api('/scorecard' + (role ? `?role=${role}` : '')).then(setRows); }, [role]);
  return (
    <div className="card">
      <h2>Representative scorecard</h2>
      <p className="note">Based only on verified citizen complaints filed on JanSamadhan. It shows how many were
        resolved, not a representative's complete work, and is not an official assessment.</p>
      <p><select value={role} onChange={e => setRole(e.target.value)} style={{ maxWidth: 200 }}>
        <option value="">MPs and MLAs</option><option value="MP">MPs</option><option value="MLA">MLAs</option></select></p>
      {rows.filter(r => ['MP', 'MLA'].includes(r.role)).map(r => (
        <div key={r.id} style={{ borderTop: '1px solid var(--line)', padding: '10px 0' }}>
          <b>{r.name}</b> · {r.role} {r.party && `· ${r.party}`}
          <div className="muted">{r.constituency} · <a href={r.source_url} target="_blank" rel="noreferrer">source</a></div>
          {r.enough_data ? (<>
            <div className="bar"><i style={{ width: r.resolution_rate + '%' }} /></div>
            <span className="muted">{r.resolved} of {r.total} verified complaints resolved ({r.resolution_rate}%)
              · avg {r.avg_days ?? '–'} days · {r.overdue} pending over 30 days</span></>)
            : <span className="muted">Not enough data yet ({r.total} verified complaints; 10 needed).</span>}
        </div>
      ))}
      {!rows.length && <p className="muted">No representatives have been added yet.</p>}
    </div>
  );
}
