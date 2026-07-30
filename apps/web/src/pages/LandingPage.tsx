import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <main className="landing">
      <header className="shell topbar" aria-label="Primary navigation">
        <div className="brand">RecoverAI Joint</div>
        <nav className="nav-links">
          <a href="#how-it-works">How it works</a>
          <Link to="/application">Application</Link>
          <a href="#system">System</a>
          <a href="#opportunity">Opportunity</a>
        </nav>
        <Link className="button" to="/application">
          Launch application
        </Link>
      </header>

      <section className="shell hero">
        <p className="eyebrow">Objective recovery intelligence</p>
        <h1>Wear. Move. Understand.</h1>
        <p className="lede">
          RecoverAI Joint turns daily movement, wound signals, and functional tasks into a clear recovery
          trajectory for hip and knee replacement patients recovering at home.
        </p>
        <div className="hero-actions">
          <Link className="button" to="/application">
            Try it yourself
          </Link>
          <a className="link-quiet" href="#how-it-works">
            View architecture
          </a>
        </div>
      </section>

      <section className="shell panels" id="how-it-works">
        <article className="panel">
          <h2>In plain language</h2>
          <p>
            Recovery is not a single number. We combine knee range of motion, sit-to-stand performance,
            symptom check-ins, and wearable confidence to track patterns over time.
          </p>
        </article>
        <article className="panel">
          <h2>Target user guide</h2>
          <p>
            Patients receive short daily tasks and a simple confidence loop. Care teams get adherence,
            trend, and risk visibility in one glance.
          </p>
        </article>
        <article className="panel">
          <h2>AI, done safely</h2>
          <p>
            The model is explainable and trajectory-based. It surfaces why a score changed rather than
            delivering black-box guidance.
          </p>
        </article>
      </section>

      <section className="shell system" id="system">
        <h2>Inside the system</h2>
        <p>
          Two IMUs on the leg (thigh + shank) stream to an ESP32 hub, then into a shared data schema.
          That schema powers both the patient app and care-team dashboard.
        </p>
        <div className="grid">
          <div>
            <h3>Wearable placement</h3>
            <p>Thigh sensor + shank sensor for robust knee-angle estimation.</p>
          </div>
          <div>
            <h3>Core equation</h3>
            <p>theta_knee = theta_shank - theta_thigh - theta_cal</p>
          </div>
          <div>
            <h3>Signals captured</h3>
            <p>ROM, reps, gait symmetry, and daily symptom confidence.</p>
          </div>
        </div>
      </section>

      <section className="shell opportunity" id="opportunity">
        <h2>Impact and business model</h2>
        <p>
          A low-cost wearable and app layer designed to integrate with existing implant ecosystems,
          helping providers reduce blind spots after discharge while improving patient confidence.
        </p>
      </section>
    </main>
  );
}
