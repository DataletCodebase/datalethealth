// routes/diet.js (Node)
import express from "express";
import authMiddleware from "../middleware/auth.js";
import fetch from "node-fetch";

const router = express.Router();

// ✅ Safe JSON parser — avoids crash when Python is down and returns HTML
async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("[diet.js] Non-JSON response from Python:", text.slice(0, 200));
    return { message: "Python backend returned an unexpected response. Is it running?" };
  }
}

router.post("/generate/:id", authMiddleware, async (req, res) => {
  try {
    const patientId = req.params.id;

    // Forward all query params (e.g. ?diet_type=nonveg) to the Python backend
    const queryString = new URLSearchParams(req.query).toString();
    const pythonUrl = `http://localhost:8001/diet/generate/${patientId}${queryString ? "?" + queryString : ""}`;

    console.log("[diet.js] Calling Python:", pythonUrl);

    const aiRes = await fetch(pythonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {}),
    });

    const data = await safeJson(aiRes);

    if (!aiRes.ok) {
      return res.status(aiRes.status).json(data);
    }

    res.json(data);

  } catch (err) {
    console.error("[diet.js] /generate error:", err);
    res.status(500).json({ message: "Diet generation failed" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const aiRes = await fetch(`http://localhost:8001/diet/user/${userId}`);
    const data = await safeJson(aiRes);
    res.status(aiRes.ok ? 200 : aiRes.status).json(data);

  } catch (err) {
    console.error("[diet.js] /my error:", err);
    res.status(500).json({ message: "Failed to fetch diet" });
  }
});

// ✅ Admin Approve Diet
router.post("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const aiRes = await fetch(`http://localhost:8001/diet/approve/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await safeJson(aiRes);
    res.status(aiRes.ok ? 200 : aiRes.status).json(data);

  } catch (err) {
    console.error("Admin approve diet error:", err);
    res.status(500).json({ message: "Failed to approve diet" });
  }
});

// ✅ Admin Get User Diet
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const aiRes = await fetch(`http://localhost:8001/diet/user/${id}`);
    const data = await safeJson(aiRes);
    res.status(aiRes.ok ? 200 : aiRes.status).json(data);

  } catch (err) {
    console.error("Admin fetch diet error:", err);
    res.status(500).json({ message: "Failed to fetch user diet" });
  }
});


router.post("/meal/complete", authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch("http://localhost:8001/meal-tracking/complete",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await safeJson(aiRes);
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error("[diet.js] /meal/complete error:", err);
    res.status(500).json({ message: "Meal complete failed" });
  }
});


router.post("/meal/skip", authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch("http://localhost:8001/meal-tracking/skip",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await safeJson(aiRes);
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error("[diet.js] /meal/skip error:", err);
    res.status(500).json({ message: "Meal skip failed" });
  }
});


router.post("/meal/alternate", authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch("http://localhost:8001/meal-tracking/skip-with-food",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await safeJson(aiRes);
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error("Meal alternate failed:", err);
    res.status(500).json({ message: "Meal alternate failed" });
  }
});


router.get("/meal/user/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const aiRes = await fetch(`http://localhost:8001/meal-tracking/user/${userId}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`
    );

    const data = await safeJson(aiRes);
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error("Meal tracking fetch error:", err);
    res.status(500).json({ message: "Failed to fetch meal tracking" });
  }
});


export default router;
