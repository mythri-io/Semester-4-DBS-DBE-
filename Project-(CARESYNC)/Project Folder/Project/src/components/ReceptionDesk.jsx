import React, { useState, useEffect } from 'react';
import { Calendar, UserPlus, Users, Stethoscope, Clock, CheckCircle } from 'lucide-react';
import { getAppointments, getDoctors, createPatient, updateAppointment, createAppointment } from '../api';

export default function ReceptionDesk({ patients, onForceRefresh }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Registration State
  const [registeringAppt, setRegisteringAppt] = useState(null);
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState('Male');

  // Walk-in State
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [guestDate, setGuestDate] = useState('');
  const [guestReason, setGuestReason] = useState('');
  const [guestDoc, setGuestDoc] = useState('');

  useEffect(() => {
    getAppointments().then(setAppointments).catch(console.error);
    getDoctors().then(data => {
      setDoctors(data);
      if(data.length > 0) setGuestDoc(data[0].doctor_id);
    }).catch(console.error);
  }, []);

  const handleRegisterGuest = async (e) => {
    e.preventDefault();
    try {
      const nameParts = registeringAppt.guest_name.split(' ');
      const newPat = await createPatient({ first_name: nameParts[0] || 'Unknown', last_name: nameParts.slice(1).join(' ') || 'Patient', date_of_birth: newDob, gender: newGender, contact_number: registeringAppt.guest_contact || 'N/A' });
      await updateAppointment(registeringAppt.appointment_id, { patient_id: newPat.patient_id });
      alert("Registration Complete!");
      setRegisteringAppt(null);
      onForceRefresh(); 
      getAppointments().then(setAppointments);
    } catch (err) { alert("Failed to register patient."); }
  };

  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({ doctor_id: guestDoc, guest_name: guestName, guest_contact: guestContact, appointment_date: guestDate, reason: guestReason });
      alert(`Walk-in processed for ${guestName}!`);
      setGuestName(''); setGuestContact(''); setGuestDate(''); setGuestReason('');
      getAppointments().then(setAppointments);
    } catch (error) { alert("Failed to book appointment."); }
  };

  const pendingGuests = appointments.filter(a => a.guest_name && !a.patient_id);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* LEFT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* DOCTOR STATUS */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={20} color="#0f766e" /> Physician Availability</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {doctors.map(doc => (
              <div key={doc.doctor_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div><span style={{ fontWeight: 800, color: '#1e293b' }}>Dr. {doc.last_name}</span> <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({doc.specialty})</span></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: doc.status === 'Available' ? '#dcfce7' : '#fee2e2', color: doc.status === 'Available' ? '#166534' : '#991b1b' }}>{doc.status || 'Available'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WALK-IN BOOKING */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} color="#2563eb" /> Walk-in / Phone Booking</h2>
          <form onSubmit={handleWalkInBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" required placeholder="Guest Name" value={guestName} onChange={e=>setGuestName(e.target.value)} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} />
            <input type="email" placeholder="Email / Phone" value={guestContact} onChange={e=>setGuestContact(e.target.value)} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} />
            <select value={guestDoc} onChange={e=>setGuestDoc(Number(e.target.value))} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}>
              {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.last_name} ({d.specialty})</option>)}
            </select>
            <input type="datetime-local" required value={guestDate} onChange={e=>setGuestDate(e.target.value)} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} />
            <input type="text" required placeholder="Reason" value={guestReason} onChange={e=>setGuestReason(e.target.value)} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} />
            <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '0.85rem', borderRadius: '0.5rem', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Schedule Guest</button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* REGISTRATION QUEUE */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={20} color="#f59e0b" /> Intake Queue ({pendingGuests.length})</h2>
          
          {registeringAppt ? (
            <form onSubmit={handleRegisterGuest} style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #fde68a' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#b45309' }}>Registering: {registeringAppt.guest_name}</h4>
              <input type="date" required value={newDob} onChange={e=>setNewDob(e.target.value)} style={{ width: '100%', padding: '0.85rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #fcd34d', fontWeight: 600 }}/>
              <select value={newGender} onChange={e=>setNewGender(e.target.value)} style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem', borderRadius: '0.5rem', border: '1px solid #fcd34d', fontWeight: 600 }}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ flex: 1, background: '#f59e0b', color: '#fff', padding: '0.75rem', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer' }}>Complete Intake</button>
                <button type="button" onClick={() => setRegisteringAppt(null)} style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#b45309', border: '1px solid #fcd34d', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {pendingGuests.map(a => (
                <div key={a.appointment_id} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{a.guest_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}><Clock size={12} style={{verticalAlign:'middle'}}/> {new Date(a.appointment_date).toLocaleString()}</div>
                  <button onClick={() => setRegisteringAppt(a)} style={{ marginTop: '1rem', background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, width: '100%' }}>Begin Intake Process</button>
                </div>
              ))}
              {pendingGuests.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontWeight: 700 }}>Queue is clear!</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}