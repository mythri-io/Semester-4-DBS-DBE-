from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
import models

app = FastAPI(title="CareSync API")

app.add_middleware(
    CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class MedicationCreate(BaseModel): name: str; dosage: str
class PatientCreate(BaseModel): first_name: str; last_name: str; date_of_birth: str; gender: str; contact_number: str
class PatientUpdate(BaseModel):
    first_name: str
    last_name: str
    gender: str
    status: str
    discharge_date: str
    diagnosis: str
    notes: str
    ready_to_discharge: bool
    patient_consented_discharge: Optional[bool] = False # PREVENTS DISCHARGE RESET
    diet_carbs: int
    diet_protein: int
    diet_fats: int
    diet_fiber: int
    medications: List[MedicationCreate] = []

class VitalCreate(BaseModel): heart_rate: Optional[int]=None; blood_pressure_systolic: Optional[int]=None; blood_pressure_diastolic: Optional[int]=None; oxygen_saturation: Optional[float]=None; notes: Optional[str]=None 
class AppointmentCreate(BaseModel): doctor_id: Optional[int]=None; patient_id: Optional[int]=None; guest_name: Optional[str]=None; guest_contact: Optional[str]=None; appointment_date: datetime; reason: str
class AppointmentUpdate(BaseModel): status: Optional[str]=None; patient_id: Optional[int]=None
class BillCreate(BaseModel): patient_id: int; total_amount: float; status: str = "Unpaid"
class BillUpdate(BaseModel): status: str
class InventoryCreate(BaseModel): name: str; price: float; stock: int
class DoctorStatusUpdate(BaseModel): status: str
class DoctorCreate(BaseModel): first_name: str; last_name: str; email: str; specialty: str; password_hash: str = "1234"
class TransferUpdate(BaseModel): doctor_id: int
class ConsentUpdate(BaseModel): consented: bool

@app.get("/doctors")
def get_doctors(db: Session = Depends(get_db)): return db.query(models.Doctor).all()

@app.post("/doctors")
def create_doctor(doc: DoctorCreate, db: Session = Depends(get_db)):
    new_doc = models.Doctor(email=doc.email, password_hash=doc.password_hash, first_name=doc.first_name, last_name=doc.last_name, specialty=doc.specialty)
    db.add(new_doc); db.commit(); db.refresh(new_doc)
    return new_doc

@app.put("/doctors/{doctor_id}/status")
def update_doctor_status(doctor_id: int, payload: DoctorStatusUpdate, db: Session = Depends(get_db)):
    doc = db.query(models.Doctor).filter(models.Doctor.doctor_id == doctor_id).first()
    if doc: doc.status = payload.status; db.commit(); db.refresh(doc)
    return doc

@app.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).options(joinedload(models.Patient.vitals), joinedload(models.Patient.medications)).all()

@app.post("/patients")
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    new_pat = models.Patient(first_name=patient.first_name, last_name=patient.last_name, date_of_birth=patient.date_of_birth, gender=patient.gender, contact_number=patient.contact_number)
    db.add(new_pat); db.commit(); db.refresh(new_pat)
    return new_pat

@app.get("/patients/{patient_id}/vitals")
def get_patient_vitals(patient_id: int, db: Session = Depends(get_db)):
    return db.query(models.Vital).filter(models.Vital.patient_id == patient_id).all()

@app.post("/patients/{patient_id}/vitals")
def add_patient_vitals(patient_id: int, vital: VitalCreate, db: Session = Depends(get_db)):
    new_vital = models.Vital(patient_id=patient_id, heart_rate=vital.heart_rate, blood_pressure_systolic=vital.blood_pressure_systolic, blood_pressure_diastolic=vital.blood_pressure_diastolic, oxygen_saturation=vital.oxygen_saturation, notes=vital.notes)
    db.add(new_vital); db.commit(); db.refresh(new_vital)
    return new_vital

@app.put("/patients/{patient_id}")
def update_patient_manifest(patient_id: int, payload: PatientUpdate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not db_patient: raise HTTPException(status_code=404, detail="Patient not found")
    
    db_patient.first_name = payload.first_name
    db_patient.last_name = payload.last_name
    db_patient.gender = payload.gender
    db_patient.status = payload.status
    db_patient.discharge_date = payload.discharge_date
    db_patient.diagnosis = payload.diagnosis
    db_patient.notes = payload.notes
    db_patient.ready_to_discharge = payload.ready_to_discharge
    db_patient.patient_consented_discharge = payload.patient_consented_discharge
    db_patient.diet_carbs = payload.diet_carbs
    db_patient.diet_protein = payload.diet_protein
    db_patient.diet_fats = payload.diet_fats
    db_patient.diet_fiber = payload.diet_fiber

    db.query(models.Medication).filter(models.Medication.patient_id == patient_id).delete()
    for med in payload.medications: db.add(models.Medication(patient_id=patient_id, name=med.name, dosage=med.dosage))
    db.commit()
    return {"message": "Updated"}

@app.put("/patients/{patient_id}/transfer")
def transfer_patient(patient_id: int, payload: TransferUpdate, db: Session = Depends(get_db)):
    pat = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if pat: pat.doctor_id = payload.doctor_id; db.commit(); db.refresh(pat)
    return pat

@app.put("/patients/{patient_id}/consent")
def consent_discharge(patient_id: int, payload: ConsentUpdate, db: Session = Depends(get_db)):
    pat = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if pat: 
        pat.patient_consented_discharge = payload.consented
        if pat.ready_to_discharge and payload.consented: pat.status = "Fully Discharged"
        db.commit(); db.refresh(pat)
    return pat

@app.get("/appointments")
def get_appointments(db: Session = Depends(get_db)): return db.query(models.Appointment).all()
@app.post("/appointments")
def create_appointment(appt: AppointmentCreate, db: Session = Depends(get_db)):
    new_appt = models.Appointment(doctor_id=appt.doctor_id, patient_id=appt.patient_id, guest_name=appt.guest_name, guest_contact=appt.guest_contact, appointment_date=appt.appointment_date, reason=appt.reason)
    db.add(new_appt); db.commit(); db.refresh(new_appt)
    return new_appt
@app.put("/appointments/{appointment_id}")
def update_appointment(appointment_id: int, payload: AppointmentUpdate, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.appointment_id == appointment_id).first()
    if appt:
        if payload.status: appt.status = payload.status
        if payload.patient_id: appt.patient_id = payload.patient_id
        db.commit(); db.refresh(appt)
    return appt

@app.get("/inventory")
def get_inventory(db: Session = Depends(get_db)): return db.query(models.MedicineInventory).all()
@app.post("/inventory")
def add_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    new_item = models.MedicineInventory(name=item.name, price=item.price, stock=item.stock)
    db.add(new_item); db.commit(); db.refresh(new_item)
    return new_item

@app.get("/bills")
def get_all_bills(db: Session = Depends(get_db)): return db.query(models.Bill).all()
@app.post("/bills")
def create_bill(bill: BillCreate, db: Session = Depends(get_db)):
    new_bill = models.Bill(patient_id=bill.patient_id, total_amount=bill.total_amount, status=bill.status)
    db.add(new_bill); db.commit(); db.refresh(new_bill)
    return new_bill
@app.get("/patients/{patient_id}/bills")
def get_patient_bills(patient_id: int, db: Session = Depends(get_db)): return db.query(models.Bill).filter(models.Bill.patient_id == patient_id).all()
@app.put("/bills/{bill_id}")
def update_bill_status(bill_id: int, payload: BillUpdate, db: Session = Depends(get_db)):
    bill = db.query(models.Bill).filter(models.Bill.bill_id == bill_id).first()
    if bill: bill.status = payload.status; db.commit(); db.refresh(bill)
    return bill