import fetch from "node-fetch";

const API_URL = "http://localhost:4000/api/auth/signup";

const testUser = {
    full_name: "Test User API",
    email: `test_api_${Date.now()}_2@example.com`, // Unique email
    mobile: `${Math.floor(Math.random() * 10000000000)}`,
    password: "Password@123",
    dob: "2000-01-01",
    address: "Test Address",
    role: "USER",
    captchaToken: "dummy-token"
};

async function testSignup() {
    console.log("Attempting Signup with:", testUser.email);
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser)
        });

        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch (err) {
        console.error("Request failed:", err);
    }
}

testSignup();
