import React, { useState, useEffect } from 'react';
import { Pill, Printer, FileText, Save, Clock, Plus, Trash2, ShoppingCart, Package, Database, CheckCircle } from 'lucide-react';
import { getInventory, createBill, getPatientBills, addInventoryItem, updateBillStatus } from '../api';

export default function Pharmacy({ patients }) {
  const [activeTab, setActiveTab] = useState('billing'); 
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [patientBills, setPatientBills] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedMed, setSelectedMed] = useState('');
  const [newInvName, setNewInvName] = useState('');
  const [newInvPrice, setNewInvPrice] = useState('');
  const [newInvStock, setNewInvStock] = useState('');

  const fetchInventory = () => getInventory().then(setInventory).catch(console.error);

  useEffect(() => { fetchInventory(); }, []);

  useEffect(() => {
    if (selectedPatient) {
      getPatientBills(selectedPatient.patient_id).then(setPatientBills).catch(console.error);
      const initialCart = (selectedPatient.medications || []).map(med => {
        const invItem = inventory.find(i => i.name.toLowerCase() === med.name.toLowerCase());
        return { id: Math.random().toString(36).substr(2, 9), name: med.name, dosage: med.dosage, price: invItem ? parseFloat(invItem.price) : 10.00, type: 'Prescription' };
      });
      setCart(initialCart);
    }
  }, [selectedPatient, inventory]);

  const handleAddManualItem = () => {
    if (!selectedMed) return;
    const invItem = inventory.find(i => i.name === selectedMed);
    if (invItem) {
      setCart([...cart, { id: Math.random().toString(36).substr(2, 9), name: invItem.name, dosage: 'As needed', price: parseFloat(invItem.price), type: 'Added to Bill' }]);
      setSelectedMed('');
    }
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price, 0);

  const handleSaveBill = async () => {
    const total = calculateTotal();
    if (total === 0) return alert("Invoice is empty!");
    setIsSaving(true);
    try {
      const newBill = await createBill({ patient_id: selectedPatient.patient_id, total_amount: total, status: "Unpaid" });
      setPatientBills([...patientBills, newBill]);
      alert("Invoice successfully saved to database!");
      setCart([]); 
    } catch (err) { alert("Failed to save bill."); }
    setIsSaving(false);
  };

  const handleAddNewInventory = async (e) => {
    e.preventDefault();
    try {
      await addInventoryItem({ name: newInvName, price: parseFloat(newInvPrice), stock: parseInt(newInvStock) });
      alert("Item successfully added to central database!");
      setNewInvName(''); setNewInvPrice(''); setNewInvStock('');
      fetchInventory(); 
    } catch (err) { alert("Failed to add inventory item."); }
  };

  const togglePaymentStatus = async (billId, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    try {
      await updateBillStatus(billId, { status: newStatus });
      setPatientBills(patientBills.map(b => b.bill_id === billId ? { ...b, status: newStatus } : b));
    } catch (err) { alert("Failed to update bill status."); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <button onClick={() => setActiveTab('billing')} style={{ width: '100%', padding: '1.25rem', background: activeTab === 'billing' ? '#eff6ff' : '#fff', border: 'none', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, color: activeTab === 'billing' ? '#1e40af' : '#64748b', cursor: 'pointer' }}><ShoppingCart size={20} /> Invoice Builder</button>
          <button onClick={() => setActiveTab('inventory')} style={{ width: '100%', padding: '1.25rem', background: activeTab === 'inventory' ? '#eff6ff' : '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, color: activeTab === 'inventory' ? '#1e40af' : '#64748b', cursor: 'pointer' }}><Database size={20} /> Database Manager</button>
        </div>

        {activeTab === 'billing' && (
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}><FileText size={18} color="#0f766e" /> Patient Registry</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '55vh', overflowY: 'auto' }}>
              {patients.map(p => (
                <button key={p.patient_id} onClick={() => setSelectedPatient(p)} style={{ padding: '0.85rem', textAlign: 'left', background: selectedPatient?.patient_id === p.patient_id ? '#f0fdfa' : '#f8fafc', border: selectedPatient?.patient_id === p.patient_id ? '1px solid #0d9488' : '1px solid #e2e8f0', borderRadius: '0.6rem', cursor: 'pointer', fontWeight: 700, color: '#1e293b', transition: '0.2s' }}>
                  {p.first_name} {p.last_name}
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>ID: #{p.patient_id}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {activeTab === 'inventory' && (
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={28} color="#2563eb" /> Central Medicine Inventory</h2>
            </div>
            <form onSubmit={handleAddNewInventory} style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ flex: 2 }}><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>MEDICINE NAME</label><input type="text" required value={newInvName} onChange={e=>setNewInvName(e.target.value)} placeholder="e.g. Adderall 20mg" style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} /></div>
              <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>PRICE (USD)</label><input type="number" step="0.01" required value={newInvPrice} onChange={e=>setNewInvPrice(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} /></div>
              <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem' }}>STOCK QTY</label><input type="number" required value={newInvStock} onChange={e=>setNewInvStock(e.target.value)} placeholder="100" style={{ width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} /></div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', height: '45px', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>Save to DB</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ background: '#f1f5f9', color: '#475569' }}><th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', borderRadius: '0.5rem 0 0 0' }}>Database Item ID & Name</th><th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Unit Price</th><th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', borderRadius: '0 0.5rem 0 0' }}>Units in Stock</th></tr></thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.item_id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b' }}><span style={{ color: '#94a3b8', marginRight: '0.5rem' }}>#{item.item_id}</span> <Package size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#8b5cf6' }}/>{item.name}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f766e' }}>${parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: item.stock < 50 ? '#ef4444' : '#1e293b' }}>{item.stock} Units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'billing' && selectedPatient && (
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem' }}>
              <div><h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', fontWeight: 800 }}>CareSync Pharmacy Invoice</h2><p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontWeight: 600 }}>Patient: {selectedPatient.first_name} {selectedPatient.last_name} (ID: #{selectedPatient.patient_id})</p></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleSaveBill} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f766e', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(15,118,110,0.2)' }}><Save size={18} /> {isSaving ? "Saving..." : "Save Invoice"}</button>
                <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer' }}><Printer size={18} /> Print</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', alignItems: 'center' }}>
              <ShoppingCart size={20} color="#64748b" />
              <select value={selectedMed} onChange={e => setSelectedMed(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontWeight: 600 }}><option value="">Select Medicine from Database...</option>{inventory.map(inv => (<option key={inv.item_id} value={inv.name}>{inv.name} - ${parseFloat(inv.price).toFixed(2)} (Stock: {inv.stock})</option>))}</select>
              <button onClick={handleAddManualItem} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.375rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Plus size={16} /> Add Item</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ background: '#f1f5f9', color: '#475569' }}><th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Item Name</th><th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Details / Dosage</th><th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Price</th><th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Action</th></tr></thead>
              <tbody>
                {cart.length > 0 ? cart.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b' }}><Pill size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: item.type === 'Prescription' ? '#8b5cf6' : '#2563eb' }}/>{item.name}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{item.type}: {item.dosage}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 700 }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}><button onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button></td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>No items added to invoice.</td></tr>}
              </tbody>
            </table>
            <div style={{ marginTop: '2rem', textAlign: 'right', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block', float: 'right' }}>Total Due: <span style={{ color: '#0f766e' }}>${calculateTotal().toFixed(2)}</span></div>
            <div style={{ clear: 'both' }}></div>

            {patientBills.length > 0 && (
              <div style={{ marginTop: '3rem', borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontSize: '1.1rem' }}><Clock size={18} /> Past Invoice Ledger</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                  {patientBills.map(bill => (
                    <div key={bill.bill_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <div><div style={{ fontWeight: 800, color: '#1e293b' }}>Invoice #{bill.bill_id}</div><div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>{new Date(bill.issued_at).toLocaleString()}</div></div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '1.3rem' }}>${parseFloat(bill.total_amount).toFixed(2)}</div>
                        <button onClick={() => togglePaymentStatus(bill.bill_id, bill.status)} style={{ background: bill.status === 'Paid' ? '#dcfce7' : '#fef3c7', color: bill.status === 'Paid' ? '#166534' : '#b45309', border: bill.status === 'Paid' ? '1px solid #bbf7d0' : '1px solid #fde68a', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={12} /> {bill.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && !selectedPatient && (
          <div style={{ background: '#fff', padding: '4rem', borderRadius: '1rem', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>
            <ShoppingCart size={48} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 1rem auto' }} /> Select a patient from the registry to view or generate invoices.
          </div>
        )}
      </div>
    </div>
  );
}