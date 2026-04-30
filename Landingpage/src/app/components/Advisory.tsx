import { motion } from "motion/react";

const advisors = [
  {
    name: "Prahlada Rama Rao",
    role: "Former Director, DRDL (DRDO)",
    desc: "Renowned aerospace engineer known for contributions to India's space and defence programs. Awarded Padma Shri (2015).",
  },
  {
    name: "Dr. Rajib Debnath",
    role: "HOD, Orthopedic Department",
    desc: "TMC & Dr. BRAM Teaching Hospital",
  },
  {
    name: "Dr. Santanu Ghosh",
    role: "Associate Professor, Psychiatry",
    desc: "TMC & Dr. BRAM Teaching Hospital",
  },
  {
    name: "Ms. Anmayee Nanda",
    role: "Senior Dietitian",
    desc: "Hi-Tech Medical College & Hospital | Former Apollo & Sunshine Hospitals",
  },
  {
    name: "Dr. Ranjib Ghosh",
    role: "Professor & HOD, Pharmacology",
    desc: "TMC & Dr. BRAM Teaching Hospital",
  },
  {
    name: "Dr. A. K. Chakma",
    role: "HOD, Ophthalmology",
    desc: "Renowned ophthalmologist, TMC & Dr. BRAM Teaching Hospital",
  },
  {
    name: "Mr. Niloy Dey",
    role: "Certified Nutritionist & Trainer",
    desc: "Owner, Gladiator Fitness",
  },
];

export function Advisory() {
  return (
    <section
      id="advisory"
      className="py-20 sm:py-28 bg-[#FAF7FF] relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-purple-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D0D0D]">
            Advisory Board
          </h2>
          <p className="text-[#5A5A72] mt-4 max-w-xl mx-auto">
            Meet our expert advisors guiding innovation in healthcare, research,
            and patient care.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advisors.map((advisor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="bg-white border border-[#E8E0F5] rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-[#8B00DC]/30 transition-all"
            >
              {/* Name */}
              <h3 className="text-lg font-bold text-[#0D0D0D] mb-2">
                {advisor.name}
              </h3>

              {/* Role */}
              <p className="text-sm font-semibold text-[#8B00DC] mb-2">
                {advisor.role}
              </p>

              {/* Description */}
              <p className="text-[#5A5A72] text-sm leading-relaxed">
                {advisor.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
