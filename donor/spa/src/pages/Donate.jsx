import React, {useState} from 'react';
import {useApi} from '../lib/api';

export default function Donate() {
  const api = useApi();
  const [amount, setAmount] = useState(10);
  const [testimonial, setTestimonial] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await api.post('/donations/create-payment-intent', {amount: Number(amount), currency: 'USD', testimonial: testimonial || undefined});
      setStatus('success');
    } catch (e) {
      setError(e.message || 'Failed to create donation');
      setStatus('error');
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h2>Donate</h2>
        <p>Your contribution helps us move food where it’s needed most.</p>
        {status === 'success' ? (
          <div>
            <p>Thank you for your donation!</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="row">
              <label htmlFor="amount">Amount (USD)</label>
              <input id="amount" type="number" min="1" step="0.5" value={amount} onChange={(e)=>setAmount(e.target.value)} required />
            </div>
            <div className="row">
              <label htmlFor="testimonial">Testimonial (optional)</label>
              <textarea id="testimonial" value={testimonial} onChange={(e)=>setTestimonial(e.target.value)} placeholder="Why you support Replate" />
            </div>
            {error && <div className="error" role="alert">{error}</div>}
            <button className="btn" disabled={status==='submitting'}>
              {status==='submitting' ? 'Processing…' : 'Donate'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
