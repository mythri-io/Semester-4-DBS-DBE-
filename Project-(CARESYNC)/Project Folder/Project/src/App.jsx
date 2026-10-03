import React, { useState, useEffect } from 'react';
import DoctorConsole from './components/DoctorConsole';
import PatientView from './components/PatientView';
import AdminDashboard from './components/AdminDashboard';
import Pharmacy from './components/Pharmacy';
import ReceptionDesk from './components/ReceptionDesk';
import { DatabaseZap, HeartPulse, CalendarPlus, ArrowRight, LogOut } from 'lucide-react';
import { getPatients, createAppointment } from './api';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [userRole, setUserRole] = useState('guest'); 
  const [guestView, setGuestView] = useState('home'); 
  const [loginTab, setLoginTab] = useState('reception'); 
  
  const [patientLoginId, setPatientLoginId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(1); 
  const [selectedId, setSelectedId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [serverStatus, setServerStatus] = useState('Connecting...');

  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [guestDate, setGuestDate] = useState('');
  const [guestReason, setGuestReason] = useState('');
  const [guestDoc, setGuestDoc] = useState(1);

  const initData = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
      setServerStatus('CareSync Engine Online');
      if (data.length > 0 && !selectedId) setSelectedId(data[0].patient_id);
    } catch (err) { setServerStatus('API Offline - Start Python Server'); }
  };

  useEffect(() => { initData(); }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginTab === 'patient') {
      const inputCleaned = patientLoginId.trim().toUpperCase().replace('ADM-', '');
      const matched = patients.find(p => String(p.patient_id).toUpperCase() === inputCleaned || String(p.patient_id) === patientLoginId.trim());
      if (matched) { setSelectedId(matched.patient_id); setUserRole('patient'); setLoginError(''); }
      else { setLoginError('Patient ID not recognized in database.'); }
    } else if (loginTab === 'doctor' && passcode === '1234') { setUserRole('doctor'); setLoginError(''); setPasscode('');
    } else if (loginTab === 'admin' && passcode === 'admin123') { setUserRole('admin'); setLoginError(''); setPasscode('');
    } else if (loginTab === 'pharmacy' && passcode === 'pharmacy123') { setUserRole('pharmacy'); setLoginError(''); setPasscode('');
    } else if (loginTab === 'reception' && passcode === 'reception123') { setUserRole('reception'); setLoginError(''); setPasscode('');
    } else { setLoginError('Invalid Secure Passcode.'); }
  };

  const handleGuestBooking = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({ doctor_id: guestDoc, guest_name: guestName, guest_contact: guestContact, appointment_date: guestDate, reason: guestReason });
      alert(`Appointment requested successfully for ${guestName}!`);
      setGuestView('home'); setGuestName(''); setGuestContact(''); setGuestDate(''); setGuestReason('');
    } catch (error) { alert("Failed to request appointment. Check connection."); }
  };

  const handleLogout = () => { setUserRole('guest'); setGuestView('home'); setLoginError(''); setPasscode(''); setPatientLoginId(''); };
  const activePatient = patients.find(p => p.patient_id === selectedId) || patients[0];

  if (userRole === 'guest') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => setGuestView('home')}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: '#ffffff', padding: '0.65rem', borderRadius: '0.6rem', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}><HeartPulse size={26} /></div>
            <div><span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em' }}>CareSync</span><span style={{ fontSize: '0.8rem', display: 'block', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Network</span></div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={() => setGuestView('book')} style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: '0.2s' }}><CalendarPlus size={18}/> Book Appointment</button>
            <button onClick={() => setGuestView('login')} style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)', transition: '0.2s' }}>Portal Login <ArrowRight size={18} /></button>
          </nav>
        </header>

        {guestView === 'home' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <section style={{ position: 'relative', background: 'linear-gradient(rgba(30, 58, 138, 0.9), rgba(30, 64, 175, 0.95)), url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', color: '#ffffff', padding: '7rem 2rem', textAlign: 'center' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1.2rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Next-Gen Clinical Environment</span>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '1.5rem 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>Seamless Healthcare, Connected to You.</h1>
                <p style={{ fontSize: '1.15rem', color: '#dbeafe', lineHeight: 1.6, margin: '0 0 2.5rem 0' }}>Experience real-time telemetry, instant doctor access, and comprehensive health tracking all in one unified platform.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setGuestView('book')} style={{ background: '#ffffff', color: '#1e40af', border: 'none', padding: '1rem 2.5rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>Book Appointment</button>
                  <button onClick={() => setGuestView('login')} style={{ background: 'transparent', color: '#ffffff', border: '2px solid #ffffff', padding: '1rem 2.5rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Patient Portal</button>
                </div>
              </div>
            </section>
            <section style={{ background: '#ffffff', padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dcfce7', color: '#166534', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 800 }}><DatabaseZap size={16} /> {serverStatus}</div>
              </div>
            </section>
          </div>
        )}

        {guestView === 'book' && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 1rem', background: 'linear-gradient(135deg, #f0fdfa 0%, #e2e8f0 100%)' }}>
            <form onSubmit={handleGuestBooking} style={{ width: '100%', maxWidth: '500px', background: '#ffffff', borderRadius: '1.25rem', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ background: '#eff6ff', display: 'inline-block', padding: '1rem', borderRadius: '50%', color: '#2563eb', marginBottom: '1rem' }}><CalendarPlus size={32} /></div>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.6rem', fontWeight: 800 }}>Request an Appointment</h2>
              </div>
              <input type="text" required placeholder="Full Name" value={guestName} onChange={e=>setGuestName(e.target.value)} style={{ padding: '0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              <input type="email" required placeholder="Email Address" value={guestContact} onChange={e=>setGuestContact(e.target.value)} style={{ padding: '0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              <select value={guestDoc} onChange={e=>setGuestDoc(Number(e.target.value))} style={{ padding: '0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}>
                <option value={1}>Dr. Sarah Connor (Cardiology)</option><option value={2}>Dr. Gregory House (Diagnostics)</option><option value={3}>Dr. Derek Shepherd (Neurology)</option>
              </select>
              <input type="datetime-local" required value={guestDate} onChange={e=>setGuestDate(e.target.value)} style={{ padding: '0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
              <textarea required placeholder="Reason for visit..." value={guestReason} onChange={e=>setGuestReason(e.target.value)} style={{ padding: '0.9rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', minHeight: '90px', fontFamily: 'inherit' }} />
              <button type="submit" style={{ background: '#2563eb', color: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>Submit Request</button>
            </form>
          </div>
        )}

        {guestView === 'login' && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem', background: 'linear-gradient(135deg, #f0fdfa 0%, #e2e8f0 100%)' }}>
            <div style={{ width: '100%', maxWidth: '500px', background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e4e4e7', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', padding: '2.25rem 1.5rem', textAlign: 'center', color: '#ffffff' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>CareSync Portal</h1>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#bfdbfe' }}>Identity Verification Required</p>
              </div>
              <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e4e4e7' }}>
                {['reception', 'doctor', 'patient', 'pharmacy', 'admin'].map(tab => (
                  <button key={tab} onClick={() => { setLoginTab(tab); setLoginError(''); }} style={{ flex: 1, padding: '1rem 0', border: 'none', background: loginTab === tab ? '#ffffff' : 'transparent', color: loginTab === tab ? '#2563eb' : '#64748b', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: loginTab === tab ? '3px solid #2563eb' : '3px solid transparent', cursor: 'pointer' }}>{tab}</button>
                ))}
              </div>
              <div style={{ padding: '2.25rem 1.75rem' }}>
                {loginError && <div style={{ color: '#dc2626', background: '#fef2f2', padding: '0.85rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontWeight: 700, border: '1px solid #fee2e2' }}>{loginError}</div>}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {loginTab === 'patient' ? (
                    <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Patient ID</label><input type="text" placeholder="e.g. 1" value={patientLoginId} onChange={e => setPatientLoginId(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} /></div>
                  ) : (
                    <>
                      {loginTab === 'doctor' && (
                        <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Physician</label><select value={selectedDoctorId} onChange={e => setSelectedDoctorId(Number(e.target.value))} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}><option value={1}>Dr. Connor</option><option value={2}>Dr. House</option><option value={3}>Dr. Shepherd</option></select></div>
                      )}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Secure Passcode</label>
                        <input type="password" placeholder={`Enter ${loginTab} passcode`} value={passcode} onChange={e => setPasscode(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 600 }}>Demo: reception123, doctor(1234), pharmacy123, admin123</div>
                      </div>
                    </>
                  )}
                  <button type="submit" style={{ background: '#2563eb', color: '#ffffff', padding: '0.9rem', borderRadius: '0.5rem', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>Authenticate</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto 1.75rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: '#ffffff', padding: '0.55rem', borderRadius: '0.5rem' }}><HeartPulse size={20} /></div>
          <div><h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>CareSync Workspace</h1><p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Role: <span style={{ color: '#2563eb', textTransform: 'uppercase' }}>{userRole}</span></p></div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.55rem 1.15rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}><LogOut size={14} /> Disconnect</button>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {userRole === 'doctor' && <DoctorConsole patients={patients} selectedId={selectedId} onSelectId={setSelectedId} onUpdatePatients={setPatients} activeDoctorId={selectedDoctorId} onForceRefresh={initData} />}
        {userRole === 'patient' && <PatientView patient={activePatient} onForceRefresh={initData} />}
        {userRole === 'admin' && <AdminDashboard patients={patients} onForceRefresh={initData} />}
        {userRole === 'pharmacy' && <Pharmacy patients={patients} />}
        {userRole === 'reception' && <ReceptionDesk patients={patients} onForceRefresh={initData} />}
      </div>
    </div>
  );
}