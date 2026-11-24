
import React, { useState } from "react";
import {
  Wallet, TrendingUp, Brain, Heart,
  ArrowUpRight, BookOpen, ShieldCheck
} from "lucide-react";

const courses = [
  {
    category: "Money",
    title: "Wealth Fundamentals",
    description: "Build the foundations of financial intelligence.",
    icon: TrendingUp,
  },
  {
    category: "Mindset",
    title: "The Discipline Blueprint",
    description: "Develop focus, confidence and consistency.",
    icon: Brain,
  },
  {
    category: "Wellness",
    title: "The Longevity Edit",
    description: "Build sustainable habits for a healthier life.",
    icon: Heart,
  },
];

export default function App() {
  const [wallet, setWallet] = useState("");
  const [category, setCategory] = useState("All");

  async function connectWallet() {
    const provider = (window as any).phantom?.solana;

    if (!provider) {
      alert("Please install Phantom Wallet.");
      return;
    }

    try {
      const response = await provider.connect();
      setWallet(response.publicKey.toString());
    } catch {
      alert("Wallet connection cancelled.");
    }
  }

  return (
    <div className="app">
      <header>
        <div className="brand">THE ROE VAULT</div>

        <button onClick={connectWallet}>
          <Wallet size={16} />
          {wallet
            ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">
            THE ART OF BECOMING
          </span>

          <h1>CAVIAR MINDSET™</h1>

          <p>Invest in your knowledge.</p>

          <div className="network">
            <ShieldCheck size={15} />
            Powered by Solana · Devnet
          </div>
        </section>

        <section className="marketplace">
          <div className="section-heading">
            <h2>Explore the Academy</h2>
            <BookOpen size={22} />
          </div>

          <div className="filters">
            {["All", "Money", "Mindset", "Wellness"].map(
              (item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <div className="courses">
            {courses
              .filter(
                (course) =>
                  category === "All" ||
                  course.category === category
              )
              .map((course) => (
                <article
                  className="course"
                  key={course.title}
                >
                  <div className="course-art">
                    <course.icon size={54} strokeWidth={1} />
                  </div>

                  <div className="course-content">
                    <span className="eyebrow">
                      {course.category} · Demo
                    </span>

                    <h3>{course.title}</h3>
                    <p>{course.description}</p>

                    <div className="course-footer">
                      <strong>1 USDC</strong>
                      <button disabled>
                        Checkout soon
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section className="protocol">
          <span className="eyebrow">ROE PROTOCOL</span>
          <h2>Knowledge deserves fair compensation.</h2>
          <p>
            Transparent revenue sharing powered by
            Solana smart contracts.
          </p>

          <div className="revenue">
            <div>
              <h2>70%</h2>
              <span>Educational Expert</span>
            </div>
            <div>
              <h2>30%</h2>
              <span>The Roe Vault</span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        THE ROE VAULT © 2026
        <p>Powered by ROE Protocol</p>
        <small>Devnet prototype. No real-money payments.</small>
      </footer>
    </div>
  );
}
