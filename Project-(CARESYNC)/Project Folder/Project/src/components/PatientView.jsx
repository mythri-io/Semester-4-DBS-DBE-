import React, { useState, useEffect } from 'react';
import { User, Activity, Pill, Apple, ShieldAlert, Award, FileText, CheckCircle, IdCard } from 'lucide-react';
import RenderCharts from './Charts';
import { updatePatientConsent, getDoctors } from '../api';

export default function PatientView({ patient, onForceRefresh }) {
  const [doctors, setDoctors] = useState([]);
  const [consenting, setConsenting] = useState(false);

  useEffect(() => {
    getDoctors().then(setDoctors).catch(console.error);
  }, []);

  if (!patient) return <div style={{ padding: '2rem', textAlign: 'center' }}>Connecting to CareSync...</div>;

  const doctor = doctors.find(d => d.doctor_id === patient.doctor_id);
  const docName = doctor ? `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty})` : "Unassigned";

  const vitals = {
    days: (patient.vitals || []).map(v => v.notes || "Read"),
    bpm: (patient.vitals || []).map(v => v.heart_rate || 0),
    systolicBP: (patient.vitals || []).map(v => v.blood_pressure_systolic || 0),
    diastolicBP: (patient.vitals || []).map(v => v.blood_pressure_diastolic || 0),
    spo2: (patient.vitals || []).map(v => parseFloat(v.oxygen_saturation) || 0)
  };

  let calcAge = patient.age;
  if (!calcAge && patient.date_of_birth) calcAge = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();

  const handleConsent = async () => {
    setConsenting(true);
    try {
      await updatePatientConsent(patient.patient_id, { consented: true });
      alert("Discharge forms signed! You are fully checked out.");
      if (onForceRefresh) onForceRefresh();
    } catch (err) {
      alert("Failed to sign discharge forms.");
    }
    setConsenting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ background: patient.patient_consented_discharge ? '#f0fdf4' : (patient.ready_to_discharge ? '#eff6ff' : '#fff7ed'), borderRadius: '1rem', border: patient.patient_consented_discharge ? '1px solid #bbf7d0' : (patient.ready_to_discharge ? '1px solid #bfdbfe' : '1px solid #ffedd5'), padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {patient.patient_consented_discharge ? <CheckCircle size={36} color="#16a34a" /> : (patient.ready_to_discharge ? <Award size={36} color="#2563eb" /> : <ShieldAlert size={36} color="#ea580c" />)}
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: patient.patient_consented_discharge ? '#166534' : (patient.ready_to_discharge ? '#1e3a8a' : '#9a3412') }}>Discharge Authorization Tracker</h2>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '1rem', color: patient.patient_consented_discharge ? '#15803d' : (patient.ready_to_discharge ? '#1e40af' : '#c2410c'), fontWeight: 600 }}>
              {patient.patient_consented_discharge 
                ? "You have successfully signed out. Have a safe recovery!" 
                : (patient.ready_to_discharge 
                    ? "Your physician has authorized your discharge. Please sign out to complete the sequence." 
                    : "Your physician is currently reviewing your case. Discharge has not been authorized yet.")}
            </p>
          </div>
        </div>
        {patient.ready_to_discharge && !patient.patient_consented_discharge && (
          <button onClick={handleConsent} disabled={consenting} style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '1rem 2rem', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.3)' }}>
            {consenting ? "Signing..." : "Acknowledge & Sign Out"}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}><IdCard size={24} color="#0f766e" /> My Medical Identity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>FULL LEGAL NAME</label><div style={{ padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{patient.first_name} {patient.last_name}</div></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>AGE / DOB</label><div style={{ padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{calcAge} Years Old</div></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>GENDER</label><div style={{ padding: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{patient.gender}</div></div>
              <div style={{ gridColumn: 'span 3' }}><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>PRIMARY DIAGNOSIS</label><div style={{ padding: '0.85rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', fontWeight: 800, color: '#1e40af', fontSize: '1.1rem' }}>{patient.diagnosis || 'Evaluating...'}</div></div>
              <div style={{ gridColumn: 'span 3' }}><label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>ATTENDING PHYSICIAN</label><div style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 800, color: '#0f766e', fontSize: '1.05rem' }}>{docName}</div></div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}><Activity size={24} color="#2563eb" /> Live Telemetry Overview</h3>
            <RenderCharts vitals={vitals} diet={{ carbs: patient.diet_carbs || 40, protein: patient.diet_protein || 30, fats: patient.diet_fats || 20, fiber: patient.diet_fiber || 10 }} />
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}><Pill size={24} color="#8b5cf6" /> My Prescriptions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(patient.medications || []).length > 0 ? patient.medications.map((med, idx) => (
                <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>{med.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.3rem' }}>{med.dosage}</div>
                </div>
              )) : <div style={{ color: '#94a3b8', fontWeight: 700 }}>No active prescriptions.</div>}
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}><Apple size={24} color="#0d9488" /> Clinical Diet Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#f0fdfa', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ccfbf1' }}><div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase' }}>Carbs</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#115e59' }}>{patient.diet_carbs || 40}%</div></div>
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #dbeafe' }}><div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>Protein</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>{patient.diet_protein || 30}%</div></div>
              <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fef3c7' }}><div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Fats</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e' }}>{patient.diet_fats || 20}%</div></div>
              <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fee2e2' }}><div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>Fiber</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b' }}>{patient.diet_fiber || 10}%</div></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}