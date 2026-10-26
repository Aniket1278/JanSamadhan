import { useState } from 'react';
import { api } from '../api.js';

// Log in with email + password. A 6-digit email code is needed only to confirm a new account.
export default function Login() {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: '', email: '', password: '', code: '' });
  const [msg, setMsg] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const finish = r => {
    localStorage.setItem('token', r.token);
    localStorage.setItem('user', JSON.stringify(r.user));
    location.href = r.user.role === 'admin' ? '/admin' : '/';
  };

  const submit = async e => {
    e.preventDefault();
    try {
      if (step === 1) {
        const r = await api(`/auth/${mode}`, { method: 'POST', body: f });
        if (r.token) return finish(r); // verified account: the password is enough
        setStep(2);
        setMsg(r.email_error
          ? `The email could not be sent (${r.email_error}). While testing, copy the code from the backend terminal.`
          : 'We emailed you a 6-digit code. It expires in 10 minutes. Check Spam too.');
      } else {
        finish(await api('/auth/verify-otp', { method: 'POST', body: { email: f.email, code: f.code } }));
      }
    } catch (err) { setMsg(err.message); }
  };

  return (
    <form className="card" onSubmit={submit} style={{ maxWidth: 400, margin: '24px auto' }}>
      <h2>{step === 2 ? 'Enter your code' : mode === 'login' ? 'Log in' : 'Create account'}</h2>
      {step === 1 && (<>
        {mode === 'register' && <p><input placeholder="Full name (never shown publicly)" value={f.name} onChange={set('name')} /></p>}
        <p><input type="email" placeholder="Email" value={f.email} onChange={set('email')} /></p>
        <p><input type="password" placeholder="Password (8+ characters)" value={f.password} onChange={set('password')} /></p>
      </>)}
      {step === 2 && <p><input inputMode="numeric" maxLength={6} placeholder="6-digit code" value={f.code} onChange={set('code')} autoFocus /></p>}
      <button>{step === 2 ? 'Verify and continue' : mode === 'login' ? 'Log in' : 'Register and send code'}</button>
      <p className="muted">{msg}</p>
      {step === 1 && <a href="#" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'New here? Register' : 'Have an account? Log in'}</a>}
    </form>
  );
}
