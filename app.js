import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { SUPABASE_URL, SUPABASE_KEY, TABLE } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY || !TABLE) {
  throw new Error("Missing SUPABASE_URL, SUPABASE_KEY, or TABLE in .env");
}

const BASE_URL = `${SUPABASE_URL}/rest/v1/${TABLE}`;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const safeResponse = async (response) => {
  const text = await response.text();
  if (!text || !text.trim()) {
    return { message: "success" };
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
};

const buildHeaders = (token) => {
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${token || SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  return headers;
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token tidak disediakan" });
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return res.status(401).json({ error: "Token tidak valid" });
  }

  next();
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/login", async (req, res) => {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const body = await safeResponse(response);
  if (!response.ok) {
    return res.status(response.status).json(body);
  }

  return res.json(body);
});

app.get("/mahasiswa", verifyToken, async (req, res) => {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: buildHeaders(req.headers.authorization?.split(" ")[1]),
  });

  const body = await safeResponse(response);
  if (!response.ok) {
    return res.status(response.status).json(body);
  }

  res.json(body);
});

app.post("/mahasiswa", verifyToken, async (req, res) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: buildHeaders(req.headers.authorization?.split(" ")[1]),
    body: JSON.stringify(req.body),
  });

  const body = await safeResponse(response);
  if (![200, 201].includes(response.status)) {
    return res.status(response.status).json(body);
  }

  res.json(body);
});

app.put("/mahasiswa/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const response = await fetch(`${BASE_URL}?id=eq.${id}`, {
    method: "PATCH",
    headers: buildHeaders(req.headers.authorization?.split(" ")[1]),
    body: JSON.stringify(req.body),
  });

  const body = await safeResponse(response);
  if (!response.ok) {
    return res.status(response.status).json(body);
  }

  res.json(body);
});

app.delete("/mahasiswa/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const response = await fetch(`${BASE_URL}?id=eq.${id}`, {
    method: "DELETE",
    headers: buildHeaders(req.headers.authorization?.split(" ")[1]),
  });

  const body = await safeResponse(response);
  if (!response.ok) {
    return res.status(response.status).json(body);
  }

  res.json(body);
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
