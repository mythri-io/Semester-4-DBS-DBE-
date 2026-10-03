import React, { useState, useEffect } from 'react';
import { Users, Calendar, UserPlus, LayoutDashboard, DollarSign, Activity, Package, Stethoscope } from 'lucide-react';
import { getAppointments, createPatient, updateAppointment, getAllBills, getInventory, getDoctors, addDoctor } from '../api';

export default function AdminDashboard({ patients, onForceRefresh }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, operations, hr
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [registeringAppt, setRegisteringAppt] = useState(null);
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState('Male');

  // HR State
  const [newDocFirst, setNewDocFirst] = useState('');
  const [newDocLast, setNewDocLast] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocSpec, setNewDocSpec] = useState('');

  const fetchData = () => {
    getAppointments().then(setAppointments).catch(console.error);
    getAllBills().then(setBills).catch(console.error);
    getInventory().then(setInventory).catch(console.error);
    getDoctors().then(setDoctors).catch(console.error);
  };

  useEffect(() => { fetchData(); }, []);

  const totalRevenue = bills.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
  const pendingGuests = appointments.filter(a => a.guest_name && !a.patient_id).length;
  const lowStockItems = inventory.filter(i => i.stock < 100).length;

  const handleRegisterGuest = async (e) => {
    e.preventDefault();
    try {
      const nameParts = registeringAppt.guest_name.split(' ');
      const newPat = await createPatient({ first_name: nameParts[0] || 'Unknown', last_name: nameParts.slice(1).join(' ') || 'Patient', date_of_birth: newDob, gender: newGender, contact_number: registeringAppt.guest_contact || 'N/A' });
      await updateAppointment(registeringAppt.appointment_id, { patient_id: newPat.patient_id });
      alert("Guest successfully converted to Registered Patient!");
      setRegisteringAppt(null); onForceRefresh(); getAppointments().then(setAppointments);
    } catch (err) { alert("Failed to register patient."); }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await addDoctor({ first_name: newDocFirst, last_name: newDocLast, email: newDocEmail, specialty: newDocSpec, password_hash: "1234" });
      alert(`Dr. ${newDocLast} successfully onboarded!`);
      setNewDocFirst(''); setNewDocLast(''); setNewDocEmail(''); setNewDocSpec('');
      fetchData();
    } catch (err) { alert("Failed to add doctor."); }
  };

  const getStatusColor = (status) => {
    if (status === 'Available') return { bg: '#dcfce7', text: '#166534' };
    if (status === 'In Surgery') return { bg: '#fee2e2', text: '#991b1b' };
    if (status === 'In Review') return { bg: '#dbeafe', text: '#1e40af' };
    return { bg: '#ffedd5', text: '#9a3412' }; 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', gap: '1rem', background: '#fff', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', width: 'fit-content' }}>
        <button onClick={() => setActiveTab('overview')} style={{ padding: '0.75rem 1.5rem', background: activeTab === 'overview' ? '#1e40af' : 'transparent', color: activeTab === 'overview' ? '#fff' : '#64748b', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LayoutDashboard size={18} /> Executive Overview</button>
        <button onClick={() => setActiveTab('operations')} style={{ padding: '0.75rem 1.5rem', background: activeTab === 'operations' ? '#1e40af' : 'transparent', color: activeTab === 'operations' ? '#fff' : '#64748b', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} /> Operations & Queue</button>
        <button onClick={() => setActiveTab('hr')} style={{ padding: '0.75rem 1.5rem', background: activeTab === 'hr' ? '#1e40af' : 'transparent', color: activeTab === 'hr' ? '#fff' : '#64748b', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={18} /> Staff / HR Onboarding</button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Revenue</span><div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '0.5rem', color: '#2563eb' }}><DollarSign size={20} /></div></div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Active Patients</span><div style={{ background: '#ecfdf5', padding: '0.5rem', borderRadius: '0.5rem', color: '#10b981' }}><Users size={20} /></div></div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{patients.length}</div>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Pending Guests</span><div style={{ background: '#fffbeb', padding: '0.5rem', borderRadius: '0.5rem', color: '#f59e0b' }}><UserPlus size={20} /></div></div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{pendingGuests}</div>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Low Stock Alerts</span><div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '0.5rem', color: '#ef4444' }}><Package size={20} /></div></div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{lowStockItems}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Recent Financial Activity</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead><tr style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}><th style={{ paddingBottom: '1rem' }}>Invoice ID</th><th style={{ paddingBottom: '1rem' }}>Patient ID</th><th style={{ paddingBottom: '1rem' }}>Amount</th></tr></thead>
                <tbody>
                  {bills.slice(-5).reverse().map(b => (
                    <tr key={b.bill_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 700, color: '#1e293b' }}>#{b.bill_id}</td>
                      <td style={{ padding: '1rem 0', color: '#475569', fontWeight: 600 }}>ID: {b.patient_id}</td>
                      <td style={{ padding: '1rem 0', fontWeight: 800, color: '#0f766e' }}>${parseFloat(b.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Active Staff Operations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {doctors.map(doc => {
                  const colors = getStatusColor(doc.status);
                  return (
                    <div key={doc.doctor_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <div><div style={{ fontWeight: 800, color: '#1e293b' }}>Dr. {doc.first_name} {doc.last_name}</div><div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{doc.specialty}</div></div>
                      <div style={{ background: colors.bg, color: colors.text, padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{doc.status || 'Available'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'operations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: '#0f172a' }}><Calendar size={22} color="#2563eb" /> Guest Booking Queue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {appointments.filter(a => a.guest_name && !a.patient_id).map(a => (
                <div key={a.appointment_id} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{a.guest_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>Date: {new Date(a.appointment_date).toLocaleString()}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>Reason: {a.reason}</div>
                  <button onClick={() => setRegisteringAppt(a)} style={{ marginTop: '1rem', background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, width: '100%', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.2)' }}><UserPlus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }}/> Process Registration</button>
                </div>
              ))}
              {appointments.filter(a => a.guest_name && !a.patient_id).length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontWeight: 700 }}>No pending guest registrations.</div>}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: '#0f172a' }}><Users size={22} color="#0f766e" /> Master Patient Registry</h2>
            {registeringAppt ? (
              <form onSubmit={handleRegisterGuest} style={{ background: '#eff6ff', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #bfdbfe', marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', color: '#1e3a8a', fontSize: '1.2rem', fontWeight: 800 }}>Registering: {registeringAppt.guest_name}</h4>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem', color: '#475569' }}>DATE OF BIRTH</label>
                <input type="date" required value={newDob} onChange={e=>setNewDob(e.target.value)} style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}/>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem', color: '#475569' }}>GENDER</label>
                <select value={newGender} onChange={e=>setNewGender(e.target.value)} style={{ width: '100%', padding: '0.85rem', marginBottom: '2rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" style={{ flex: 1, background: '#2563eb', color: '#fff', padding: '0.85rem', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer' }}>Save Profile</button>
                  <button type="button" onClick={() => setRegisteringAppt(null)} style={{ padding: '0.85rem 1.5rem', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto', marginTop: '1.5rem' }}>
                {patients.map(p => (
                  <div key={p.patient_id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                    <span style={{ color: '#0f766e', marginRight: '0.5rem' }}>#{p.patient_id}</span> {p.first_name} {p.last_name} 
                    <span style={{ float: 'right', color: '#64748b' }}>{p.gender}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'hr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: '#0f172a' }}><Stethoscope size={22} color="#8b5cf6" /> Onboard New Physician</h2>
            <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>FIRST NAME</label><input type="text" required value={newDocFirst} onChange={e=>setNewDocFirst(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}/></div>
                <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>LAST NAME</label><input type="text" required value={newDocLast} onChange={e=>setNewDocLast(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}/></div>
              </div>
              <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>EMAIL ADDRESS</label><input type="email" required value={newDocEmail} onChange={e=>setNewDocEmail(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}/></div>
              <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>SPECIALTY</label><input type="text" required value={newDocSpec} onChange={e=>setNewDocSpec(e.target.value)} placeholder="e.g. Pediatrics" style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}/></div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '0.5rem' }}>* Default portal passcode will be set to '1234'</div>
              <button type="submit" style={{ background: '#8b5cf6', color: '#fff', padding: '0.85rem', borderRadius: '0.5rem', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 6px -1px rgba(139,92,246,0.2)' }}>Add Physician to Roster</button>
            </form>
          </div>

          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: '#0f172a' }}><Users size={22} color="#0f766e" /> Current Physician Roster</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', maxHeight: '50vh', overflowY: 'auto' }}>
              {doctors.map(doc => (
                <div key={doc.doctor_id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>Dr. {doc.first_name} {doc.last_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>{doc.specialty} | {doc.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}