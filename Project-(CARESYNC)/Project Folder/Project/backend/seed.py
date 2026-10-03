from database import SessionLocal, engine
import models
from datetime import date, datetime, timedelta
import random

print("Rebuilding CareSync database schema...")
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    docs = [
        models.Doctor(email="dr.connor@caresync.com", password_hash="1234", first_name="Sarah", last_name="Connor", specialty="Cardiology", status="Available"),
        models.Doctor(email="dr.house@caresync.com", password_hash="1234", first_name="Gregory", last_name="House", specialty="Diagnostics", status="In Review"),
        models.Doctor(email="dr.shepherd@caresync.com", password_hash="1234", first_name="Derek", last_name="Shepherd", specialty="Neurology", status="In Surgery")
    ]
    db.add_all(docs)
    db.commit()

    patients_data = [
        {"fn": "Robert", "ln": "Chen", "dob": date(1978, 11, 4), "gender": "Male", "status": "Critical Monitoring", "diag": "Severe Hypertension", "carbs": 30, "prot": 40, "fat": 20, "fib": 10},
        {"fn": "Maria", "ln": "Garcia", "dob": date(1992, 3, 15), "gender": "Female", "status": "Evaluating", "diag": "Chronic Migraine", "carbs": 40, "prot": 30, "fat": 20, "fib": 10},
        {"fn": "David", "ln": "Kim", "dob": date(1985, 7, 22), "gender": "Male", "status": "Fully Discharged", "diag": "Post-Op Recovery", "carbs": 50, "prot": 20, "fat": 15, "fib": 15},
        {"fn": "Sarah", "ln": "Jenkins", "dob": date(1965, 9, 10), "gender": "Female", "status": "Admitted", "diag": "Heart Failure", "carbs": 20, "prot": 50, "fat": 20, "fib": 10},
        {"fn": "James", "ln": "OConnor", "dob": date(1955, 12, 5), "gender": "Male", "status": "Admitted", "diag": "Pneumonia", "carbs": 40, "prot": 30, "fat": 20, "fib": 10},
        {"fn": "Anita", "ln": "Patel", "dob": date(1998, 1, 18), "gender": "Female", "status": "Evaluating", "diag": "Suspected Seizure", "carbs": 40, "prot": 30, "fat": 20, "fib": 10},
        {"fn": "Marcus", "ln": "Johnson", "dob": date(2005, 6, 30), "gender": "Male", "status": "Admitted", "diag": "Myocarditis", "carbs": 35, "prot": 35, "fat": 20, "fib": 10}
    ]
    
    for i, p in enumerate(patients_data):
        pat = models.Patient(
            doctor_id=(i % 3) + 1, first_name=p["fn"], last_name=p["ln"], date_of_birth=p["dob"], gender=p["gender"],
            status=p["status"], diagnosis=p["diag"], contact_number="555-010" + str(i),
            diet_carbs=p["carbs"], diet_protein=p["prot"], diet_fats=p["fat"], diet_fiber=p["fib"]
        )
        db.add(pat)
    db.commit()

    today = datetime.now()
    for i in range(1, len(patients_data) + 1):
        db.add(models.Vital(patient_id=i, recorded_at=today-timedelta(days=1), heart_rate=random.randint(70,90), blood_pressure_systolic=random.randint(110,130), blood_pressure_diastolic=random.randint(70,85), oxygen_saturation=random.randint(95,99), notes="Admission Baseline"))
        db.add(models.Vital(patient_id=i, recorded_at=today, heart_rate=random.randint(70,90), blood_pressure_systolic=random.randint(110,130), blood_pressure_diastolic=random.randint(70,85), oxygen_saturation=random.randint(95,99), notes="Current Reading"))
    db.commit()

    db.add_all([
        models.Medication(patient_id=1, name="Lisinopril 20mg", dosage="Daily"),
        models.Medication(patient_id=1, name="Amlodipine 5mg", dosage="Nightly"),
        models.Medication(patient_id=2, name="Sumatriptan 50mg", dosage="PRN")
    ])
    
    inventory = [
        models.MedicineInventory(name="Amoxicillin 500mg", price=15.99, stock=500),
        models.MedicineInventory(name="Lisinopril 20mg", price=12.50, stock=300),
        models.MedicineInventory(name="Atorvastatin 40mg", price=22.00, stock=45),
        models.MedicineInventory(name="Ibuprofen 800mg", price=5.50, stock=1000),
        models.MedicineInventory(name="Sumatriptan 50mg", price=45.00, stock=120),
        models.MedicineInventory(name="Amlodipine 5mg", price=9.99, stock=400)
    ]
    db.add_all(inventory)
    db.commit()

    db.add_all([
        models.Bill(patient_id=1, total_amount=45.50, status="Paid", issued_at=today-timedelta(days=2)),
        models.Bill(patient_id=2, total_amount=120.00, status="Unpaid", issued_at=today-timedelta(hours=5)),
        models.Appointment(doctor_id=1, patient_id=1, appointment_date=today + timedelta(hours=2), reason="Follow-up BP Check"),
        models.Appointment(doctor_id=2, guest_name="Marcus Vance", guest_contact="marcus@email.com", appointment_date=today + timedelta(days=1), reason="Severe joint pain consult")
    ])
    db.commit()

    print("CareSync EXTREME Database successfully seeded! Start Uvicorn.")

except Exception as e:
    db.rollback()
    print(f"Error seeding database: {e}")
finally:
    db.close()