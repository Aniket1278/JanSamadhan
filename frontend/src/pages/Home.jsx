import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import LocationPicker from '../LocationPicker.jsx';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [reps, setReps] = useState(null);
  const [deps, setDeps] = useState([]);

  useEffect(() => { api('/stats').then(setStats).catch(() => {}); }, []);
  const onLocation = async id => {
    if (!id) return setReps(null);
    setReps(await api('/representatives?location=' + id));
    setDeps(await api('/departments?location=' + id));
  };

  return (
    <>
      <div className="card hero" style={{ textAlign: 'center' }}>
        <h1>Your problem. Your leaders. Your progress.</h1>
        <p className="muted">Report local issues and follow them until they are resolved.</p>
        <Link to="/submit"><button>Submit a complaint</button></Link>
      </div>

      <div className="card">
        <h2>Find my leaders and departments</h2>
        <LocationPicker onChange={onLocation} />
        {reps && (reps.length ? reps.map(r => (
          <p key={r.id}><b>{r.role}: {r.name}</b> {r.party && `(${r.party})`}<br />
            <span className="muted">{r.constituency} · <a href={r.source_url} target="_blank" rel="noreferrer">official source</a></span></p>
        )) : <p className="note">No verified details for this area yet. We never guess names.</p>)}
        {deps.map(d => <p key={d.id}>🏢 {d.name}</p>)}
      </div>

      {stats && (
        <div className="card grid">
          <div><h2>{stats.total}</h2>complaints filed</div>
          <div><h2>{stats.resolved}</h2>resolved</div>
        </div>
      )}
    </>
  );
}
