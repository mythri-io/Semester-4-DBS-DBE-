import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export const getDoctors = async () => (await api.get('/doctors')).data;
export const addDoctor = async (docData) => (await api.post('/doctors', docData)).data;
export const updateDoctorStatus = async (id, statusData) => (await api.put(`/doctors/${id}/status`, statusData)).data;

export const getPatients = async () => (await api.get('/patients')).data;
export const createPatient = async (data) => (await api.post('/patients', data)).data;
export const getPatientVitals = async (patientId) => (await api.get(`/patients/${patientId}/vitals`)).data;
export const addPatientVitals = async (patientId, vitalsData) => (await api.post(`/patients/${patientId}/vitals`, vitalsData)).data;
export const updatePatientManifest = async (patientId, patientData) => (await api.put(`/patients/${patientId}`, patientData)).data;
export const transferPatient = async (id, data) => (await api.put(`/patients/${id}/transfer`, data)).data;
export const updatePatientConsent = async (id, data) => (await api.put(`/patients/${id}/consent`, data)).data;

export const getAppointments = async () => (await api.get('/appointments')).data;
export const createAppointment = async (apptData) => (await api.post('/appointments', apptData)).data;
export const updateAppointment = async (id, statusData) => (await api.put(`/appointments/${id}`, statusData)).data;

export const getInventory = async () => (await api.get('/inventory')).data;
export const addInventoryItem = async (itemData) => (await api.post('/inventory', itemData)).data;

export const getAllBills = async () => (await api.get('/bills')).data;
export const createBill = async (billData) => (await api.post('/bills', billData)).data;
export const getPatientBills = async (patientId) => (await api.get(`/patients/${patientId}/bills`)).data;
export const updateBillStatus = async (billId, statusData) => (await api.put(`/bills/${billId}`, statusData)).data;

export default api;