// import { Navbar } from "./components/Navbar";
// import { Hero } from "./components/Hero";
// import { Stats } from "./components/Stats";
// import { Services } from "./components/Services";
// import { HowItWorks } from "./components/HowItWorks";
// import { About } from "./components/About";
// import { Testimonials } from "./components/Testimonials";
// import { Insights } from "./components/Insights";
// import { CTA } from "./components/CTA";
// import { Footer } from "./components/Footer";

// export default function App() {
//   return (
//     <div className="relative min-h-screen bg-white overflow-x-hidden">
//       <Navbar />
//       <main className="relative">
//         <Hero />
//         <Stats />
//         <Services />
//         <HowItWorks />
//         <About />
//         <Testimonials />
//         <Insights />
//         <CTA />
//       </main>
//       <Footer />
//     </div>
//   );
// }

import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Help } from "./components/Help";
import { HowItWorks } from "./components/HowItWorks";
import { About } from "./components/About";
import { Testimonials } from "./components/Testimonials";
import { Insights } from "./components/Insights";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { Advisory } from "./components/Advisory";
import { Service } from "./components/Services";
import { Team } from "./components/Team";
import { Blog } from "./components/Blog";
import { Publications } from "./components/Publications";
import { NewsUpdates } from "./components/News";

export default function App() {
  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main className="relative">
        <Hero />
        <Stats />
        <Help />
        <HowItWorks />
        <About />
        <Service />
        <Advisory />
        <Team />
        <Blog />
        <Publications />
        <NewsUpdates />
        <Testimonials />
        <Insights />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
