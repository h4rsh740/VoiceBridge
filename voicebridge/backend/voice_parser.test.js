// Voice Parser Categorization Logic Test

const ANALYZE_COMPLAINT = (text) => {
  const lower = text.toLowerCase();
  let analysis = {
    dept: 'General',
    priority: 'Medium',
    solution: 'Dispatching field engineers to inspect visual site conditions and audit civic safety.',
    eta: '72 Hours',
    location: 'NCR Municipal Area'
  };

  // Location extraction rules
  const locations = [
    'delhi gate', 'noida sector 15', 'noida sector 62', 'nehru place', 
    'connaught place', 'saket', 'karol bagh', 'dwarka', 'indiranagar', 
    'rajouri garden', 'sector 62', 'market', 'metro station'
  ];
  for (const loc of locations) {
    if (lower.includes(loc)) {
      analysis.location = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // Category routing and AI solution matrix
  if (lower.includes('light') || lower.includes('electric') || lower.includes('power') || lower.includes('transformer') || lower.includes('transform') || lower.includes('bijli') || lower.includes('andhera') || lower.includes('spark')) {
    analysis.dept = 'Electricity';
    analysis.solution = 'Technician squad dispatched for circuit checking, load auditing, and replacement of dead luminaire assemblies.';
    analysis.eta = '24 Hours';
    if (lower.includes('spark') || lower.includes('fire') || lower.includes('short circuit') || lower.includes('wire')) {
      analysis.priority = 'Critical';
      analysis.eta = '4 Hours';
      analysis.solution = 'EMERGENCY: Immediate breaker isolate command sent. Team dispatched for primary electrical wiring isolation.';
    }
  } else if (lower.includes('road') || lower.includes('pothole') || lower.includes('crack') || lower.includes('street') || lower.includes('sadak') || lower.includes('khadda') || lower.includes('rastha')) {
    analysis.dept = 'Roads';
    analysis.solution = 'Engineering dispatch ordered: aggregate asphalt mixture and rapid compactor rollout planned.';
    analysis.eta = '48 Hours';
    if (lower.includes('accident') || lower.includes('traffic') || lower.includes('danger')) {
      analysis.priority = 'High';
    }
  } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('clean') || lower.includes('sanitation') || lower.includes('sewage') || lower.includes('kachra') || lower.includes('safai') || lower.includes('gandagi')) {
    analysis.dept = 'Sanitation';
    analysis.solution = 'Sanitation node truck scheduled for immediate manual cleanup and chemical wash treatment.';
    analysis.eta = '12 Hours';
    if (lower.includes('overflow') || lower.includes('clog') || lower.includes('stench')) {
      analysis.priority = 'High';
      analysis.eta = '8 Hours';
    }
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('hydrant') || lower.includes('pani') || lower.includes('nal') || lower.includes('naali')) {
    analysis.dept = 'Water';
    analysis.solution = 'Municipal plumbing engineers routed for valve shutoff and heavy-duty pipe sleeve reinforcement.';
    analysis.eta = '24 Hours';
    if (lower.includes('flooding') || lower.includes('drain')) {
      analysis.priority = 'High';
    }
  }

  if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('dangerous') || lower.includes('immediate')) {
    analysis.priority = 'Critical';
    analysis.eta = '4 Hours';
  }

  return analysis;
};

// Test Suite
const testCases = [
  {
    input: "Street light not working near Delhi Gate Block C",
    expectedDept: "Electricity",
    expectedPriority: "Medium"
  },
  {
    input: "Humare mohalle mein transform spark ho raha hai, emergency!",
    expectedDept: "Electricity",
    expectedPriority: "Critical"
  },
  {
    input: "Huge potholes on Noida Sector 15 road causing traffic jams",
    expectedDept: "Roads",
    expectedPriority: "High"
  },
  {
    input: "Sadak par bahut khadda hai, accident ho sakta hai",
    expectedDept: "Roads",
    expectedPriority: "High"
  },
  {
    input: "Kachra vehicle has not come, trash and garbage is overflowing in Sector 62",
    expectedDept: "Sanitation",
    expectedPriority: "High"
  },
  {
    input: "Underground pipeline burst and drinking water leakage in Nehru Place",
    expectedDept: "Water",
    expectedPriority: "Medium"
  },
  {
    input: "Nal se pani leak ho raha hai gully number teen mein",
    expectedDept: "Water",
    expectedPriority: "Medium"
  }
];

let failures = 0;
console.log("=== STARTING VOICE PARSING UNIT TESTS ===");
testCases.forEach((tc, idx) => {
  const result = ANALYZE_COMPLAINT(tc.input);
  const deptMatch = result.dept === tc.expectedDept;
  const priorityMatch = result.priority === tc.expectedPriority;
  
  if (deptMatch && priorityMatch) {
    console.log(`[PASS] Case #${idx + 1}: "${tc.input}" -> routed to ${result.dept} (${result.priority})`);
  } else {
    failures++;
    console.error(`[FAIL] Case #${idx + 1}: "${tc.input}"`);
    console.error(`       Expected: Dept=${tc.expectedDept}, Priority=${tc.expectedPriority}`);
    console.error(`       Got     : Dept=${result.dept}, Priority=${result.priority}`);
  }
});

console.log("\n=== TEST RUN RESULTS ===");
console.log(`Total Cases: ${testCases.length}`);
console.log(`Passes: ${testCases.length - failures}`);
console.log(`Failures: ${failures}`);

if (failures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
