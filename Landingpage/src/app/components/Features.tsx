import { motion } from "motion/react";
import {
  Activity,
  Brain,
  PhoneCall,
  Dumbbell,
  Bot,
  HeartPulse,
  Apple,
  Footprints,
  Moon,
  Watch,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

const advisoryItems = [
  {
    title: "AI Health Coach 🤖",
    desc: "24/7 personalized guidance powered by intelligent algorithms.",
    icon: Bot,
  },
  {
    title: "Health Tracking 📊",
    desc: "Monitor vitals, habits, and progress in real-time.",
    icon: Watch,
  },
  {
    title: "Mental Health 🧠",
    desc: "AI-driven emotional wellness and stress management support.",
    icon: Brain,
  },
  {
    title: "Doctor Consultation 📞",
    desc: "Connect with certified doctors anytime, anywhere.",
    icon: PhoneCall,
  },
  {
    title: "Daily Exercise 🏃",
    desc: "Smart fitness routines tailored to your lifestyle.",
    icon: Activity,
  },
  {
    title: "Workout Plans 🏋️",
    desc: "AI-generated workout plans for all fitness levels.",
    icon: Dumbbell,
  },
  {
    title: "Healthy Nutrition 🥗",
    desc: "Personalized diet plans and calorie tracking.",
    icon: Apple,
  },
  {
    title: "Step Tracking 👣",
    desc: "Track daily activity and improve movement habits.",
    icon: Footprints,
  },
  {
    title: "Sleep Monitoring 😴",
    desc: "Improve sleep quality with smart insights.",
    icon: Moon,
  },
  {
    title: "Preventive Care 🛡️",
    desc: "Early detection and risk alerts using AI.",
    icon: ShieldCheck,
  },
  {
    title: "Clinical Insights 🩺",
    desc: "Data-driven reports for better decision making.",
    icon: Stethoscope,
  },
  {
    title: "Heart Health ❤️",
    desc: "Track cardiovascular health and vital signals.",
    icon: HeartPulse,
  },
];

export function Well() {
  return (
    <section id="well" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-[#0D0D0D] mb-4">
            Your Smart Health Advisory
          </h2>
          <p className="text-[#5A5A72] text-xl max-w-2xl mx-auto mb-8">
            Personalized care powered by AI and expert guidance to improve your
            daily health and wellness.
          </p>
          <p className="text-[#8B00DC] italic font-semibold text-lg">
            "Transforming everyday habits into lifelong wellness."
          </p>
        </div>

        {/* Grid Layout for Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advisoryItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 border border-[#E8E0F5] shadow-2xl hover:shadow-2xl hover:bg-gradient-to-r from-[#8B00DC] to-[#CC00FF] hover:scale-105 transition-all duration-300"
            >
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full mb-6"
                style={{
                  background: "linear-gradient(135deg, #7B00CC, #CC00FF)",
                }}
              >
                <item.icon className="text-white w-8 h-8" />
              </div>

              <h3 className="text-[#0D0D0D] font-bold text-2xl mb-2">
                {item.title}
              </h3>
              <p className="text-[#5A5A72] text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
