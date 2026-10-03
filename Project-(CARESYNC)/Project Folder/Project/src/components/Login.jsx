import React, { useState } from 'react';
import { ActivitySquare } from 'lucide-react';

export default function EnterpriseLogin({ onLogin, patients }) {
  const [mode, setMode] = useState('doctor'); 
  const [docId, setDocId] = useState('');
  const [docName, setDocName] = useState('');
  const [patName, setPatName] = useState('');
  const [patAdmitId, setPatAdmitId] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (mode === 'doctor') {
      if (!docId || !docName) return alert("Enter ID and Name.");
      onLogin({ id: docId, name: docName }, 'doctor');
    } else {
      const match = patients.find(p => p.name.toLowerCase() === patName.toLowerCase() && p.id === patAdmitId);
      if (match) onLogin(match, 'patient');
      else alert("Patient record not found.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: '#005E9A' }}>
            <ActivitySquare size={32} />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px' }}>MediDocs</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Secure Healthcare<br /><strong style={{ fontWeight: 700 }}>Telemetry Portal</strong>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '400px' }}>
            Enterprise-grade electronic health records and automated discharge intelligence.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>Welcome</h2>
          <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Please log in to continue to your dashboard.</p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button type="button" onClick={() => setMode('doctor')} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: mode === 'doctor' ? '2px solid #005E9A' : '1px solid #e2e8f0', background: mode === 'doctor' ? '#f0f6fa' : 'transparent', fontWeight: 600, color: mode === 'doctor' ? '#005E9A' : '#64748b', cursor: 'pointer' }}>
              Practitioner
            </button>
            <button type="button" onClick={() => setMode('patient')} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: mode === 'patient' ? '2px solid #005E9A' : '1px solid #e2e8f0', background: mode === 'patient' ? '#f0f6fa' : 'transparent', fontWeight: 600, color: mode === 'patient' ? '#005E9A' : '#64748b', cursor: 'pointer' }}>
              Patient
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'doctor' ? (
              <>
                <input type="text" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} placeholder="Practitioner ID (e.g. DOC-123)" value={docId} onChange={e => setDocId(e.target.value)} />
                <input type="text" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} placeholder="Full Name (e.g. Dr. Smith)" value={docName} onChange={e => setDocName(e.target.value)} />
              </>
            ) : (
              <>
                <input type="text" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} placeholder="Patient Legal Name" value={patName} onChange={e => setPatName(e.target.value)} />
                <input type="text" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} placeholder="Admit ID (e.g. ADM-88301)" value={patAdmitId} onChange={e => setPatAdmitId(e.target.value)} />
              </>
            )}
            <button type="submit" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#005E9A', color: 'white', fontWeight: 'bold', marginTop: '1rem', cursor: 'pointer' }}>Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}