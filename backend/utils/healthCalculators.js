/**
 * backend/utils/healthCalculators.js
 * Centralized clinical logic for Datalet Healthcare.
 */

/**
 * MET-based Calorie Burn Calculation
 * formula: kcal = MET × weight_kg × duration_hours
 */
export function calculateCaloriesBurned({
    km_walked = 0,
    km_run = 0,
    weight_lifting_mins = 0,
    outdoor_activity_mins = 0,
    weight_kg = 70
}) {
    const MET_WALK = 3.5;
    const MET_RUN = 8.0;
    const MET_LIFT = 5.0;
    const MET_OUTDOOR = 4.0;

    const walk_hours = km_walked / 5;
    const run_hours = km_run / 10;
    const lift_hours = weight_lifting_mins / 60;
    const outdoor_hours = outdoor_activity_mins / 60;

    const calories =
        MET_WALK * weight_kg * walk_hours +
        MET_RUN * weight_kg * run_hours +
        MET_LIFT * weight_kg * lift_hours +
        MET_OUTDOOR * weight_kg * outdoor_hours;

    return Math.round(calories * 10) / 10;
}

/**
 * Daily Calorie Burn & Intake Targets
 * BMI-aware + Multi-condition medical logic
 */
export function calculateCalorieTargets(user) {
    const weight_kg = parseFloat(user.weight) || 70;
    const height_cm = parseFloat(user.height) || 170;

    // Age from DOB
    let age = 30;
    if (user.dob) {
        const birth = new Date(user.dob);
        const now = new Date();
        age = now.getFullYear() - birth.getFullYear() -
            (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    }

    const gender = (user.gender || "male").toLowerCase();
    const disease = (user.disease || "").toLowerCase();

    // ── BMR: Mifflin-St Jeor Equation ──
    const bmr = gender === "female"
        ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;

    // ── BMI ──
    const height_m = height_cm / 100;
    const bmi = weight_kg / (height_m * height_m);
    const bmiRounded = Math.round(bmi * 10) / 10;
    
    let bmiCategory;
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal";
    else if (bmi < 30) bmiCategory = "Overweight";
    else if (bmi < 35) bmiCategory = "Obese Class I";
    else if (bmi < 40) bmiCategory = "Obese Class II";
    else bmiCategory = "Morbidly Obese";

    const isObese = bmi >= 30;
    const isMorbidlyObese = bmi >= 40;

    const activityFactor = isObese ? 1.2 : 1.375;
    const tdee = Math.round(bmr * activityFactor);

    const hasKidney = disease.includes("kidney") || disease.includes("ckd") || disease.includes("renal");
    const hasDiabetes = disease.includes("diabet") || disease.includes("sugar");
    const hasHeart = disease.includes("heart") || disease.includes("cardiac");
    const hasHypertension = disease.includes("hypertension") || disease.includes("blood pressure");
    const hasPCOS = disease.includes("pcos") || disease.includes("polycystic");
    const hasThyroid = disease.includes("thyroid") || disease.includes("hypothyroid");
    const hasLiver = disease.includes("liver") || disease.includes("fatty liver");
    const hasExplicitObesity = disease.includes("obes");

    let intakeTarget = tdee;
    let burnTarget = Math.round(tdee * 0.20);
    const conditionsApplied = [];

    if (hasKidney) {
        const heightInches = height_cm / 2.54;
        const ibw = gender === "female" ? 45.5 + 2.3 * Math.max(0, heightInches - 60) : 50 + 2.3 * Math.max(0, heightInches - 60);
        const ckdCal = Math.round(ibw * 32);
        intakeTarget = Math.min(intakeTarget, Math.max(1500, ckdCal));
        burnTarget = Math.min(burnTarget, 200);
        conditionsApplied.push(`CKD Adjustment`);
    }

    if (isObese || hasExplicitObesity) {
        const deficit = isMorbidlyObese ? 750 : 500;
        intakeTarget = Math.min(intakeTarget, tdee - deficit);
        if (!hasKidney) burnTarget = Math.max(burnTarget, isMorbidlyObese ? 350 : 400);
        conditionsApplied.push("Obesity Deficit");
    }

    if (hasDiabetes) {
        intakeTarget = Math.min(intakeTarget, 1600);
        if (!hasKidney) burnTarget = Math.max(burnTarget, 300);
    }
    if (hasHeart) burnTarget = Math.min(burnTarget, 250);
    if (hasHypertension) {
        intakeTarget = Math.min(intakeTarget, 1800);
        burnTarget = Math.min(burnTarget, 300);
    }
    if (hasPCOS) intakeTarget = Math.min(intakeTarget, 1700);
    if (hasThyroid) intakeTarget = Math.min(intakeTarget, 1600);
    if (hasLiver) intakeTarget = Math.min(intakeTarget, 1800);

    const minIntake = gender === "female" ? 1200 : 1500;
    intakeTarget = Math.max(Math.round(intakeTarget), minIntake);
    burnTarget = Math.max(Math.round(burnTarget), 100);

    return {
        burn_target: burnTarget,
        intake_target: intakeTarget,
        bmi: bmiRounded,
        bmi_category: bmiCategory,
        tdee,
        bmr: Math.round(bmr)
    };
}
