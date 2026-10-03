import React, { useState, useEffect } from 'react';
import { User, Save, Apple, Users, Pill, FileText, Plus, Trash2, ShieldAlert, Award, Activity, Calendar, CalendarPlus, Clock, UserPlus, Stethoscope, ArrowRightLeft, IdCard } from 'lucide-react';
import RenderCharts from './Charts';
import { updatePatientManifest, addPatientVitals, getAppointments, createAppointment, createPatient, updateAppointment, getDoctors, updateDoctorStatus, transferPatient } from '../api';

export default function DoctorConsole({ patients = [], selectedId, onSelectId, onUpdatePatients, activeDoctorId, onForceRefresh }) {
  const activePatient = patients.find(p => (p.patient_id || p.id) === selectedId) || patients[0];

  const [docStatus, setDocStatus] = useState('Available');
  const [allDoctors, setAllDoctors] = useState([]);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notesText, setNotesText] = useState('');
  const [readyToDischarge, setReadyToDischarge] = useState(false);
  const [carbs, setCarbs] = useState(40);
  const [protein, setProtein] = useState(30);
  const [fats, setFats] = useState(20);
  const [fiber, setFiber] = useState(10);
  const [medications, setMedications] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  
  const [vitals, setVitals] = useState({ days: [], bpm: [], systolicBP: [], diastolicBP: [], spo2: [] });
  const [newDay, setNewDay] = useState('');
  const [newBpm, setNewBpm] = useState('');
  const [newSys, setNewSys] = useState('');
  const [newDia, setNewDia] = useState('');
  const [newSpo2, setNewSpo2] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [newApptDate, setNewApptDate] = useState('');
  const [newApptReason, setNewApptReason] = useState('');

  const [registeringAppt, setRegisteringAppt] = useState(null);
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState('Male');

  useEffect(() => {
    getAppointments().then(setAppointments).catch(console.error);
    getDoctors().then(docs => {
      setAllDoctors(docs);
      const me = docs.find(d => d.doctor_id === activeDoctorId);
      if (me) setDocStatus(me.status || 'Available');
    });
  }, [activeDoctorId]);

  useEffect(() => {
    const current = patients.find(p => (p.patient_id || p.id) === selectedId) || patients[0];
    if (current) {
      setName(current.first_name ? `${current.first_name} ${current.last_name}` : current.name || '');
      let calcAge = current.age;
      if (!calcAge && current.date_of_birth) calcAge = new Date().getFullYear() - new Date(current.date_of_birth).getFullYear();
      setAge(calcAge || '');
      setGender(current.gender || '');
      setStatus(current.status || 'Admitted / Evaluating');
      setDischargeDate(current.discharge_date || current.dischargeDate || 'TBD');
      setDiagnosis(current.diagnosis || 'Pending Diagnostics');
      setNotesText(current.notes || '');
      setMedications(current.medications || []);
      setReadyToDischarge(!!current.ready_to_discharge || !!current.readyToDischarge);
      setCarbs(current.diet_carbs ?? current.diet?.carbs ?? 40);
      setProtein(current.diet_protein ?? current.diet?.protein ?? 30);
      setFats(current.diet_fats ?? current.diet?.fats ?? 20);
      setFiber(current.diet_fiber ?? current.diet?.fiber ?? 10);
      
      if (current.vitals && current.vitals.length > 0) {
        setVitals({
          days: current.vitals.map(v => v.notes || "Read"), bpm: current.vitals.map(v => v.heart_rate || 0),
          systolicBP: current.vitals.map(v => v.blood_pressure_systolic || 0), diastolicBP: current.vitals.map(v => v.blood_pressure_diastolic || 0), spo2: current.vitals.map(v => parseFloat(v.oxygen_saturation) || 0)
        });
      } else { setVitals({ days: [], bpm: [], systolicBP: [], diastolicBP: [], spo2: [] }); }
      setSaveSuccess(false);
    }
  }, [selectedId, patients]);

  if (!activePatient) return <div style={{ padding: '2rem', textAlign: 'center' }}>Syncing Clinical Registry Core...</div>;

  const totalMacroSum = Number(carbs) + Number(protein) + Number(fats) + Number(fiber);
  const isBudgetValid = totalMacroSum === 100;
  
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const mySchedule = appointments
    .filter(a => a.doctor_id === activeDoctorId && new Date(a.appointment_date) >= twelveHoursAgo)
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

  const sortedPatients = [...patients].sort((a, b) => {
    if (a.doctor_id === activeDoctorId && b.doctor_id !== activeDoctorId) return -1;
    if (a.doctor_id !== activeDoctorId && b.doctor_id === activeDoctorId) return 1;
    return 0;
  });

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setDocStatus(newStatus);
    try { await updateDoctorStatus(activeDoctorId, { status: newStatus }); } catch (err) {}
  };

  const handleTransfer = async (e) => {
    const targetDocId = Number(e.target.value);
    if (!targetDocId) return;
    const confirmTransfer = window.confirm("Are you sure you want to transfer this patient to another physician's care?");
    if (confirmTransfer) {
      try {
        await transferPatient(activePatient.patient_id, { doctor_id: targetDocId });
        alert("Patient successfully transferred.");
        if(onForceRefresh) onForceRefresh();
      } catch (err) { alert("Failed to transfer patient."); }
    }
  };

  const handleRegisterGuest = async (e) => {
    e.preventDefault();
    try {
      const nameParts = registeringAppt.guest_name.split(' ');
      const newPat = await createPatient({ first_name: nameParts[0] || 'Unknown', last_name: nameParts.slice(1).join(' ') || 'Patient', date_of_birth: newDob, gender: newGender, contact_number: registeringAppt.guest_contact || 'N/A' });
      await updateAppointment(registeringAppt.appointment_id, { patient_id: newPat.patient_id });
      alert("Guest successfully converted to Registered Patient!");
      setRegisteringAppt(null);
      if(onForceRefresh) onForceRefresh(); 
      getAppointments().then(setAppointments);
    } catch (err) { alert("Failed to register patient."); }
  };

  const handleAddVital = async () => {
    if (!newDay) return alert("Please enter a Day/Time label");
    try {
      const dbId = activePatient.patient_id || activePatient.id;
      await addPatientVitals(dbId, { heart_rate: Number(newBpm)||null, blood_pressure_systolic: Number(newSys)||null, blood_pressure_diastolic: Number(newDia)||null, oxygen_saturation: Number(newSpo2)||null, notes: newDay });
      if(onForceRefresh) onForceRefresh();
      setNewDay(''); setNewBpm(''); setNewSys(''); setNewDia(''); setNewSpo2('');
    } catch (error) { alert("Error saving vital reading to database."); }
  };

  const handleScheduleAppt = async (e) => {
    e.preventDefault();
    if (!newApptDate || !newApptReason) return alert("Fill in date and reason");
    try {
      const created = await createAppointment({ doctor_id: activeDoctorId, patient_id: activePatient.patient_id, appointment_date: new Date(newApptDate).toISOString(), reason: newApptReason });
      setAppointments([...appointments, created]);
      setNewApptDate(''); setNewApptReason('');
      alert("Follow-up appointment scheduled successfully!");
    } catch (error) { alert("Failed to schedule appointment."); }
  };

  const handleGlobalSave = async (e) => {
    if (e) e.preventDefault();
    if (!isBudgetValid) return;
    try {
      const dbId = activePatient.patient_id || activePatient.id;
      const nameParts = name.trim().split(" ");
      const payload = {
        first_name: nameParts[0] || "Unknown", last_name: nameParts.slice(1).join(" ") || "Patient",
        gender: gender, status: readyToDischarge && activePatient.patient_consented_discharge ? "Fully Discharged" : status,
        discharge_date: dischargeDate, diagnosis: diagnosis, notes: notesText, ready_to_discharge: readyToDischarge,
        patient_consented_discharge: !!activePatient.patient_consented_discharge,
        diet_carbs: Number(carbs), diet_protein: Number(protein), diet_fats: Number(fats), diet_fiber: Number(fiber),
        medications: medications 
      };
      await updatePatientManifest(dbId, payload);
      if(onForceRefresh) onForceRefresh(); // RE-FETCH FROM DB TO KEEP VITALS & DISCHARGE SYNCED
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) { alert("Error saving patient data to database."); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', width: '100%', position: 'relative' }}>
      
      {registeringAppt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '1.25rem', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e3a8a', fontSize: '1.5rem', fontWeight: 800 }}>Register New Patient</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Convert guest appointment <strong>{registeringAppt.guest_name}</strong> to a permanent patient record.</p>
            <form onSubmit={handleRegisterGuest}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem', color: '#475569' }}>DATE OF BIRTH</label>
              <input type="date" required value={newDob} onChange={e=>setNewDob(e.target.value)} style={{ width: '100%', padding: '0.85rem', marginBottom: '1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }}/>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.4rem', color: '#475569' }}>GENDER</label>
              <select value={newGender} onChange={e=>setNewGender(e.target.value)} style={{ width: '100%', padding: '0.85rem', marginBottom: '2rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ flex: 1, background: '#2563eb', color: '#fff', padding: '0.85rem', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>Register Patient</button>
                <button type="button" onClick={() => setRegisteringAppt(null)} style={{ padding: '0.85rem 1.5rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={18} color="#0f766e" /><span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>My Status</span></div>
           <select value={docStatus} onChange={handleStatusChange} style={{ padding: '0.4rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontWeight: 700, outline: 'none', fontSize: '0.85rem', cursor: 'pointer' }}>
             <option value="Available">🟢 Available</option><option value="In Surgery">🔴 In Surgery</option><option value="In Review">🔵 In Review</option><option value="Lunch/Break">🟠 Lunch/Break</option>
           </select>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', color: '#1e40af', borderBottom: '2px solid #f1f5f9' }}>
            <Calendar size={18} /><h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>My Schedule</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '35vh', overflowY: 'auto' }}>
            {mySchedule.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textAlign: 'center', padding: '1rem' }}>No upcoming appointments.</p> : null}
            {mySchedule.map(a => (
              <div key={a.appointment_id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{a.guest_name ? `Guest: ${a.guest_name}` : `Patient #${a.patient_id}`}</div>
                <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem' }}><Clock size={14}/> {new Date(a.appointment_date).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>{a.reason}</div>
                {a.guest_name && !a.patient_id && (
                  <button onClick={() => setRegisteringAppt(a)} style={{ marginTop: '0.75rem', background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, width: '100%' }}><UserPlus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }}/> Convert to Patient</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', color: '#0f766e', borderBottom: '2px solid #f1f5f9' }}>
            <Users size={18} /><h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>Ward Registry</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
            {sortedPatients.map(p => {
              const pId = p.patient_id || p.id;
              const activeId = activePatient.patient_id || activePatient.id;
              const displayName = p.first_name ? `${p.first_name} ${p.last_name}` : p.name;
              const isMine = p.doctor_id === activeDoctorId;
              return (
                <button key={pId} onClick={() => onSelectId(pId)} style={{ width: '100%', padding: '0.9rem', borderRadius: '0.6rem', border: pId === activeId ? '1px solid #0d9488' : '1px solid #e2e8f0', background: pId === activeId ? '#f0fdfa' : '#ffffff', textAlign: 'left', cursor: 'pointer', transition: '0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>{p.ready_to_discharge && p.patient_consented_discharge ? "🟢 Checked Out" : `ID: #${pId}`}</div>
                  </div>
                  {isMine && <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>My Patient</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: '#ccfbf1', color: '#0f766e', padding: '0.75rem', borderRadius: '50%', display: 'flex' }}><User size={24} /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{name || "Unnamed Patient"}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Live Profile • ID: #{activePatient.patient_id || activePatient.id}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <ArrowRightLeft size={12} color="#64748b" />
                  <select value={activePatient.doctor_id || ''} onChange={handleTransfer} style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', fontWeight: 800, color: '#475569', cursor: 'pointer', outline: 'none' }}>
                    <option value="">Transfer Patient...</option>
                    {allDoctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Attending: Dr. {d.last_name} ({d.specialty})</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <button onClick={handleGlobalSave} disabled={!isBudgetValid} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isBudgetValid ? '#0f766e' : '#94a3b8', color: '#ffffff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(15,118,110,0.2)' }}>
            <Save size={18} /> {saveSuccess ? 'Saved' : 'Save System Manifest'}
          </button>
        </div>

        <div style={{ background: readyToDischarge ? '#f0fdf4' : '#fff7ed', borderRadius: '1rem', border: readyToDischarge ? '1px solid #bbf7d0' : '1px solid #ffedd5', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {readyToDischarge ? <Award size={28} color="#16a34a" /> : <ShieldAlert size={28} color="#ea580c" />}
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: readyToDischarge ? '#166534' : '#9a3412' }}>Discharge Tracking Sequence</h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: readyToDischarge ? '#15803d' : '#c2410c', fontWeight: 600 }}>
                {readyToDischarge ? "Authorized. Patient can execute checkout from portal." : "Locked. Enable button below to dispatch authorization."}
              </p>
            </div>
          </div>
          <button onClick={() => setReadyToDischarge(!readyToDischarge)} style={{ background: readyToDischarge ? '#dc2626' : '#16a34a', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer' }}>
            {readyToDischarge ? "Revoke Ready Status" : "MARK READY"}
          </button>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}><IdCard size={22} color="#0f766e" /> Patient Medical Identity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>FULL LEGAL NAME</label><input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 700, color: '#1e293b' }} /></div>
            <div><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>AGE / DOB</label><input type="number" value={age} onChange={e => setAge(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 700, color: '#1e293b' }} /></div>
            <div><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>BIOLOGICAL SEX</label><input type="text" value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 700, color: '#1e293b' }} /></div>
            <div style={{ gridColumn: 'span 3' }}><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>PRIMARY DIAGNOSIS</label><input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} style={{ width: '100%', padding: '0.85rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: 800, color: '#1e40af', fontSize: '1.05rem' }} /></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}><Pill size={20} color="#8b5cf6" /> Prescriptions</h3>
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', borderRadius: '0.5rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', border: '1px solid #e2e8f0' }}>
              {medications.map((med, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <span><strong style={{ color: '#1e293b' }}>{med.name}</strong> - <span style={{ color: '#64748b' }}>{med.dosage}</span></span>
                  <button onClick={() => setMedications(medications.filter((_, i) => i !== idx))} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '0.5rem' }}>
              <input type="text" placeholder="Medicine" value={newMedName} onChange={e => setNewMedName(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }} />
              <input type="text" placeholder="Dosage" value={newMedDosage} onChange={e => setNewMedDosage(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }} />
              <button onClick={() => { if(newMedName && newMedDosage) { setMedications([...medications, {name: newMedName, dosage: newMedDosage}]); setNewMedName(''); setNewMedDosage(''); } }} style={{ background: '#8b5cf6', color: '#ffffff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 800 }}><Plus size={16} /></button>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}><Apple size={20} color="#0d9488" /> Macro Target Matrix</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isBudgetValid ? '#166534' : '#b91c1c', background: isBudgetValid ? '#dcfce7' : '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>Total: {totalMacroSum}%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[['Carbs', carbs, setCarbs], ['Protein', protein, setProtein], ['Fats', fats, setFats], ['Fiber', fiber, setFiber]].map(([label, val, setVal], i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>{label}</label>
                  <input type="number" value={val} onChange={e => setVal(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxSizing: 'border-box', fontWeight: 600 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}><Activity size={20} color="#2563eb" /> Append Telemetry Reading</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>TIME/LABEL</label><input type="text" placeholder="e.g. Day 4" value={newDay} onChange={e => setNewDay(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxSizing: 'border-box', fontWeight: 600 }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>BPM</label><input type="number" placeholder="85" value={newBpm} onChange={e => setNewBpm(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxSizing: 'border-box', fontWeight: 600 }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>SYS BP</label><input type="number" placeholder="120" value={newSys} onChange={e => setNewSys(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxSizing: 'border-box', fontWeight: 600 }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>DIA BP</label><input type="number" placeholder="80" value={newDia} onChange={e => setNewDia(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxSizing: 'border-box', fontWeight: 600 }} /></div>
            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '0.3rem' }}>SpO2 (%)</label><input type="number" placeholder="98" value={newSpo2} onChange={e => setNewSpo2(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxSizing: 'border-box', fontWeight: 600 }} /></div>
            <button onClick={handleAddVital} style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', fontWeight: 800, cursor: 'pointer', height: '37px', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>Add</button>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <RenderCharts vitals={vitals} diet={{ carbs, protein, fats, fiber }} />
        </div>

      </div>
    </div>
  );
}