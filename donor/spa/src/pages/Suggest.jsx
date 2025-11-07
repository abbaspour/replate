import React, {useState} from 'react';
import {useApi} from '../lib/api';

export default function Suggest() {
  const api = useApi();
  const [name, setName] = useState('');
  const [type, setType] = useState('supplier');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await api.post('/suggestions', {name, type, address});
      setStatus('success');
    } catch (e) {
      setError(e.message || 'Failed to submit suggestion');
      setStatus('error');
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h2>Suggest a Partner</h2>
        {status === 'success' ? (
          <p>Thanks! We’ll review your suggestion.</p>
        ) : (
          <form onSubmit={submit}>
            <div className="row">
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e)=>setName(e.target.value)} required />
            </div>
            <div className="row">
              <label htmlFor="type">Type</label>
              <select id="type" value={type} onChange={(e)=>setType(e.target.value)}>
                <option value="supplier">Supplier</option>
                <option value="community">Community</option>
                <option value="logistics">Logistics</option>
              </select>
            </div>
            <div className="row">
              <label htmlFor="address">Address</label>
              <input id="address" value={address} onChange={(e)=>setAddress(e.target.value)} required />
            </div>
            {error && <div className="error" role="alert">{error}</div>}
            <button className="btn" disabled={status==='submitting'}>
              {status==='submitting' ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
