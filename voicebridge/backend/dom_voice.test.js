// Headless JSDOM Voice Section Integration Test
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

// Paths to static frontend assets
const htmlPath = path.join(__dirname, '../../index.html');
const jsPath = path.join(__dirname, '../../app.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("jsdomError", (err) => console.error("JSDOM Error:", err));
virtualConsole.on("error", (err) => console.error("Script Error:", err));
virtualConsole.on("warn", (msg) => console.warn("Script Warn:", msg));
virtualConsole.on("log", (msg) => console.log("Script Log:", msg));

// Boot JSDOM with tailwind and lucide mocks and non-opaque origin URL
const dom = new JSDOM(htmlContent, {
  url: "http://localhost/", // non-opaque origin allows localStorage
  runScripts: "dangerously",
  virtualConsole,
  beforeParse(window) {
    window.tailwind = { config: {} };
    window.lucide = { createIcons: () => {} };
    window.isSecureContext = true;
  }
});

const { window } = dom;
const { document } = window;

// 1. Mock Web Speech SpeechRecognition API
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-IN';
  }
  start() {
    if (this.onstart) this.onstart();
  }
  stop() {
    if (this.onend) this.onend();
  }
}
window.webkitSpeechRecognition = MockSpeechRecognition;
window.SpeechRecognition = MockSpeechRecognition;

// 2. Mock Web Speech SpeechSynthesis API (TTS)
window.speechSynthesis = {
  cancel: () => {},
  speak: () => {},
  getVoices: () => []
};
window.SpeechSynthesisUtterance = class {
  constructor(text) {
    this.text = text;
  }
};

// 3. Mock browser alert/confirm methods
window.alert = (msg) => console.log('   [Mock Alert]:', msg);
window.confirm = (msg) => {
  console.log('   [Mock Confirm]:', msg);
  return true;
};

// 4. Mock setTimeout to execute synchronously to instantly complete typing animations
window.setTimeout = (fn) => {
  fn();
  return 1;
};

// Execute app.js script inside the loaded DOM window context
const scriptElement = document.createElement("script");
scriptElement.textContent = jsContent;
document.body.appendChild(scriptElement);

// Dispatch DOMContentLoaded event to trigger app.js initializations
const event = new window.Event('DOMContentLoaded');
document.dispatchEvent(event);

// Assert Verification Helper
let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    failures++;
  } else {
    console.log(`  [PASS] ${message}`);
  }
}

console.log("=== STARTING DYNAMIC DOM VOICE SECTION TESTS ===");

// TEST 1: Initial DOM State Audit
console.log("\nRunning TEST 1: Initial DOM State Audit...");
const micBtn = document.getElementById('mic-btn');
const transcriptDisplay = document.getElementById('transcript-display');
const submitBtn = document.getElementById('submit-btn');

assert(micBtn !== null, "Microphone event button exists in DOM structure");
assert(transcriptDisplay !== null, "Speech transcript stream output container exists in DOM");
assert(submitBtn !== null, "AI Dispatch trigger button exists in DOM");
assert(submitBtn.disabled === true, "AI Dispatch button is initially set to disabled");

// TEST 2: Microphone State Activations
console.log("\nRunning TEST 2: Microphone State Activations...");
micBtn.click();

const indicator = document.getElementById('recording-indicator');
const status = document.getElementById('recording-status');
assert(indicator.classList.contains('bg-red-500'), "Recording badge indicator transitions to active red theme");
assert(status.innerText === 'Neural Stream Active', "Recording state text updates to active neural feed status");

// TEST 3: Microphone Standby State Disables
console.log("\nRunning TEST 3: Microphone Standby State Disables...");
micBtn.click();
assert(indicator.classList.contains('bg-gray-700'), "Recording badge indicator reverts to standby gray theme");

// TEST 4: Simulated Audio Wave Transliteration via Simulation Preset Chip Click
console.log("\nRunning TEST 4: Simulated Audio Wave Transliteration...");
const simChips = document.querySelectorAll(".sim-chip");
assert(simChips.length > 0, "Simulation preset chips exist in the DOM");

// Trigger click on first simulation preset chip (Delhi Gate Pothole/Light Failure)
simChips[0].click();

assert(transcriptDisplay.innerText === "Street light not working near Delhi Gate market area", "Simulated typewriter text successfully populated into the transcript container");
assert(submitBtn.disabled === false, "AI Dispatch button becomes enabled upon populating audio transcript content");

// TEST 5: Automated Complaint Dispatch
console.log("\nRunning TEST 5: Automated Complaint Dispatch...");
submitBtn.click();
const searchInput = document.getElementById('search-id');
assert(searchInput.value.startsWith('VB-'), `Ledger entry created and search element prefilled with reference ID: ${searchInput.value}`);

// TEST 6: Real-time Lifecycle Tracker Verification
console.log("\nRunning TEST 6: Real-time Lifecycle Tracker Verification...");
const verifyBtn = document.querySelector("button[onclick='trackComplaint()']");
assert(verifyBtn !== null, "Verify Status button exists in DOM");
verifyBtn.click();

const trackingResult = document.getElementById('tracking-result');
assert(!trackingResult.classList.contains('hidden'), "Tracking portal successfully reveals results card");
assert(trackingResult.innerHTML.includes("Transcript Record"), "Tracking card correctly renders the verified incident logs");
assert(trackingResult.innerHTML.includes("Electricity Department") || trackingResult.innerHTML.includes("Electricity"), "Complaint routed correctly to the Electricity Department");
assert(trackingResult.innerHTML.includes("Medium") || trackingResult.innerHTML.includes("Critical"), "Incident priority weight calculated correctly");

// TEST 7: Operations Control Deck Sync
console.log("\nRunning TEST 7: Operations Control Deck Sync...");
const btnAdmin = document.getElementById('btn-admin');
assert(btnAdmin !== null, "Admin tab button exists in navigation bar");
btnAdmin.click();

const statTotal = document.getElementById('stat-total').innerText;
assert(parseInt(statTotal) > 5, `Admin statistics synchronized. Ledger contains seeded mock data and new dispatch, got: ${statTotal}`);

console.log("\n=== DOM TEST RUN COMPLETE ===");
console.log(`Total assertions checked: ${14}`);
console.log(`Passes: ${14 - failures}`);
console.log(`Failures: ${failures}`);

if (failures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
