import { useState, useEffect } from "react";

export function useCaptcha() {
  const [captchaText, setCaptchaText] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState(null);
  const [captchaToken, setCaptchaToken] = useState("");

  const generateCaptcha = () => {
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;

    let answer;
    if (operator === "+") answer = num1 + num2;
    else if (operator === "-") answer = num1 - num2;
    else answer = num1 * num2;

    setCaptchaText(`${num1} ${operator} ${num2}`);
    setCaptchaAnswer(answer);
    setCaptchaToken(""); // reset input
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const onCaptchaChange = (value) => {
    setCaptchaToken(value);
  };

  const isCaptchaValid = () => {
    return Number(captchaToken) === captchaAnswer;
  };

  return {
    captchaText,
    captchaToken,
    onCaptchaChange,
    refreshCaptcha: generateCaptcha,
    isCaptchaValid,
  };
}