import axios from 'axios';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function list() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("Error: GEMINI_API_KEY is not defined in the environment.");
    return;
  }
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const names = res.data.models.map(m => m.name);
    console.log("All available models:");
    console.log(JSON.stringify(names, null, 2));
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

list();
