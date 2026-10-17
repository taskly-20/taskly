import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const categories = ["All research", "Student life", "Environment", "Technology", "Community"];

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M16 15h.01" /><path d="M6 5V4a2 2 0 0 1 2-2h10" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /><path d="M16 6h4v4" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 4M12 17h.01" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3.1 3.9M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 3-.5" /></>
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function money(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0
  }).format(value);
}

function SignOutButton() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      window.location.assign("/");
    } catch (signOutError) {
      setError(signOutError.message);
      setBusy(false);
    }
  }

  return <div className="signout-wrap"><button className="signout-button" type="button" disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out"}</button>{error && <span className="signout-error" role="alert">{error}</span>}</div>;
}

function TaskCard({ task, onClaim, busy }) {
  const isPracticeTask = Boolean(task.generated);
  return (
    <article className={`task-card ${task.featured ? "task-card-featured" : ""}`}>
      <div className="task-source">
        <div className={`company-mark ${task.color}`}>{task.assignedBy.split(" ").map((part) => part[0]).join("")}</div>
        <div className="source-copy">
          <span>{isPracticeTask ? "AI-GENERATED PRACTICE" : "Task from"}</span>
          <strong>{task.assignedBy}</strong>
        </div>
      </div>
      {task.featured && <span className="featured-label"><Icon name="spark" size={14} /> Featured</span>}
      <div className="task-heading">
        <span className="task-category">{task.category}</span>
        <span className="task-time"><Icon name="clock" size={15} /> {task.time}</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="topic-preview">Research topic <strong>{task.topic}</strong></div>
      <div className="task-footer">
        <div>
          <span className="reward-label">{isPracticeTask ? "Payment status" : "Example amount"}</span>
          <strong className="reward-value">{isPracticeTask ? "None" : money(task.reward)}</strong>
          <span className="company-name">{isPracticeTask ? "Practice prompt · no payment" : "Example only · no payment"}</span>
        </div>
        {task.submitted
          ? <span className="claim-button claimed-button"><Icon name="check" size={16} /> Submitted</span>
          : <a className={`claim-button ${task.claimed ? "claimed-button" : ""}`} href={`/tasks/${encodeURIComponent(task.id)}`}>{task.claimed ? "Continue task" : "Start task"}</a>}
      </div>
    </article>
  );
}

function PayoutActivityNotice() {
  return (
    <section className="activity-section" aria-labelledby="withdrawal-activity-title">
      <div className="section-heading">
        <div>
          <div className="section-kicker">PAYMENT STATUS</div>
          <h2 id="withdrawal-activity-title">Payout activity</h2>
          <p>No verified payouts are available to display.</p>
        </div>
        <a className="sort-button" href="/withdraw">Payout status <span>→</span></a>
      </div>
      <div className="activity-disclaimer">M-Pesa payouts are not connected. This page will only show activity recorded from verified payments.</div>
    </section>
  );
}

function TypingAssessment({ onComplete }) {
  const [attempt, setAttempt] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [typedText, setTypedText] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function startTest() {
    setError("");
    setAssessmentResult(null);
    setBusy(true);
    try {
      const response = await fetch("/api/typing-test/start", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not start the typing test.");
      setAttempt(result);
      setTypedText("");
      setSecondsLeft(result.durationSeconds);
      setStartedAt(Date.now());
    } catch (startError) {
      setError(startError.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    startTest();
  }, []);

  useEffect(() => {
    if (startedAt === null || secondsLeft === 0) return undefined;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, attempt.durationSeconds - Math.floor((Date.now() - startedAt) / 1000));
      setSecondsLeft(remaining);
    }, 200);
    return () => window.clearInterval(interval);
  }, [attempt, startedAt, secondsLeft]);

  async function submitTest(event) {
    event.preventDefault();
    if (!attempt || secondsLeft > 0 || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/typing-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptToken: attempt.attemptToken, typedText })
      });
      const result = await response.json();
      if (result.result) {
        setAssessmentResult(result.result);
        setError(result.error || "");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Could not submit your typing-test result.");
      throw new Error("The server did not return your typing-test results. Please try again.");
    } catch (submitError) {
      setError(submitError.message);
      setAttempt(null);
    } finally {
      setBusy(false);
    }
  }

  function continueToTasks() {
    if (assessmentResult?.passed && assessmentResult.assessment) {
      onComplete(assessmentResult.assessment);
    }
  }

  return (
    <main className="access-screen assessment-screen">
      <div className="access-orb access-orb-one" /><div className="access-orb access-orb-two" />
      <header className="access-topbar">
        <a className="brand access-brand" href="/"><span className="brand-icon"><Icon name="spark" size={21} /></span>taskly<span className="brand-period">.</span></a>
        <span className="access-demo-chip"><span /> REQUIRED BEFORE TASKS</span>
      </header>
      <div className="assessment-layout">
        <section className="access-story assessment-story">
          <div className="access-kicker"><span className="access-kicker-line" /> PERSONALIZED WORK MATCHING</div>
          <h1>Find your<br /><span>working pace.</span></h1>
          <p>Complete one timed typing test before browsing research tasks. Your measured speed is used to match you with suitable task lengths.</p>
          <div className="assessment-points"><span><Icon name="check" size={16} /> Timed for 1 minute</span><span><Icon name="check" size={16} /> Minimum 10 WPM</span><span><Icon name="check" size={16} /> Scored on the server</span></div>
        </section>
        <section className="access-panel assessment-panel">
          <div className="access-panel-top"><span className="access-step-label">TYPING ASSESSMENT · STEP 1 OF 1</span><span className="access-secure-mark"><Icon name="check" size={14} /> TASK ACCESS GATE</span></div>
          <div className="access-heading"><div className="access-welcome">READY WHEN YOU ARE</div><h2>Type the passage below</h2><p>Type for at least one minute and reach 10 WPM to continue. Accuracy is shown as feedback but does not affect your result.</p></div>
          {!assessmentResult && error && <div className="assessment-error" role="alert">{error}</div>}
          {assessmentResult
            ? <section className="assessment-results" aria-labelledby="assessment-results-title">
              <div className={`assessment-result-status ${assessmentResult.passed ? "assessment-result-pass" : "assessment-result-fail"}`} role={assessmentResult.passed ? "status" : "alert"}>
                <strong id="assessment-results-title">{assessmentResult.passed ? "Assessment passed" : "Assessment not passed"}</strong>
                <span>{assessmentResult.passed ? "Your task workspace is ready." : error || "You need at least 10 WPM to continue. Retake the test when you’re ready."}</span>
              </div>
              <div className="assessment-score-grid">
                <div><span>WORDS PER MINUTE</span><strong>{assessmentResult.wordsPerMinute} <small>WPM</small></strong></div>
                <div><span>ACCURACY</span><strong>{assessmentResult.accuracyPercent}<small>%</small></strong></div>
                <div><span>TEST TIME</span><strong>01:00</strong></div>
              </div>
              <div className="assessment-comparison">
                <h3>Compare your typing with the original</h3>
                <p>Characters that differ from the original are highlighted.</p>
                <p className="assessment-comparison-count">Typed {assessmentResult.typedText.length} of {assessmentResult.passage.length} characters.</p>
                <div className="assessment-comparison-columns">
                  <div><span className="assessment-comparison-label">ORIGINAL PARAGRAPH</span><p>{assessmentResult.passage}</p></div>
                  <div><span className="assessment-comparison-label">WHAT YOU TYPED</span><p className="assessment-typed-paragraph" aria-label="Your typed paragraph">{Array.from(assessmentResult.typedText).map((character, index) => <span className={character === assessmentResult.passage[index] ? "assessment-character-correct" : "assessment-character-error"} key={index}>{character}</span>)}</p></div>
                </div>
              </div>
              {assessmentResult.passed
                ? <button className="access-primary assessment-continue" type="button" onClick={continueToTasks}>Continue to tasks <Icon name="arrow" size={17} /></button>
                : <button className="access-primary assessment-retry" type="button" disabled={busy} onClick={startTest}>{busy ? "Starting test…" : "Retake typing test"} <Icon name="arrow" size={17} /></button>}
            </section>
            : !attempt
            ? <button className="access-primary assessment-retry" type="button" disabled={busy} onClick={startTest}>{busy ? "Starting test…" : "Start typing test"} <Icon name="arrow" size={17} /></button>
            : <form className="assessment-form" onSubmit={submitTest}>
              <div className="assessment-timer"><span>TIME REMAINING</span><strong aria-live="polite">{String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}</strong></div>
              <p className="assessment-passage">{attempt.passage}</p>
              <label className="assessment-label" htmlFor="typing-response">Your typing</label>
              <textarea id="typing-response" className="assessment-textarea" rows="5" value={typedText} maxLength={attempt.passage.length} onChange={(event) => setTypedText(event.target.value)} onPaste={(event) => event.preventDefault()} placeholder="The test starts immediately. Begin typing…" disabled={secondsLeft === 0 || busy} autoFocus />
              <div className="assessment-form-footer"><span>{typedText.length} / {attempt.passage.length} characters</span><button className="access-primary" type="submit" disabled={busy || secondsLeft > 0}>{busy ? "Scoring…" : secondsLeft > 0 ? `Submit in ${secondsLeft}s` : "Submit result"} <Icon name="arrow" size={17} /></button></div>
            </form>}
          <p className="access-terms">Your typing score is stored with your account and used to allocate task lengths. You can retake the test if your attempt does not meet the accuracy requirement.</p>
        </section>
      </div>
      <footer className="access-footer"><span>© 2026 Taskly</span><span><span className="access-footer-dot" /> Account-protected research workspace</span></footer>
    </main>
  );
}

function TaskWorkflow({ task, initialError, assessment }) {
  const [step, setStep] = useState("speed");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const [submission, setSubmission] = useState(null);

  async function continueToResearch(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!task.claimed) {
        const response = await fetch(`/api/tasks/${encodeURIComponent(task.id)}/claim`, {
          method: "POST",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not start this task.");
      }
      setStep("research");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitResearch(event) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Choose your research as a PDF before submitting.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("document", file);
      const response = await fetch(`/api/tasks/${encodeURIComponent(task.id)}/submissions`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit your research.");
      setSubmission(result);
      setStep("submitted");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;
    setError("");
    if (selected && (selected.type !== "application/pdf" || !selected.name.toLowerCase().endsWith(".pdf"))) {
      setFile(null);
      setError("Please choose a PDF document.");
      event.target.value = "";
      return;
    }
    if (selected && selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("PDF files must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  }

  return (
    <div className="workflow-page">
      <header className="workflow-topbar">
        <a className="brand workflow-brand" href="/"><span className="brand-icon"><Icon name="spark" size={21} /></span>taskly<span className="brand-period">.</span></a>
        <span className="workflow-demo-label">SAMPLE RESEARCH REQUEST</span>
        <SignOutButton />
        <a className="back-link" href="/">← All research tasks</a>
      </header>
      <main className="workflow-content">
        <div className="workflow-back">
          <a href="/">← Back to research board</a>
          <span>{task.generated ? "AI-generated practice · no payment" : `Task from ${task.assignedBy}`}</span>
        </div>
        <div className="workflow-title">
          <div className="section-kicker">{task.generated ? "AI-GENERATED PRACTICE · NO PAYMENT" : "RESEARCH REQUEST"} · {task.category.toUpperCase()}</div>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
        </div>

        {step !== "submitted" && <div className="workflow-steps" aria-label="Research task progress">
          <div className={`workflow-step ${step === "speed" ? "current" : "complete"}`}><span>1</span><strong>Assessment</strong></div>
          <div className="step-rule" />
          <div className={`workflow-step ${step === "research" ? "current" : ""}`}><span>2</span><strong>Research & submit</strong></div>
        </div>}

        {error && <div className="notice" role="alert">{error}</div>}

        {step === "speed" && <section className="workflow-card">
          <span className="workflow-card-kicker">YOUR MEASURED WORKING PACE</span>
          <h2>{assessment.wordsPerMinute} WPM · {assessment.speedTier} allocation</h2>
          <p>Your timed typing assessment matched this task to your working pace. Start the task when you are ready.</p>
          <form onSubmit={continueToResearch}>
            <button className="workflow-primary" type="submit" disabled={busy}>{busy ? "Opening task…" : "Start this task"} <Icon name="arrow" size={17} /></button>
          </form>
        </section>}

        {step === "research" && <section className="research-layout">
          <article className="workflow-card research-brief">
            <span className="workflow-card-kicker">YOUR RESEARCH BRIEF</span>
            <h2>{task.topic}</h2>
            <p>{task.brief}</p>
            <div className="brief-checklist">
              <strong>Before you export your report</strong>
              <ul>
                <li>Use at least three credible sources.</li>
                <li>Include citations or clickable source links.</li>
                <li>Write in your own words and save the finished report as a PDF.</li>
              </ul>
            </div>
            <div className="research-meta">
              <span><Icon name="clock" size={16} /> Estimated time: {task.time}</span>
              <span>{task.generated ? "Practice prompt · no payment" : `Student requester: ${task.assignedBy}`}</span>
            </div>
          </article>
          <form className="workflow-card upload-card" onSubmit={submitResearch}>
            <span className="workflow-card-kicker">FINISHED YOUR RESEARCH?</span>
            <h2>Attach your report</h2>
            <p>Upload your finished research document as a PDF. Maximum file size: 10 MB.</p>
            <label className={`upload-dropzone ${file ? "file-selected" : ""}`}>
              <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
              <span className="upload-icon">↑</span>
              <strong>{file ? file.name : "Choose a PDF to attach"}</strong>
              <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ready to submit` : "Click to browse · PDF only"}</span>
            </label>
            <div className="upload-speed">Your typing speed <strong>{assessment.wordsPerMinute} WPM</strong></div>
            <button className="workflow-primary" type="submit" disabled={busy || !file}>{busy ? "Attaching PDF…" : "Submit research PDF"} <Icon name="arrow" size={17} /></button>
            <span className="upload-disclaimer">Sample submission only. It is not reviewed for payment.</span>
          </form>
        </section>}

        {step === "submitted" && <section className="workflow-card submitted-card" aria-live="polite">
          <div className="submitted-check"><Icon name="check" size={25} /></div>
          <span className="workflow-card-kicker">PDF ATTACHED</span>
          <h2>Your research was submitted</h2>
          <p><strong>{submission?.filename}</strong> was attached to “{task.title}”.</p>
          <div className="submission-note">Sample receipt only. No student review or payment is initiated.</div>
          <a className="workflow-primary back-to-board" href="/">Back to research tasks <Icon name="arrow" size={17} /></a>
        </section>}
      </main>
    </div>
  );
}

function ProfileDashboard() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load your profile.");
        return result;
      })
      .then((result) => {
        setData(result);
        setForm(result.profile);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          email: form.email,
          school: form.school,
          fieldOfStudy: form.fieldOfStudy,
          bio: form.bio
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your profile.");
      setForm((current) => ({ ...current, ...result.profile }));
      setData((current) => ({ ...current, profile: { ...current.profile, ...result.profile } }));
      setNotice("Your profile has been saved to the local SQL database.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  if (!data || !form) return <div className="loading-screen">{error || "Loading your profile…"}</div>;

  const initials = form.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const completionFields = [form.displayName, form.email, form.school, form.fieldOfStudy, form.bio];
  const completion = Math.round(completionFields.filter((field) => field.trim()).length / completionFields.length * 100);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="/" aria-label="Taskly home"><span className="brand-icon"><Icon name="spark" size={21} /></span>taskly<span className="brand-period">.</span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item" href="/#tasks"><Icon name="grid" /> Discover tasks</a>
          <a className="nav-item active" href="/profile"><Icon name="user" /> My profile</a>
          <a className="nav-item" href="/withdraw"><Icon name="wallet" /> Payout</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-promo"><div className="promo-spark"><Icon name="spark" size={18} /></div><strong>Your profile,<br />your progress.</strong><p>Keep your profile up to date and track your research submissions.</p><a href="/#tasks">Browse tasks <Icon name="arrow" size={15} /></a><div className="promo-decoration" /></div>
          <div className="profile"><div className="avatar">{initials || "DM"}</div><div className="profile-copy"><strong>{form.displayName}</strong><span>Profile</span></div></div>
          <SignOutButton />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}><Icon name="menu" /></button><div className="breadcrumb"><a href="/">Workspace</a><span>/</span><strong>My profile</strong></div><div className="topbar-actions"><div className="top-avatar">{initials || "DM"}</div></div></header>
        <div className="content-wrap profile-wrap">
          <div className="profile-welcome">
            <div><div className="eyebrow"><span className="online-dot" /> YOUR ACCOUNT</div><h1>Your profile, <span>your progress.</span></h1><p className="welcome-copy">Manage your profile and see your research work in one place.</p></div>
            <a className="profile-back-button" href="/">← Browse research</a>
          </div>
          <section className="profile-hero">
            <div className="profile-hero-identity">
              <div className="profile-large-avatar">{initials || "DM"}</div>
              <div><span className="profile-badge">MEMBER</span><h2>{form.displayName}</h2><p>{form.fieldOfStudy || "Add your field of study"}{form.school ? ` · ${form.school}` : ""}</p></div>
            </div>
            <div className="profile-completion"><div><span>PROFILE COMPLETION</span><strong>{completion}%</strong></div><div className="completion-track"><span style={{ width: `${completion}%` }} /></div><small>{completion === 100 ? "Looking good — all profile fields are filled in." : "Add a few details to make your profile more complete."}</small></div>
          </section>
          {error && <div className="notice" role="alert">{error}</div>}
          {notice && <div className="notice success-notice" role="status">{notice}</div>}

          <section className="profile-metrics" aria-label="Research activity summary">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon green-icon"><Icon name="grid" size={18} /></span><span className="stat-caption">TASKS STARTED</span></div><div className="stat-value">{String(data.stats.started).padStart(2, "0")}</div><div className="stat-foot"><span className="stat-muted">Saved to your profile</span></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon purple-icon"><Icon name="check" size={18} /></span><span className="stat-caption">PDFS SUBMITTED</span></div><div className="stat-value">{String(data.stats.submitted).padStart(2, "0")}</div><div className="stat-foot"><span className="stat-muted">Attached research reports</span></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon orange-icon"><Icon name="clock" size={18} /></span><span className="stat-caption">TYPING SPEED</span></div><div className="stat-value">{data.stats.typingSpeed ? `${data.stats.typingSpeed}` : "—"}<span>{data.stats.typingSpeed ? " WPM" : ""}</span></div><div className="stat-foot"><span className="stat-muted">Timed assessment result</span></div></article>
          </section>

          <div className="profile-columns">
            <section className="profile-panel">
              <div className="profile-panel-heading"><div><div className="section-kicker">YOUR DETAILS</div><h2>Profile information</h2><p>Changes are stored in this app’s local SQLite database.</p></div><span className="sql-pill">SAVED LOCALLY</span></div>
              <form className="profile-form" onSubmit={saveProfile}>
                <label>Display name<input name="displayName" maxLength="80" required value={form.displayName} onChange={updateField} /></label>
                <label>Email address<input name="email" type="email" maxLength="254" placeholder="you@example.com" value={form.email} onChange={updateField} /></label>
                <div className="profile-form-row"><label>School or university<input name="school" maxLength="120" placeholder="Your school" value={form.school} onChange={updateField} /></label><label>Field of study<input name="fieldOfStudy" maxLength="120" placeholder="e.g. Environmental science" value={form.fieldOfStudy} onChange={updateField} /></label></div>
                <label>About you<textarea name="bio" maxLength="500" rows="4" placeholder="What topics are you interested in?" value={form.bio} onChange={updateField} /></label>
                <div className="profile-form-footer"><span>Profile created {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(data.profile.createdAt))}</span><button className="workflow-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"} <Icon name="check" size={16} /></button></div>
              </form>
            </section>
            <section className="profile-panel activity-panel">
              <div className="profile-panel-heading"><div><div className="section-kicker">YOUR WORK</div><h2>Research activity</h2><p>Amounts, submission assessment, and payout status for each task.</p></div><span className="task-count">{data.activity.length}</span></div>
              {data.activity.length === 0
                ? <div className="profile-empty"><span className="empty-illustration"><Icon name="spark" size={22} /></span><strong>Your research journey starts here</strong><p>When you start a topic, your task and PDF submissions will show up here.</p><a href="/#tasks">Explore research tasks <Icon name="arrow" size={14} /></a></div>
                : <div className="profile-activity-list">{data.activity.map((item) => <article className="profile-activity-item" key={item.taskId}>
                  <span className={`activity-marker ${item.submittedAt ? "is-submitted" : ""}`}><Icon name={item.submittedAt ? "check" : "clock"} size={15} /></span>
                  <div className="activity-main">
                    <strong>{item.task.title}</strong>
                    <span>{item.submittedAt ? `PDF submitted · ${item.filename}` : `In progress · ${item.typingSpeed} WPM`}</span>
                    <div className="activity-details">
                      <span><b>Amount</b>{item.task.generated ? "Practice · KSh 0" : `Example only · ${money(item.task.reward)}`}</span>
                      <span><b>Assessment</b>{item.submittedAt ? "Not assessed" : "Not submitted"}</span>
                      <span><b>Payout</b>No payout recorded</span>
                    </div>
                    <small>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(item.submittedAt || item.startedAt))}</small>
                  </div>
                  {item.submittedAt ? <a className="document-link" href={`/api/tasks/${encodeURIComponent(item.taskId)}/document`}>Get PDF ↓</a> : <a className="continue-link" href={`/tasks/${encodeURIComponent(item.taskId)}`}>Continue</a>}
                </article>)}</div>}
              <p className="activity-payment-note">Task amounts shown here are examples, not earned money. Assessment and M-Pesa payouts are not available or recorded in this app.</p>
            </section>
          </div>
          <div className="profile-disclaimer"><strong>You are signed in to your Taskly account.</strong>Your profile and research activity are associated with your account and stored in this app’s database.</div>
        </div>
      </main>
    </div>
  );
}

function WithdrawalPage() {
  const [payout, setPayout] = useState(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("200");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payout-status")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load withdrawal information.");
        return result;
      })
      .then(setPayout)
      .catch((loadError) => setError(loadError.message));
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const requestedAmount = Number(amount);
    if (!Number.isInteger(requestedAmount) || requestedAmount < 1 || requestedAmount > (payout?.maximumAmount || 200)) {
      setError(`Enter a whole amount between KSh 1 and KSh ${payout?.maximumAmount || 200}.`);
      return;
    }
    let normalizedPhone = phone.replace(/[\s()-]/g, "").replace(/^\+/, "");
    if (normalizedPhone.startsWith("254")) normalizedPhone = normalizedPhone.slice(3);
    if (normalizedPhone.startsWith("0")) normalizedPhone = normalizedPhone.slice(1);
    if (!/^[17]\d{8}$/.test(normalizedPhone)) {
      setError("Enter a Kenyan mobile number, such as 712345678 or 0712345678.");
      return;
    }
    setMessage(`Your KSh ${requestedAmount} withdrawal request is within the limit. M-Pesa is not connected, so no prompt or payment was sent and your number was not saved.`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Taskly home"><span className="brand-icon"><Icon name="spark" size={21} /></span>taskly<span className="brand-period">.</span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item" href="/#tasks"><Icon name="grid" /> Discover tasks</a>
          <a className="nav-item" href="/profile"><Icon name="user" /> My profile</a>
          <a className="nav-item active" href="/withdraw"><Icon name="wallet" /> Withdraw funds</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-promo"><div className="promo-spark"><Icon name="spark" size={18} /></div><strong>See your progress.<br />Manage your profile.</strong><p>Keep your details and research activity up to date.</p><a href="/profile">My profile <Icon name="arrow" size={15} /></a><div className="promo-decoration" /></div>
          <SignOutButton />
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar"><a className="breadcrumb" href="/">Workspace <span>/</span> <strong>Withdraw funds</strong></a><div className="topbar-actions"><a className="profile-back-button" href="/profile">My profile</a></div></header>
        <div className="content-wrap withdrawal-wrap">
          <div className="profile-welcome">
            <div><div className="eyebrow"><span className="online-dot" /> PAYOUT SETTINGS</div><h1>Withdraw to <span>M-Pesa.</span></h1><p className="welcome-copy">Set up where you would receive a payout once payments are available.</p></div>
            <a className="profile-back-button" href="/">← Browse research</a>
          </div>
          <div className="withdrawal-layout">
            <section className="withdrawal-panel">
              <span className="workflow-card-kicker">WITHDRAWAL METHOD</span>
              <div className="mpesa-brand"><span className="mpesa-mark">M</span><div><strong>M-Pesa</strong><span>Kenya mobile money</span></div><span className="integration-status">Not connected</span></div>
              <div className="withdrawal-amount-box"><span>Maximum per withdrawal</span><strong>{payout ? money(payout.maximumAmount) : "—"}</strong><small>Request up to KSh 200 per withdrawal.</small></div>
              <form className="withdrawal-form" onSubmit={handleSubmit} noValidate>
                <label htmlFor="withdraw-amount">Withdrawal amount</label>
                <div className="withdraw-amount-field"><span>KSh</span><input id="withdraw-amount" type="number" min="1" max={payout?.maximumAmount || 200} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} aria-describedby="withdraw-amount-help" /></div>
                <p id="withdraw-amount-help" className="field-hint">Maximum KSh {payout?.maximumAmount || 200} per withdrawal.</p>
                <label htmlFor="mpesa-phone">M-Pesa phone number</label>
                <div className="phone-field"><span className="country-code">🇰🇪 +254</span><input id="mpesa-phone" type="tel" autoComplete="tel" placeholder="712 345 678" value={phone} onChange={(event) => setPhone(event.target.value)} aria-describedby="phone-help" /></div>
                <p id="phone-help" className="field-hint">Enter the Kenyan number registered with M-Pesa (for example, 712345678). Do not enter your M-Pesa PIN or one-time password.</p>
                {error && <div className="notice" role="alert">{error}</div>}
                {message && <div className="notice withdrawal-result" role="status">{message}</div>}
                <button type="submit" className="workflow-primary withdrawal-submit">Check withdrawal setup <Icon name="arrow" size={17} /></button>
              </form>
              <div className="withdrawal-warning"><Icon name="help" size={17} /><p><strong>Payments are not connected yet.</strong> Submitting this form will not send an M-Pesa prompt or transfer. Your phone number is only checked in your browser and is not stored.</p></div>
            </section>
            <aside className="withdrawal-side">
              <div className="payout-info-card"><div className="payout-info-icon"><Icon name="clock" size={20} /></div><span className="workflow-card-kicker">PAYOUT TIMING</span><h2>2-day processing target</h2><p>The intended payout timing is two days after approved task completion. This is not active until the M-Pesa payout integration is in place.</p><div className="payout-status-line"><span className="status-dot" /> Awaiting payment integration</div></div>
              <div className="payout-info-card"><div className="payout-info-icon safe-icon"><Icon name="help" size={20} /></div><span className="workflow-card-kicker">KEEP YOUR ACCOUNT SAFE</span><h2>Never share your PIN</h2><p>M-Pesa payments to your phone should not require you to tell anyone your PIN or share an OTP. No PIN or OTP is requested here.</p></div>
            </aside>
          </div>
          <p className="withdrawal-footnote">Payouts require a verified account, approved work, and a live Safaricom M-Pesa Business-to-Customer (B2C) integration. An STK Push requests a payment from a customer; it is not used to send a withdrawal to you.</p>
        </div>
      </main>
    </div>
  );
}

function AccessGate({ onAuthenticated }) {
  const [mode, setMode] = useState("signup");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitCredentials(event) {
    event.preventDefault();
    setError("");
    const normalizedPhone = phone.replace(/[\s()-]/g, "").replace(/^\+?254/, "").replace(/^0/, "");
    if (!/^[17]\d{8}$/.test(normalizedPhone)) {
      setError("Enter a valid Kenyan mobile number, such as 712 345 678.");
      return;
    }
    if (mode === "signup" && !displayName.trim()) {
      setError("Enter your name to create an account.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode === "signup" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: `+254${normalizedPhone}`,
          password,
          ...(mode === "signup" ? { displayName: displayName.trim() } : {})
        })
      });
      const result = await response.json();
      setPassword("");
      setConfirmPassword("");
      if (!response.ok) throw new Error(result.error || "Could not sign in. Try again.");
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  return (
    <main className="access-screen">
      <div className="access-orb access-orb-one" />
      <div className="access-orb access-orb-two" />
      <header className="access-topbar">
        <a className="brand access-brand" href="/" aria-label="Taskly home"><span className="brand-icon"><Icon name="spark" size={21} /></span>taskly<span className="brand-period">.</span></a>
        <span className="access-demo-chip"><span /> SECURE ACCOUNT ACCESS</span>
      </header>
      <div className="access-layout">
        <section className="access-story">
          <div className="access-kicker"><span className="access-kicker-line" /> STUDENT RESEARCH TASKS</div>
          <h1>Find your next<br />research task<span>.</span></h1>
          <p>Explore student research tasks, choose a topic that interests you, and share what you discover.</p>
          <div className="access-visual" aria-hidden="true">
            <div className="access-visual-glow" />
            <div className="access-orbit access-orbit-outer" />
            <div className="access-orbit access-orbit-inner" />
            <div className="access-core"><Icon name="spark" size={35} /></div>
            <span className="access-visual-dot dot-one" />
            <span className="access-visual-dot dot-two" />
            <span className="access-visual-dot dot-three" />
            <div className="access-float-card float-card-top"><span className="float-card-icon">✳</span><span><strong>Explore research topics</strong><small>Find your next task</small></span></div>
            <div className="access-float-card float-card-bottom"><span className="float-card-check">✓</span><span><strong>Share what you learn</strong><small>Student research projects</small></span></div>
          </div>
          <div className="access-story-foot"><span className="access-story-line" /> STUDENT RESEARCH TASKS</div>
        </section>

        <section className="access-panel" aria-labelledby="access-title">
          <div className="access-panel-top">
            <span className="access-step-label">{mode === "signup" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</span>
            <span className="access-secure-mark"><Icon name="check" size={14} /> Secure sign-in</span>
          </div>
          <div className="access-heading">
            <div className="access-welcome">STUDENT RESEARCH TASKS</div>
            <h2 id="access-title">{mode === "signup" ? "Create your Taskly account" : "Log in to Taskly"}</h2>
            <p>{mode === "signup" ? "Sign up to explore and start research tasks." : "Sign in to continue to your research tasks."}</p>
          </div>
          <form className="access-form" onSubmit={submitCredentials} noValidate>
            {mode === "signup" && (
              <>
                <label htmlFor="access-display-name">Your name</label>
                <input className="access-input" id="access-display-name" type="text" autoComplete="name" maxLength="80" placeholder="Enter your name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </>
            )}
            <label htmlFor="access-phone">Kenyan phone number</label>
            <div className="access-input access-phone-input"><span className="access-country">🇰🇪 <span>+254</span></span><input id="access-phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="712 345 678" value={phone.replace(/^\+254/, "")} onChange={(event) => setPhone(event.target.value)} /></div>
            <label htmlFor="access-password">{mode === "signup" ? "Create a password" : "Password"}</label>
            <div className="access-password-wrap"><input className="access-input" id="access-password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength="8" maxLength="128" placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"} value={password} onChange={(event) => setPassword(event.target.value)} /><button className="access-password-toggle" type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}><Icon name={showPassword ? "eyeOff" : "eye"} size={17} /></button></div>
            {mode === "signup" && (
              <>
                <label htmlFor="access-confirm-password">Confirm password</label>
                <div className="access-password-wrap"><input className="access-input" id="access-confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" minLength="8" maxLength="128" placeholder="Enter your password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><button className="access-password-toggle" type="button" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword((visible) => !visible)}><Icon name={showConfirmPassword ? "eyeOff" : "eye"} size={17} /></button></div>
              </>
            )}
            {error && <div className="access-error" role="alert">{error}</div>}
            <button type="submit" className="access-primary" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"} <Icon name="arrow" size={17} /></button>
          </form>
          <p className="access-mode-switch">{mode === "signup" ? "Already have an account?" : "New to Taskly?"} <button type="button" onClick={() => switchMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Log in" : "Create an account"}</button></p>
          <p className="access-terms">Your password is securely hashed. We do not ask for a national ID or payment details to create an account.</p>
        </section>
      </div>
      <footer className="access-footer"><span>© 2026 Taskly</span><span><span className="access-footer-dot" /> Account-protected research workspace</span></footer>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not verify your sign-in.");
        const result = await response.json();
        return result.user || null;
      })
      .then(setUser)
      .catch((error) => setSessionError(error.message))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) return <div className="loading-screen">Checking your account…</div>;
  if (sessionError) return <div className="loading-screen" role="alert">{sessionError} Refresh to try again.</div>;
  if (!user) return <AccessGate onAuthenticated={setUser} />;
  if (document.getElementById("root")?.dataset.page === "support") return <HelpSupport />;
  return <AssessmentGate user={user} />;
}

function AssessmentGate({ user }) {
  const [assessment, setAssessment] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  async function loadAssessment() {
    setChecking(true);
    setError("");
    try {
      const response = await fetch("/api/typing-test/status");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load your typing assessment.");
      setAssessment(result.assessment);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    loadAssessment();
  }, []);

  if (checking) return <div className="loading-screen">Checking your typing assessment…</div>;
  if (error) return <div className="loading-screen" role="alert">{error} <button type="button" onClick={loadAssessment}>Try again</button></div>;
  if (!assessment) return <TypingAssessment onComplete={setAssessment} />;
  return <WorkspaceApp user={user} assessment={assessment} />;
}

function HelpSupport() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I’m Taskly’s AI support assistant. Ask me about your account, typing assessment, research tasks, or submissions."
  }]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();
    const content = question.trim();
    if (!content || sending) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setQuestion("");
    setError("");
    setSending(true);
    try {
      const conversation = nextMessages
        .filter((message, index) => index > 0 && ["user", "assistant"].includes(message.role))
        .slice(-10);
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI support could not answer just now.");
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="support-page">
      <header className="support-topbar">
        <a className="brand" href="/"><span className="brand-icon"><Icon name="spark" size={21} /></span>taskly<span className="brand-period">.</span></a>
        <a className="back-link" href="/">← Back to tasks</a>
      </header>
      <main className="support-content">
        <div className="support-heading">
          <span className="support-icon"><Icon name="help" size={22} /></span>
          <div><div className="section-kicker">TASKLY HELP DESK</div><h1>How can we help?</h1><p>Ask a question and the AI assistant will help you find your way around Taskly.</p></div>
        </div>
        <section className="support-chat" aria-label="AI help and support chat">
          <div className="support-chat-heading"><span className="support-online-dot" /><div><strong>Taskly AI Support</strong><small>Answers about Taskly features</small></div></div>
          <div className="support-messages" aria-live="polite" aria-relevant="additions">
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`support-message ${message.role === "user" ? "support-message-user" : "support-message-assistant"}`}>
                <span>{message.content}</span>
              </div>
            ))}
            {sending && <div className="support-message support-message-assistant"><span>Thinking…</span></div>}
          </div>
          {error && <div className="support-error" role="alert">{error}</div>}
          <form className="support-form" onSubmit={sendMessage}>
            <label className="visually-hidden" htmlFor="support-question">Your question</label>
            <textarea id="support-question" value={question} maxLength={1200} rows={2} placeholder="Ask about your account, assessment, or tasks…" onChange={(event) => setQuestion(event.target.value)} />
            <button className="workflow-primary" type="submit" disabled={sending || !question.trim()}>{sending ? "Sending…" : "Send"} <Icon name="arrow" size={16} /></button>
          </form>
          <p className="support-privacy-note">Don’t share your password, verification codes, or payment details. The assistant can’t access your account or verify assessments and payouts.</p>
        </section>
        <div className="support-contact-note">Need help with an account-specific issue? Contact the site administrator.</div>
      </main>
    </div>
  );
}

function WorkspaceApp({ user, assessment }) {
  const [tasks, setTasks] = useState([]);
  const [category, setCategory] = useState("All research");
  const [sortOrder, setSortOrder] = useState("recommended");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [taskGenerationStatus, setTaskGenerationStatus] = useState(null);
  const [taskGenerationStatusError, setTaskGenerationStatusError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const rootElement = document.getElementById("root");
  const currentPath = window.location.pathname;
  const initialTaskId = rootElement?.dataset.taskId || currentPath.match(/^\/tasks\/([^/]+)$/)?.[1] || "";
  const initialPage = rootElement?.dataset.page || ({ "/profile": "profile", "/withdraw": "withdraw", "/support": "support" }[currentPath] || "tasks");
  const routeTask = initialTaskId ? tasks.find((task) => task.id === initialTaskId) : null;
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const userInitials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    fetch("/api/tasks")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load tasks.");
        return response.json();
      })
      .then(setTasks)
      .catch(() => setError("We couldn’t load tasks just now. Refresh to try again."))
      .finally(() => setTasksLoaded(true));

    fetch("/api/task-generation/status")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load task-generation status.");
        return response.json();
      })
      .then(setTaskGenerationStatus)
      .catch(() => setTaskGenerationStatusError("Task-generation status is temporarily unavailable."));
  }, []);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesCategory = category === "All research" || task.category.trim().toLowerCase() === category.toLowerCase();
    const searchText = `${task.title} ${task.description} ${task.topic} ${task.assignedBy} ${task.category}`.toLowerCase();
    return matchesCategory && searchText.includes(query.trim().toLowerCase());
  }), [tasks, category, query]);

  const sortedTasks = useMemo(() => {
    if (sortOrder === "recommended") return filteredTasks;
    const sorters = {
      highestReward: (first, second) => second.reward - first.reward,
      lowestReward: (first, second) => first.reward - second.reward,
      shortestTime: (first, second) => Number.parseInt(first.time, 10) - Number.parseInt(second.time, 10),
      longestTime: (first, second) => Number.parseInt(second.time, 10) - Number.parseInt(first.time, 10)
    };
    return [...filteredTasks].sort(sorters[sortOrder]);
  }, [filteredTasks, sortOrder]);

  const totalRewards = tasks.reduce((total, task) => total + task.reward, 0);
  const startedCount = tasks.filter((task) => task.claimed).length;

  if (initialTaskId) {
    if (!tasksLoaded) return <div className="loading-screen">Opening your research task…</div>;
    if (!routeTask) return <div className="loading-screen">{error || "We couldn’t find that research task."} <a href="/">Return to the task board</a></div>;
    return <TaskWorkflow task={routeTask} initialError={error} assessment={assessment} />;
  }
  if (initialPage === "support") return <HelpSupport />;
  if (initialPage === "profile") return <ProfileDashboard />;
  if (initialPage === "withdraw") return <WithdrawalPage />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" aria-label="Taskly home">
          <span className="brand-icon"><Icon name="spark" size={21} /></span>
          taskly<span className="brand-period">.</span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#tasks"><Icon name="grid" /> Discover tasks</a>
          <a className="nav-item" href="/profile"><Icon name="user" /> My profile</a>
          <a className="nav-item" href="/withdraw"><Icon name="wallet" /> Withdraw funds</a>
          <a className="nav-item" href="#activity"><Icon name="chart" /> Activity</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-promo">
            <div className="promo-spark"><Icon name="spark" size={18} /></div>
            <strong>Research a topic.<br />Share what you find.</strong>
            <p>Choose a student brief, explore credible sources, and attach your report as a PDF.</p>
            <a href="#tasks">Browse research <Icon name="arrow" size={15} /></a>
            <div className="promo-decoration" />
          </div>
          <a className="nav-item help-link" href="/support"><Icon name="help" /> Help & support</a>
          <div className="profile">
            <div className="avatar">{userInitials || "U"}</div>
            <div className="profile-copy"><strong>{user.displayName}</strong><span>{user.phoneNumber}</span></div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}><Icon name="menu" /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>Discover tasks</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={18} />
              <input aria-label="Search tasks" placeholder="Search tasks..." value={query} onChange={(event) => setQuery(event.target.value)} />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button>
            <div className="top-avatar">{userInitials || "U"}</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="online-dot" /> MATCHED TASK ALLOCATION</div>
              <h1>Research for students, <span>your way.</span></h1>
              <p className="welcome-copy">{assessment.wordsPerMinute} WPM · {assessment.speedTier} tier. Showing task lengths matched to your timed typing result.</p>
            </div>
            <div className="date-pill"><span className="date-sun">✳</span> {today}</div>
          </section>

          <section className="stats-grid" aria-label="Account overview">
            <article className="stat-card balance-card">
              <div className="stat-top"><span className="stat-icon green-icon"><Icon name="wallet" size={19} /></span><span className="stat-caption">WITHDRAWAL SETUP</span><span className="balance-dot" /></div>
              <div className="stat-value">M-Pesa</div>
              <div className="stat-foot"><span className="stat-muted">M-Pesa is not connected</span><a className="withdrawal-card-link" href="/withdraw">View setup →</a></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon purple-icon"><Icon name="check" size={19} /></span><span className="stat-caption">TASKS STARTED</span></div>
              <div className="stat-value">{String(startedCount).padStart(2, "0")}</div>
              <div className="stat-foot"><span className="stat-muted">On this profile</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span className="stat-icon orange-icon"><Icon name="spark" size={19} /></span><span className="stat-caption">TASK OFFER EXAMPLES</span></div>
              <div className="stat-value">{money(totalRewards)}</div>
              <div className="stat-foot"><span className="stat-muted">Amounts depend on approved work</span></div>
            </article>
          </section>

          <PayoutActivityNotice />

          <section className="tasks-section" id="tasks">
            <div className="section-heading">
              <div>
                <div className="section-kicker">STUDENT RESEARCH TOPICS</div>
                <h2>Research requests <span className="task-count">{tasks.length}</span></h2>
                <p>Examples and AI-generated practice prompts are not live commissions or guaranteed paid work.</p>
              </div>
              <label className="sort-control">
                <span className="visually-hidden">Sort research tasks</span>
                <select className="sort-button" aria-label="Sort research tasks" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="highestReward">Highest amount</option>
                  <option value="lowestReward">Lowest amount</option>
                  <option value="shortestTime">Shortest time</option>
                  <option value="longestTime">Longest time</option>
                </select>
              </label>
            </div>
            {taskGenerationStatusError && <div className="generation-status notice" role="status">{taskGenerationStatusError}</div>}
            {taskGenerationStatus && (
              <div className="generation-status" role="status">
                {!taskGenerationStatus.configured
                  ? "Hourly AI task generation is not configured on this server."
                  : taskGenerationStatus.lastAttemptFailed
                    ? `The last task-generation attempt failed. The server is scheduled to retry ${new Date(taskGenerationStatus.nextGenerationAt).toLocaleString()}.`
                    : `AI practice prompts saved: ${taskGenerationStatus.generatedCount}. Next batch is scheduled ${new Date(taskGenerationStatus.nextGenerationAt).toLocaleString()}${taskGenerationStatus.lastGeneratedAt
                      ? `; last generated ${new Date(taskGenerationStatus.lastGeneratedAt).toLocaleString()}.`
                      : "."}`}
              </div>
            )}
            <div className="category-row" role="tablist" aria-label="Filter tasks by category">
              {categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={`category-chip ${category === item ? "selected" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
              <span className="task-total">{filteredTasks.length} tasks available</span>
            </div>
            {error && <div className="notice" role="alert">{error}</div>}
            {startedCount > 0 && <div className="notice success-notice" id="activity">{startedCount} {startedCount === 1 ? "task" : "tasks"} started — you can keep browsing for more.</div>}
            <div className="task-grid">
              {sortedTasks.map((task) => <TaskCard key={task.id} task={task} />)}
              {filteredTasks.length === 0 && <div className="empty-state">No tasks match your search. Try another category or keyword.</div>}
            </div>
          </section>
          <footer className="footer-note">Task examples and AI practice prompts are not live paid work.<a href="/support">Need a hand?</a></footer>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
