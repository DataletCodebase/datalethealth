// routes/diet.js (Node)
import express from "express";
import authMiddleware from "../middleware/auth.js";
import fetch from "node-fetch";

const router = express.Router();

router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id; // ✅ SAFE

    const aiRes = await fetch(
      `http://localhost:8000/diet/generate/${patientId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ patient_id: patientId }),
      }
    );

    const data = await aiRes.json();
   
    if (!aiRes.ok) {
      return res.status(aiRes.status).json(data);
    }

     res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Diet generation failed" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 from JWT

    const aiRes = await fetch(
      `http://localhost:8000/diet/user/${userId}`
    );

    const data = await aiRes.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch diet" });
  }
});


router.post("/meal/complete", authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch(
      "http://localhost:8000/meal-tracking/complete",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await aiRes.json();
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Meal complete failed" });
  }
});



router.post("/meal/skip", authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch(
      "http://localhost:8000/meal-tracking/skip",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await aiRes.json();
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Meal skip failed" });
  }
});


router.post("/meal/alternate", authMiddleware, async (req, res) => {
  try {
    const aiRes = await fetch(
      "http://localhost:8000/meal-tracking/skip-with-food",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body), // pass diet_plan_id, diet_meal_id, meal_date, actual_meal
      }
    );

    const data = await aiRes.json();
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error("Meal alternate failed:", err);
    res.status(500).json({ message: "Meal alternate failed" });
  }
});


router.get("/meal/user/:userId", authMiddleware, async (req, res) => {
  try {
    // const { userId } = req.params;
    const userId = req.user.id;

    const aiRes = await fetch(
      `http://localhost:8000/meal-tracking/user/${userId}`
    );

    const data = await aiRes.json();
    res.status(aiRes.status).json(data);

  } catch (err) {
    console.error("Meal tracking fetch error:", err);
    res.status(500).json({ message: "Failed to fetch meal tracking" });
  }
});




















export default router;
