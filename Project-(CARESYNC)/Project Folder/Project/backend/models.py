from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Doctor(Base):
    __tablename__ = "doctors"
    doctor_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    specialty = Column(String(100))
    status = Column(String(50), default="Available")
    created_at = Column(DateTime, default=datetime.datetime.now)

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="SET NULL"))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)
    contact_number = Column(String(20))
    admission_date = Column(Date, default=datetime.date.today)
    status = Column(String(100), default="Admitted / Evaluating")
    discharge_date = Column(String(50), default="TBD")
    diagnosis = Column(String(255), default="Pending Diagnostics")
    notes = Column(Text)
    ready_to_discharge = Column(Boolean, default=False)
    patient_consented_discharge = Column(Boolean, default=False)
    diet_carbs = Column(Integer, default=40)
    diet_protein = Column(Integer, default=30)
    diet_fats = Column(Integer, default=20)
    diet_fiber = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.datetime.now)

    vitals = relationship("Vital", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")

class Medication(Base):
    __tablename__ = "medications"
    medication_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    dosage = Column(String(100), nullable=False)
    patient = relationship("Patient", back_populates="medications")

class Vital(Base):
    __tablename__ = "vitals"
    vital_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.now)
    heart_rate = Column(Integer)
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    temperature = Column(Numeric(5, 2))
    respiratory_rate = Column(Integer)
    oxygen_saturation = Column(Numeric(5, 2))
    notes = Column(Text) 
    patient = relationship("Patient", back_populates="vitals")

class Appointment(Base):
    __tablename__ = "appointments"
    appointment_id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=True)
    guest_name = Column(String(100), nullable=True)
    guest_contact = Column(String(100), nullable=True)
    appointment_date = Column(DateTime, nullable=False)
    reason = Column(String(255))
    status = Column(String(50), default="Scheduled") 
    doctor = relationship("Doctor")
    patient = relationship("Patient")

class MedicineInventory(Base):
    __tablename__ = "medicine_inventory"
    item_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=100)

class Bill(Base):
    __tablename__ = "bills"
    bill_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="Unpaid") 
    issued_at = Column(DateTime, default=datetime.datetime.now)
    patient = relationship("Patient")