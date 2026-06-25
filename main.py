# ===== IMPORT =====
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

# ===== LOAD ENV =====
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TABLE = os.getenv("TABLE")

if not SUPABASE_URL or not SUPABASE_KEY or not TABLE:
    raise RuntimeError("Missing SUPABASE_URL, SUPABASE_KEY, or TABLE in .env")

BASE_URL = f"{SUPABASE_URL}/rest/v1/{TABLE}"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# ===== INIT APP =====
app = FastAPI(title="API Mahasiswa Supabase")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== MODEL =====
class Mahasiswa(BaseModel):
    nama: str
    nim: str
    jurusan: str

# ===== HELPER =====
def safe_response(r):
    try:
        if r.text and r.text.strip():
            return r.json()
        else:
            return {"message": "success"}
    except:
        return {"raw": r.text}


# ===== ROUTES =====

# ROOT
@app.get("/")
def root():
    return FileResponse("index.html")

# GET DATA
@app.get("/mahasiswa")
def get_mahasiswa():
    r = requests.get(BASE_URL, headers=headers)

    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return safe_response(r)

# INSERT DATA
@app.post("/mahasiswa")
def create_mahasiswa(data: Mahasiswa):
    r = requests.post(BASE_URL, headers=headers, json=data.dict())

    if r.status_code not in [200, 201]:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return safe_response(r)

# UPDATE DATA
@app.put("/mahasiswa/{id}")
def update_mahasiswa(id: str, data: Mahasiswa):
    url = f"{BASE_URL}?id=eq.{id}"

    r = requests.patch(url, headers=headers, json=data.dict())

    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return safe_response(r)

# DELETE DATA
@app.delete("/mahasiswa/{id}")
def delete_mahasiswa(id: str):
    url = f"{BASE_URL}?id=eq.{id}"

    r = requests.delete(url, headers=headers)

    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    return {"message": "deleted"}

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)