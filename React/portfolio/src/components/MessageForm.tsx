import type { FormEvent } from 'react';
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function MessageForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    try {
      setStatus('loading');
      await addDoc(collection(db, 'messages'), {
        name,
        email,
        message,
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Your name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />
      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Your email"
        type="email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />
      <textarea
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Your message"
        rows={4}
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
        disabled={status==='loading'}
      >
        {status==='loading' ? 'Sending…' : 'Send Message'}
      </button>
      {status==='success' && <p className="text-green-600 text-sm">Message sent. Thank you!</p>}
      {status==='error' && <p className="text-red-600 text-sm">Failed to send. Try again.</p>}
    </form>
  );
}
