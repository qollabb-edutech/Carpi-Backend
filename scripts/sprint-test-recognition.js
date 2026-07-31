/**
 * Sprint stress & security tests for recognition form API.
 * Run: node scripts/sprint-test-recognition.js
 */

const API = process.env.API_URL || "http://localhost:7000/api";
const LONG = "A".repeat(50000);
const XSS = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
const SQL = "'; DROP TABLE recognition_applications; --";

const results = [];

function log(name, pass, detail = "") {
  results.push({ name, pass, detail });
  const icon = pass ? "PASS" : "FAIL";
  console.log(`[${icon}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function postJson(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function basePayload(overrides = {}) {
  return {
    broad_category_id: "research-innovation",
    broad_category_title: "Research & Innovation",
    sub_category_id: "research-commercialisation-potential",
    sub_category_title: "Research with Commercialisation Potential",
    flow_data: {
      research_title: "Stress Test Title",
      research_summary: LONG.slice(0, 10000),
      problem_being_solved: XSS,
      innovation_description: SQL,
      current_stage: "Prototype",
    },
    commercialisation: {
      assistance_looking_for: "Open to Discussion",
      preferred_models: ["Licensing", "Equity"],
      financial_expectations: LONG.slice(0, 5000),
      confidentiality_level: "public",
    },
    institution_research: {
      research_strengths: LONG.slice(0, 8000),
      major_labs: "Lab " + LONG.slice(0, 1000),
    },
    applicant: {
      full_name: LONG.slice(0, 500),
      designation: "Professor " + LONG.slice(0, 200),
      institution: "Test University",
      city_state: "Delhi, India",
      department: "Computer Science",
      official_email: "stress.test@example.com",
      mobile_number: "9876543210",
      linkedin_url: "https://linkedin.com/in/stresstest",
      google_scholar_url: "https://scholar.google.com",
      orcid: "0000-0000-0000-0000",
    },
    professional: {
      highest_qualification: "PhD",
      years_of_experience: 999999,
      primary_research_area: LONG.slice(0, 300),
      areas_of_expertise: LONG.slice(0, 15000),
      professional_biography: LONG.slice(0, 20000),
      major_achievements: XSS.repeat(10),
    },
    additional_achievements: [
      {
        achievement_type: "Award",
        title: LONG.slice(0, 500),
        year: "2024",
        description: LONG.slice(0, 5000),
      },
      {
        achievement_type: "Publication",
        title: "Paper 2",
        year: "2023",
        description: XSS,
      },
    ],
    collaboration_interests: ["Research Commercialisation", "Mentoring"],
    declarations: {
      declaration_information_accurate: true,
      declaration_authorized_to_share: true,
      declaration_authorize_verification: true,
      declaration_consent_publish: true,
      declaration_consent_commercialization_contact: true,
      declaration_agree_privacy_terms: true,
    },
    files: [],
    ...overrides,
  };
}

async function testHealth() {
  const res = await fetch(`${API}/health`);
  log("Health check", res.ok, `status ${res.status}`);
}

async function testSubmitMissingFields() {
  const { status, data } = await postJson("/recognition/applications", {});
  log(
    "Reject empty submit",
    status === 400 && data.error,
    data.message?.slice(0, 80)
  );
}

async function testSubmitHugePayload() {
  const payload = basePayload();
  const { status, data } = await postJson("/recognition/applications", payload);
  log(
    "Submit large text payload (10k–20k chars in fields)",
    status === 201 && !data.error,
    data.error ? data.message?.slice(0, 120) : `ref ${data.data?.reference_number}`
  );
  return data.data?.id;
}

async function testSubmitMaliciousFileUrl() {
  const payload = basePayload({
    applicant: {
      full_name: "Stress Test User",
      designation: "Professor",
      institution: "Test University",
      city_state: "Delhi, India",
      department: "Computer Science",
      official_email: "malicious.file@example.com",
      mobile_number: "9876543210",
      linkedin_url: "https://linkedin.com/in/stresstest",
    },
    files: [
      {
        field_key: "cv",
        section: "supporting",
        url: "https://evil.com/malware.pdf",
        key: "documents/fake.pdf",
        original_name: "evil.pdf",
        mime_type: "application/pdf",
        size_bytes: 100,
      },
    ],
  });
  const { status, data } = await postJson("/recognition/applications", payload);
  log(
    "Reject foreign file URL on submit",
    status === 400 && data.error,
    data.message?.slice(0, 120) || "rejected"
  );
}

async function testSubmitXssPayload() {
  const payload = basePayload({
    applicant: {
      full_name: XSS.slice(0, 100),
      designation: "Professor",
      institution: "Test University",
      city_state: "Delhi",
      department: "CS",
      official_email: "xss.test@example.com",
      mobile_number: "9876543210",
      linkedin_url: "https://linkedin.com/in/xss",
    },
  });
  const { status, data } = await postJson("/recognition/applications", payload);
  log(
    "Submit XSS strings in text fields",
    status === 201 || status === 400,
    data.error ? data.message?.slice(0, 80) : `stored ref ${data.data?.reference_number}`
  );
}

async function testOversizedNameField() {
  const payload = basePayload({
    applicant: {
      full_name: "X".repeat(2000),
      designation: "Professor",
      institution: "Test University",
      city_state: "Delhi",
      department: "CS",
      official_email: "overflow.name@example.com",
      mobile_number: "9876543210",
      linkedin_url: "https://linkedin.com/in/overflow",
    },
  });
  const { status, data } = await postJson("/recognition/applications", payload);
  log(
    "Handle/truncate 2000-char name (DB limit 255)",
    status === 201 && !data.error,
    data.error ? data.message?.slice(0, 120) : `truncated ref ${data.data?.reference_number}`
  );
}

async function testInvalidEmailSubmit() {
  const payload = basePayload({
    applicant: {
      ...basePayload().applicant,
      official_email: "not-an-email",
    },
  });
  const { status, data } = await postJson("/recognition/applications", payload);
  log(
    "Reject invalid email format",
    status === 400,
    `status ${status} — ${data.message?.slice(0, 60) || "no validation yet"}`
  );
}

async function testUploadOversizedFile() {
  const bigBuffer = Buffer.alloc(6 * 1024 * 1024, "a"); // 6MB image limit is 5MB
  const form = new FormData();
  form.append("field_key", "photograph");
  form.append("section", "applicant");
  form.append("file", new Blob([bigBuffer], { type: "image/png" }), "big.png");

  const res = await fetch(`${API}/recognition/upload`, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  log(
    "Reject 6MB image upload (>5MB limit)",
    res.status === 400 && data.error,
    data.message?.slice(0, 80)
  );
}

async function testUploadWrongMimeForField() {
  const form = new FormData();
  form.append("field_key", "photograph");
  form.append("section", "applicant");
  form.append("file", new Blob(["not an image"], { type: "application/pdf" }), "doc.pdf");

  const res = await fetch(`${API}/recognition/upload`, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  log(
    "Reject PDF on photograph field",
    res.status === 400 && data.error,
    data.message?.slice(0, 80)
  );
}

async function run() {
  console.log("\n=== CARPI Recognition Sprint Tests ===\n");
  console.log(`API: ${API}\n`);

  await testHealth();
  await testSubmitMissingFields();
  await testInvalidEmailSubmit();
  await testUploadWrongMimeForField();
  await testUploadOversizedFile();
  await testOversizedNameField();
  await testSubmitMaliciousFileUrl();
  await testSubmitXssPayload();
  await testSubmitHugePayload();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n=== Summary: ${results.length - failed.length}/${results.length} passed ===`);
  if (failed.length) {
    console.log("\nFailed / vulnerabilities:");
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error("Test runner error:", err.message);
  process.exit(1);
});
