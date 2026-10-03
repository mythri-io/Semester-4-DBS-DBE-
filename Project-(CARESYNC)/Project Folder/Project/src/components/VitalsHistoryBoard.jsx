import React, { useState } from 'react';

export default function VitalsHistoryBoard({ vitals }) {
  const [timeView, setTimeView] = useState('days');

  // Helper arrays to mock the groupings based on your raw daily data
  const days = vitals?.days || [];
  const bpm = vitals?.bpm || [];
  const sys = vitals?.systolicBP || [];
  const dia = vitals?.diastolicBP || [];
  const spo2 = vitals?.spo2 || [];

  // Grouping configuration based on your exact requirements
  const viewConfigs = {
    days: { label: '7 Days', chunk: 7, title: 'Daily Tracker (7-Day Rolling)' },
    weeks: { label: '10 Weeks', chunk: 10, title: 'Weekly Progress (10-Week Span)' },
    months: { label: '10 Months', chunk: 10, title: 'Monthly Progress (10-Month Span)' },
    years: { label: '5 Years', chunk: 5, title: 'Long-term Tracking (5-Year Span)' }
  };

  // Mock chunking logic to demonstrate the scrollable UI based on interval selection
  const getChunkedData = () => {
    const chunkSize = viewConfigs[timeView].chunk;
    const result = [];
    for (let i = 0; i < days.length; i += 1) { // In a real app, this would aggregate data by actual dates
      result.push({
        interval: timeView === 'days' ? days[i] : `Period ${i + 1}`,
        bpm: bpm[i] || '--',
        bp: `${sys[i] || '--'}/${dia[i] || '--'}`,
        spo2: spo2[i] || '--'
      });
    }
    // Limit to the required chunk sizes for the scrollable view
    return result.slice(0, chunkSize); 
  };

  const activeData = getChunkedData();

  return (
    <div style={{ border: '1px solid #e4e4e7', borderRadius: '0.5rem', background: '#ffffff', overflow: 'hidden' }}>
      
      {/* Timeframe Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e4e4e7' }}>
        {Object.entries(viewConfigs).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setTimeView(key)}
            style={{ padding: '0.75rem', border: 'none', background: timeView === key ? '#ffffff' : 'transparent', color: timeView === key ? '#0d9488' : '#64748b', fontWeight: timeView === key ? 700 : 500, borderBottom: timeView === key ? '2px solid #0d9488' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Scrollable Matrix */}
      <div style={{ padding: '1rem' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#334155' }}>{viewConfigs[timeView].title}</h4>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ padding: '0.75rem' }}>Interval</th>
                <th style={{ padding: '0.75rem' }}>Heart Rate (BPM)</th>
                <th style={{ padding: '0.75rem' }}>Blood Pressure (mmHg)</th>
                <th style={{ padding: '0.75rem' }}>Oxygen (SpO2%)</th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: '#475569' }}>{row.interval}</td>
                  <td style={{ padding: '0.75rem', color: '#0f766e', fontWeight: 500 }}>{row.bpm}</td>
                  <td style={{ padding: '0.75rem', color: '#b91c1c', fontWeight: 500 }}>{row.bp}</td>
                  <td style={{ padding: '0.75rem', color: '#0369a1', fontWeight: 500 }}>{row.spo2}%</td>
                </tr>
              ))}
              {activeData.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>No clinical data logged for this timeframe.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}