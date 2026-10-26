import { useEffect, useState } from 'react';
import { api } from './api.js';

// Dependent dropdowns: State -> District -> Taluka -> Village/Ward. Calls onChange(deepest selected id).
export default function LocationPicker({ onChange }) {
  const [levels, setLevels] = useState([{ options: [], value: '' }]);

  const load = async (parent, depth) => {
    const options = await api('/locations' + (parent ? `?parent=${parent}` : ''));
    setLevels(l => [...l.slice(0, depth), { options, value: '' }]);
  };
  useEffect(() => { load(null, 0); }, []);

  const pick = (depth, id) => {
    setLevels(l => l.map((x, i) => (i === depth ? { ...x, value: id } : x)));
    onChange?.(id || null);
    if (id) load(id, depth + 1);
    else setLevels(l => l.slice(0, depth + 1));
  };
  const labels = ['State / UT', 'District', 'Taluka / Tehsil', 'Village / City / Ward'];

  return (
    <div className="grid">
      {levels.map((l, i) => l.options.length > 0 && (
        <label key={i} className="muted">{labels[i]}
          <select value={l.value} onChange={e => pick(i, e.target.value)}>
            <option value="">Select</option>
            {l.options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
      ))}
    </div>
  );
}
