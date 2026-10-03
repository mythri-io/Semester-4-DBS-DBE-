import React, { useState } from 'react';
import { Activity, Heart, Droplet, Clock } from 'lucide-react';

export default function RenderCharts({ vitals, diet }) {
  const [timeframe, setTimeframe] = useState('Months'); 
  
  if (!vitals || !vitals.bpm || vitals.bpm.length === 0) {
    return <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>Awaiting telemetry stream node hookup...</div>;
  }

  let sliceRange = vitals.bpm.length;
  if (timeframe === 'Days') sliceRange = Math.min(3, vitals.bpm.length);
  if (timeframe === 'Weeks') sliceRange = Math.min(5, vitals.bpm.length);
  if (timeframe === 'Months') sliceRange = Math.min(8, vitals.bpm.length);

  const labels = vitals.days ? vitals.days.slice(-sliceRange) : [];
  const bpmData = vitals.bpm ? vitals.bpm.slice(-sliceRange) : [];
  const sysData = vitals.systolicBP ? vitals.systolicBP.slice(-sliceRange) : [];
  const diaData = vitals.diastolicBP ? vitals.diastolicBP.slice(-sliceRange) : [];
  const spoData = vitals.spo2 ? vitals.spo2.slice(-sliceRange) : [];

  const createLinePath = (data, max, min, h, w) => {
    if (!data || data.length < 2) return "";
    const delta = (max - min) || 1;
    const stepX = w / (data.length - 1);
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - ((v - min) / delta) * h}`).join(" ");
  };

  const h = 70;
  const w = 300;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
      
      {/* TIME CONTROLLERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Telemetry Timeline</span>
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '0.375rem', gap: '0.2rem' }}>
          {['Days', 'Weeks', 'Months', 'Years'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              style={{ background: timeframe === t ? '#ffffff' : 'transparent', border: timeframe === t ? '1px solid #cbd5e1' : 'none', color: timeframe === t ? '#0f172a' : '#64748b', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Heart Rate */}
        <div style={{ background: '#fff5f5', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #fee2e2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
            <span><Activity size={12} /> Heart Rate</span>
            <span>{bpmData[bpmData.length - 1] || '--'} BPM</span>
          </div>
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <path d={createLinePath(bpmData, Math.max(...bpmData, 100), Math.min(...bpmData, 50), h, w)} fill="none" stroke="#ef4444" strokeWidth="2" />
          </svg>
        </div>

        {/* BP */}
        <div style={{ background: '#f5f3ff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e0e7ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', marginBottom: '0.5rem' }}>
            <span><Heart size={12} /> Blood Pressure</span>
            <span>{sysData[sysData.length - 1] || '--'}/{diaData[diaData.length - 1] || '--'}</span>
          </div>
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <path d={createLinePath(sysData, 160, 60, h, w)} fill="none" stroke="#6366f1" strokeWidth="2" />
            <path d={createLinePath(diaData, 160, 60, h, w)} fill="none" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* SpO2 */}
        <div style={{ background: '#f0f9ff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e0f2fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem' }}>
            <span><Droplet size={12} /> Oxygen Level</span>
            <span>{spoData[spoData.length - 1] || '--'}%</span>
          </div>
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <path d={createLinePath(spoData, 100, 85, h, w)} fill="none" stroke="#0ea5e9" strokeWidth="2" />
          </svg>
        </div>
      </div>

    </div>
  );
}