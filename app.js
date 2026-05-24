// --- State Management & Seed Mock Data ---
const INITIAL_SEED_DATA = [
    {
        id: 'VB-4318',
        text: 'Electricity pole transformer sparking and blinking near Delhi Gate block C.',
        dept: 'Electricity',
        status: 'inspection',
        priority: 'Critical',
        solution: 'Emergency transformer inspection, fuse replacement, and insulator realignment.',
        eta: '4 Hours',
        location: 'Delhi Gate Block C',
        date: new Date(Date.now() - 3600000 * 2).toLocaleString()
    },
    {
        id: 'VB-9102',
        text: 'Huge potholes on Noida Sector 15 road causing traffic jams and bike slippage.',
        dept: 'Roads',
        status: 'repair',
        priority: 'High',
        solution: 'Pothole asphalt filling, leveling with compact roller, and surface re-seal.',
        eta: '48 Hours',
        location: 'Noida Sector 15 Road',
        date: new Date(Date.now() - 3600000 * 8).toLocaleString()
    },
    {
        id: 'VB-5047',
        text: 'Sanitation vehicle has not visited Sector 62 for 3 days, garbage overflow is causing stench.',
        dept: 'Sanitation',
        status: 'assigned',
        priority: 'Medium',
        solution: 'Immediate dispatch of municipal sanitation garbage compactor and site cleaning team.',
        eta: '12 Hours',
        location: 'Sector 62',
        date: new Date(Date.now() - 3600000 * 12).toLocaleString()
    },
    {
        id: 'VB-1284',
        text: 'Underground pipeline burst and drinking water leakage in Nehru Place near Metro Station.',
        dept: 'Water',
        status: 'registered',
        priority: 'Medium',
        solution: 'Hydro-excavation to locate pipeline rupture, pipe replacement, and pressure valve sealing.',
        eta: '24 Hours',
        location: 'Nehru Place near Metro Station',
        date: new Date(Date.now() - 3600000 * 1).toLocaleString()
    },
    {
        id: 'VB-7729',
        text: 'Street light not working near market area behind block 4, very dark at night.',
        dept: 'Electricity',
        status: 'resolved',
        priority: 'Low',
        solution: 'Replacement of blown bulb with 120W LED module and photo-sensor calibration.',
        eta: '24 Hours',
        location: 'Market Area Block 4',
        date: new Date(Date.now() - 3600000 * 36).toLocaleString()
    }
];

let complaints = JSON.parse(localStorage.getItem('vb_database_v3'));
if (!complaints || complaints.length === 0) {
    complaints = [...INITIAL_SEED_DATA];
    localStorage.setItem('vb_database_v3', JSON.stringify(complaints));
}

// Active Department Filter State
let currentFilter = 'All';

// --- Constants ---
const STAGES = ['registered', 'assigned', 'inspection', 'repair', 'resolved'];
const STAGE_LABELS = {
    'registered': 'Complaint Registered',
    'assigned': 'Department Assigned',
    'inspection': 'Inspection Started',
    'repair': 'Repair Team Assigned',
    'resolved': 'Complaint Resolved'
};

const STAGE_ICONS = {
    'registered': 'file-text',
    'assigned': 'user-check',
    'inspection': 'eye',
    'repair': 'wrench',
    'resolved': 'award'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateDashboardUI();

    // Check for Secure Context (Microphone security limit)
    if (!window.isSecureContext) {
        showNotification("SYSTEM", "Secure Context Required: Browser limits microphone to HTTPS/localhost.");
        const display = document.getElementById('transcript-display');
        display.innerHTML = `<span class="text-amber-500 font-bold block mb-1">⚠️ SECURE CONTEXT REQUIRED</span> Microphone recording is blocked on insecure HTTP. Please use the simulated preset buttons below, or host on localhost/HTTPS.`;
        display.classList.remove('opacity-60', 'italic');
    }
});

// --- Tab Navigation ---
function viewTab(tab) {
    const homeTab = document.getElementById('tab-home');
    const adminTab = document.getElementById('tab-admin');
    const btnHome = document.getElementById('btn-home');
    const btnAdmin = document.getElementById('btn-admin');

    if (tab === 'home') {
        homeTab.classList.remove('hidden');
        adminTab.classList.add('hidden');
        btnHome.classList.add('active');
        btnAdmin.classList.remove('active');
        btnAdmin.classList.add('text-gray-400');
    } else {
        homeTab.classList.add('hidden');
        adminTab.classList.remove('hidden');
        btnAdmin.classList.add('active');
        btnHome.classList.remove('active');
        btnHome.classList.add('text-gray-400');
        updateDashboardUI();
    }
    lucide.createIcons();
}

// --- Voice Recognition ---
let isRecording = false;
let recognition;
let simulationTimeout;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop automatically when done speaking
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
        startRecordingUI();
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        const display = document.getElementById('transcript-display');
        display.innerText = transcript;
        display.classList.remove('opacity-60', 'italic');
        
        // Enable dispatch button
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = false;
        submitBtn.className = "w-full py-4.5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all duration-300 bg-white text-black hover:bg-primary shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-[1.01] active:scale-95 cursor-pointer border border-primary/20";
    };

    recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        stopRecordingUI();

        const display = document.getElementById('transcript-display');
        if (event.error === 'not-allowed') {
            display.innerHTML = `<span class="text-red-500 font-bold block mb-1">⚠️ MIC ACCESS BLOCKED</span> Permission denied. Please grant microphone access in your browser settings or use the simulated preset buttons below.`;
            display.classList.remove('opacity-60', 'italic');
        } else if (event.error === 'audio-capture') {
            display.innerHTML = `<span class="text-red-500 font-bold block mb-1">⚠️ NO MICROPHONE DETECTED</span> No audio hardware found.`;
            display.classList.remove('opacity-60', 'italic');
        } else if (event.error === 'no-speech') {
            display.innerHTML = `<span class="text-amber-500 font-bold block mb-1">⚠️ NO SPEECH DETECTED</span> No voice detected. Please speak clearly or try again.`;
            display.classList.remove('opacity-60', 'italic');
        } else {
            display.innerHTML = `<span class="text-red-500 font-bold block mb-1">⚠️ MIC ERROR</span> Voice recognition error: ${event.error}`;
            display.classList.remove('opacity-60', 'italic');
        }
    };

    recognition.onend = () => {
        stopRecordingUI();
    };
}

const micBtn = document.getElementById('mic-btn');
micBtn.addEventListener('click', () => {
    if (!window.isSecureContext) {
        showNotification("SYSTEM", "Microphone access blocked on insecure connection.");
        alert("Microphone recording is blocked by your browser on insecure HTTP connections. Please use the simulation triggers below!");
        return;
    }

    if (!recognition) {
        alert("Speech Recognition not supported in this browser. Please use simulation buttons instead.");
        return;
    }
    
    // Clear any active simulated typing
    if (simulationTimeout) clearTimeout(simulationTimeout);

    if (!isRecording) {
        try {
            recognition.start();
        } catch (err) {
            console.error("Start Recognition error:", err);
            stopRecordingUI();
        }
    } else {
        recognition.stop();
    }
});

function startRecordingUI() {
    isRecording = true;
    const btn = document.getElementById('mic-btn');
    const indicator = document.getElementById('recording-indicator');
    const status = document.getElementById('recording-status');
    const waves = document.getElementById('voice-waves');
    
    btn.classList.add('animate-pulse-red', 'bg-red-600');
    btn.classList.remove('bg-primary');
    btn.innerHTML = `<i data-lucide="square" class="w-10 h-10 text-white"></i>`;
    indicator.classList.add('bg-red-500', 'animate-ping');
    indicator.classList.remove('bg-gray-700');
    status.innerText = 'Neural Stream Active';
    status.classList.add('text-red-500');
    waves.classList.add('active');
    waves.classList.remove('opacity-0');
    
    const display = document.getElementById('transcript-display');
    display.innerText = "Listening to voice input... speak clearly...";
    display.classList.add('opacity-60', 'italic');
    
    lucide.createIcons();
}

function stopRecordingUI() {
    isRecording = false;
    const btn = document.getElementById('mic-btn');
    const indicator = document.getElementById('recording-indicator');
    const status = document.getElementById('recording-status');
    const waves = document.getElementById('voice-waves');
    
    btn.classList.remove('animate-pulse-red', 'bg-red-600');
    btn.classList.add('bg-primary');
    btn.innerHTML = `<i data-lucide="mic" class="w-10 h-10 text-black"></i>`;
    indicator.classList.remove('bg-red-500', 'animate-ping');
    indicator.classList.add('bg-gray-700');
    status.innerText = 'Neural Standby';
    status.classList.remove('text-red-500');
    waves.classList.remove('active');
    waves.classList.add('opacity-0');
    
    lucide.createIcons();
}

// --- Simulated Voice Input (Typing Animation) ---
function simulateVoice(phrase) {
    if (isRecording) {
        recognition.stop();
        stopRecordingUI();
    }
    
    if (simulationTimeout) clearTimeout(simulationTimeout);
    
    const display = document.getElementById('transcript-display');
    display.innerText = "";
    display.classList.remove('opacity-60', 'italic');
    
    // Animate speech recognition indicator
    const btn = document.getElementById('mic-btn');
    const indicator = document.getElementById('recording-indicator');
    const status = document.getElementById('recording-status');
    const waves = document.getElementById('voice-waves');
    
    btn.classList.add('animate-pulse-red', 'bg-red-600');
    btn.classList.remove('bg-primary');
    indicator.classList.add('bg-red-500', 'animate-ping');
    indicator.classList.remove('bg-gray-700');
    status.innerText = 'Simulating Stream...';
    status.classList.add('text-red-500');
    waves.classList.add('active');
    waves.classList.remove('opacity-0');
    
    let i = 0;
    function typeWriter() {
        if (i < phrase.length) {
            display.innerText += phrase.charAt(i);
            i++;
            // Rapid random typewriter delay
            simulationTimeout = setTimeout(typeWriter, 15 + Math.random() * 20);
        } else {
            // Done typing
            btn.classList.remove('animate-pulse-red', 'bg-red-600');
            btn.classList.add('bg-primary');
            indicator.classList.remove('bg-red-500', 'animate-ping');
            indicator.classList.add('bg-gray-700');
            status.innerText = 'Neural Standby';
            status.classList.remove('text-red-500');
            waves.classList.remove('active');
            waves.classList.add('opacity-0');
            
            // Enable dispatch button
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = false;
            submitBtn.className = "w-full py-4.5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all duration-300 bg-white text-black hover:bg-primary shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-[1.01] active:scale-95 cursor-pointer border border-primary/20";
        }
    }
    typeWriter();
}

// --- Submission Logic ---
const submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', () => {
    const text = document.getElementById('transcript-display').innerText;
    if (!text || text.includes('Click the microphone') || text.includes('Listening to voice')) return;

    const analysis = analyzeComplaint(text);
    const newComplaint = {
        id: `VB-${Math.floor(Math.random() * 9000) + 1000}`,
        text: text,
        dept: analysis.dept,
        status: 'registered', // starts at registered stage
        priority: analysis.priority,
        solution: analysis.solution,
        eta: analysis.eta,
        location: analysis.location,
        date: new Date().toLocaleString()
    };

    complaints.unshift(newComplaint);
    saveData();
    showNotification(newComplaint.id);
    
    // Auto-populate the search field with the new complaint id for quick tracking experience!
    document.getElementById('search-id').value = newComplaint.id;
    
    // Reset UI
    document.getElementById('transcript-display').innerText = '"Click the microphone to start speaking, or choose a simulated civic issue below..."';
    document.getElementById('transcript-display').classList.add('opacity-60', 'italic');
    submitBtn.disabled = true;
    submitBtn.className = "w-full py-4.5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all duration-300 bg-white/5 text-gray-600 cursor-not-allowed border border-white/5 shadow-lg";
    
    // Refresh admin view stats and data in background
    updateDashboardUI();
});

// AI Complaint Parsing Rules
function analyzeComplaint(text) {
    const lower = text.toLowerCase();
    let result = {
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
            // Capitalize location properly
            result.location = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            break;
        }
    }

    // Category routing and AI solution matrix
    if (lower.includes('light') || lower.includes('electric') || lower.includes('power') || lower.includes('transformer')) {
        result.dept = 'Electricity';
        result.solution = 'Technician squad dispatched for circuit checking, load auditing, and replacement of dead luminaire assemblies.';
        result.eta = '24 Hours';
        if (lower.includes('spark') || lower.includes('fire') || lower.includes('short circuit') || lower.includes('wire')) {
            result.priority = 'Critical';
            result.eta = '4 Hours';
            result.solution = 'EMERGENCY: Immediate breaker isolate command sent. Team dispatched for primary electrical wiring isolation.';
        }
    } else if (lower.includes('road') || lower.includes('pothole') || lower.includes('crack') || lower.includes('street')) {
        result.dept = 'Roads';
        result.solution = 'Engineering dispatch ordered: thermal aggregate asphalt mixture and rapid compactor rollout planned.';
        result.eta = '48 Hours';
        if (lower.includes('accident') || lower.includes('traffic') || lower.includes('danger')) {
            result.priority = 'High';
        }
    } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('clean') || lower.includes('sanitation') || lower.includes('sewage')) {
        result.dept = 'Sanitation';
        result.solution = 'Sanitation node truck scheduled for immediate manual cleanup and chemical wash treatment.';
        result.eta = '12 Hours';
        if (lower.includes('overflow') || lower.includes('clog') || lower.includes('stench')) {
            result.priority = 'High';
            result.eta = '8 Hours';
        }
    } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('hydrant')) {
        result.dept = 'Water';
        result.solution = 'Municipal plumbing engineers routed for valve shutoff and heavy-duty pipe sleeve reinforcement.';
        result.eta = '24 Hours';
        if (lower.includes('flooding') || lower.includes('drain')) {
            result.priority = 'High';
        }
    }

    // Generic urgency modifier
    if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('dangerous') || lower.includes('immediate')) {
        result.priority = 'Critical';
        result.eta = '4 Hours';
    }

    return result;
}

// --- Reference Tracking Portal ---
function trackComplaint() {
    const idInput = document.getElementById('search-id').value.trim().toUpperCase();
    const resultDiv = document.getElementById('tracking-result');
    
    if (!idInput) {
        resultDiv.innerHTML = `<div class="text-red-500 font-bold p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">Please enter a valid Reference ID.</div>`;
        resultDiv.classList.remove('hidden');
        return;
    }

    const record = complaints.find(c => c.id === idInput);

    if (!record) {
        resultDiv.innerHTML = `<div class="text-red-500 font-bold p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">Invalid Reference Node. Target ID "${idInput}" not found in digital ledger.</div>`;
    } else {
        const stageIdx = STAGES.indexOf(record.status);
        const progress = (stageIdx / (STAGES.length - 1)) * 100;

        resultDiv.innerHTML = `
            <div class="space-y-8 animate-slide-up">
                <!-- Metadata Indicators Grid -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div class="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Status Node</div>
                        <div class="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            ${STAGE_LABELS[record.status]}
                        </div>
                    </div>
                    <div class="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div class="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Priority Level</div>
                        <div class="text-xs font-extrabold font-mono uppercase ${record.priority === 'Critical' ? 'text-red-500' : record.priority === 'High' ? 'text-orange-500' : 'text-primary'}">${record.priority}</div>
                    </div>
                    <div class="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div class="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Assigned Department</div>
                        <div class="text-xs font-bold text-gray-200">${record.dept}</div>
                    </div>
                    <div class="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div class="text-[9px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Estimated Resolution (ETA)</div>
                        <div class="text-xs font-bold text-secondary font-mono">${record.eta}</div>
                    </div>
                </div>

                <!-- Complaint Details & Location -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white/5 border border-white/5 p-5 rounded-2xl md:col-span-2">
                        <div class="text-[9px] text-gray-500 font-bold uppercase mb-2 tracking-wider">Transcript Record</div>
                        <p class="text-sm font-semibold text-gray-300 italic">"${record.text}"</p>
                    </div>
                    <div class="bg-white/5 border border-white/5 p-5 rounded-2xl">
                        <div class="text-[9px] text-gray-500 font-bold uppercase mb-2 tracking-wider">Identified Location</div>
                        <div class="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-red-500"></i> ${record.location}
                        </div>
                        <div class="text-[9px] text-gray-600 font-mono mt-1">LAT/LNG: 28.6139, 77.2090</div>
                    </div>
                </div>

                <!-- AI Solution Alert -->
                <div class="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                    <h4 class="text-xs font-bold text-primary mb-2 uppercase tracking-widest flex items-center gap-2">
                        <i data-lucide="cpu" class="w-4 h-4"></i> Automated AI Diagnostic Action Plan
                    </h4>
                    <p class="text-xs md:text-sm text-gray-300 leading-relaxed font-semibold">"${record.solution}"</p>
                </div>

                <!-- 5-Stage Visual Workflow Tracker -->
                <div class="relative pt-6 pb-4">
                    <!-- Progress Bar Track Background -->
                    <div class="absolute top-[37px] left-8 right-8 h-1 bg-white/5 rounded-full -z-10">
                        <!-- Glowing completed progress fill -->
                        <div class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 shadow-[0_0_15px_#39FF14]" style="width: ${progress}%"></div>
                    </div>
                    
                    <div class="flex justify-between relative px-2">
                        ${STAGES.map((s, i) => {
                            const isCompleted = i < stageIdx;
                            const isActive = i === stageIdx;
                            const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
                            return `
                                <div class="workflow-step ${statusClass} flex flex-col items-center gap-2 flex-1">
                                    <div class="node-circle w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 text-xs 
                                        ${isCompleted ? 'bg-primary border-primary text-black' : (isActive ? 'bg-secondary border-secondary text-black animate-pulse' : 'bg-dark-base border-white/10 text-gray-600')}"
                                    >
                                        <i data-lucide="${STAGE_ICONS[s]}" class="w-4 h-4"></i>
                                    </div>
                                    <span class="text-[8px] md:text-[9px] font-extrabold uppercase text-center max-w-[80px] tracking-tight transition-all duration-500
                                        ${isCompleted ? 'text-primary font-bold' : (isActive ? 'text-secondary font-black' : 'text-gray-600')}"
                                    >
                                        ${STAGE_LABELS[s].split(' ').slice(1).join(' ') || STAGE_LABELS[s]}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    resultDiv.classList.remove('hidden');
    lucide.createIcons();
}

// --- Admin Section (Operational Center Dashboard) ---
function updateDashboardUI() {
    updateStatistics();
    renderDepartmentChart();
    renderAdminList();
}

function updateStatistics() {
    const totalCount = complaints.length;
    const pendingCount = complaints.filter(c => c.status !== 'resolved').length;
    const criticalCount = complaints.filter(c => c.priority === 'Critical').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

    // Set statistics numbers
    document.getElementById('total-count').innerText = `Live Civic Stream: ${totalCount} Records Synchronized`;
    document.getElementById('stat-total').innerText = totalCount;
    document.getElementById('stat-pending').innerText = pendingCount;
    document.getElementById('stat-critical').innerText = criticalCount;
    document.getElementById('stat-resolved').innerText = resolvedCount;
}

// Dynamic SVG Bar Chart Renderer
function renderDepartmentChart() {
    const container = document.getElementById('chart-container');
    if (!container) return;

    // Count complaints per department
    const depts = ['Electricity', 'Roads', 'Sanitation', 'Water', 'General'];
    const counts = depts.reduce((acc, d) => {
        acc[d] = complaints.filter(c => c.dept === d).length;
        return acc;
    }, {});

    const maxCount = Math.max(...Object.values(counts), 1); // Avoid division by zero

    // Generate responsive bars using HTML/CSS/Flexbox with neon fill heights
    container.innerHTML = depts.map(d => {
        const count = counts[d] || 0;
        const pct = (count / maxCount) * 100;
        // Dynamic color for bars based on count intensity
        const barColor = d === 'Electricity' ? '#39FF14' : d === 'Roads' ? '#00FFFF' : d === 'Water' ? '#38bdf8' : d === 'Sanitation' ? '#a855f7' : '#ec4899';
        const shadowGlow = `0 0 20px ${barColor}40`;
        
        return `
            <div class="flex flex-col items-center w-full group relative cursor-pointer" onclick="filterAdminList('${d}')">
                <!-- Count Bubble on Hover -->
                <div class="absolute -top-10 opacity-0 group-hover:opacity-100 bg-white text-black font-mono font-bold text-[10px] px-2 py-1 rounded transition-all pointer-events-none z-30 shadow-lg">
                    ${count} Dispatches
                </div>
                <!-- Interactive Vertical Bar -->
                <div class="w-10 sm:w-16 rounded-t-lg transition-all duration-1000 relative overflow-hidden" 
                     style="height: ${pct * 1.3 + 15}px; background: linear-gradient(to top, rgba(255,255,255,0.02), ${barColor}); box-shadow: ${shadowGlow};"
                >
                    <!-- Scanning line inside bar -->
                    <div class="absolute w-full h-0.5 bg-white/40 top-0 left-0 animate-pulse"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Render dynamic ledger lists with department filters
function renderAdminList() {
    const list = document.getElementById('admin-list');
    if (!list) return;

    // Filter logic
    const filtered = currentFilter === 'All' 
        ? complaints 
        : complaints.filter(c => c.dept === currentFilter);

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="glass p-12 rounded-[30px] border-white/5 text-center">
                <i data-lucide="package-open" class="w-12 h-12 text-gray-600 mx-auto mb-4 animate-bounce"></i>
                <div class="text-gray-500 font-bold font-outfit uppercase tracking-widest text-sm">No Ledger Logs Found</div>
                <div class="text-gray-600 text-xs mt-1">Generate simulation data or record new dispatch inputs.</div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    list.innerHTML = filtered.map(c => {
        const stageIdx = STAGES.indexOf(c.status);
        const progress = (stageIdx / (STAGES.length - 1)) * 100;
        
        return `
            <div class="glass p-6 rounded-[30px] border-white/5 hover:border-primary/20 transition-all duration-300 hover:scale-[1.005] group animate-fade-in relative overflow-hidden">
                <!-- Gradient side accent based on priority -->
                <div class="absolute left-0 top-0 bottom-0 w-1.5 ${c.priority === 'Critical' ? 'bg-red-500 animate-pulse' : c.priority === 'High' ? 'bg-orange-500' : 'bg-primary'}"></div>
                
                <div class="flex flex-col lg:flex-row justify-between gap-6 pl-4">
                    <div class="flex-1">
                        <!-- Top Metadata Row -->
                        <div class="flex flex-wrap items-center gap-3 mb-4">
                            <span class="font-mono text-primary font-black text-xs tracking-wider">${c.id}</span>
                            <span class="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 font-mono">${c.date}</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded ${c.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : c.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-primary/20 text-primary border-primary/30'} border">${c.priority}</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30 uppercase tracking-tight flex items-center gap-1">
                                <i data-lucide="map-pin" class="w-2.5 h-2.5"></i> ${c.location}
                            </span>
                        </div>
                        
                        <!-- Core Complaint content -->
                        <h3 class="text-base md:text-lg font-bold mb-4 text-white group-hover:text-primary transition-colors leading-snug">"${c.text}"</h3>
                        
                        <!-- AI actions and Diagnostic reports -->
                        <div class="bg-black/30 p-3.5 rounded-xl border border-white/5 mb-4 max-w-3xl">
                            <div class="text-[8px] text-primary font-bold uppercase tracking-wider mb-1">AI Solution Pipeline</div>
                            <div class="text-xs text-gray-400 leading-normal italic font-medium">"${c.solution}"</div>
                        </div>

                        <!-- Info details row -->
                        <div class="flex flex-wrap items-center gap-6 text-xs text-gray-500 font-bold uppercase mt-2">
                            <span class="flex items-center gap-1.5"><i data-lucide="landmark" class="w-3.5 h-3.5 text-gray-400"></i> ${c.dept} Department</span>
                            <span class="flex items-center gap-1.5"><i data-lucide="hourglass" class="w-3.5 h-3.5 text-amber-500"></i> Action ETA: ${c.eta}</span>
                        </div>
                    </div>
                    
                    <!-- Right Actions Side Control -->
                    <div class="lg:w-60 flex flex-col justify-between items-stretch gap-6 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-6 min-h-[140px]">
                        <div class="flex justify-between items-start lg:block text-right">
                            <div class="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest mb-1">Current Lifecycle Node</div>
                            <div class="status-badge ${c.status === 'resolved' ? 'status-resolved' : c.status === 'repair' ? 'status-repair' : c.status === 'inspection' ? 'status-inspection' : c.status === 'assigned' ? 'status-assigned' : 'status-registered'} inline-block">
                                ${STAGE_LABELS[c.status]}
                            </div>
                        </div>
                        
                        <div class="flex gap-2">
                            <button onclick="advanceStage('${c.id}')" class="flex-1 py-3 bg-white/5 hover:bg-primary border border-white/5 hover:border-primary/20 hover:text-black rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all duration-300 flex items-center justify-center gap-1">
                                <span>Advance Lifecycle</span>
                                <i data-lucide="chevrons-right" class="w-3 h-3"></i>
                            </button>
                            <button onclick="deleteComplaint('${c.id}')" class="p-3 bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-500 rounded-xl transition-all duration-300 flex items-center justify-center">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function advanceStage(id) {
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return;
    
    const currentStatus = complaints[idx].status;
    const currentIdx = STAGES.indexOf(currentStatus);
    const nextIdx = (currentIdx + 1) % STAGES.length;
    
    complaints[idx].status = STAGES[nextIdx];
    
    // Auto-update action items to feel dynamic
    if (complaints[idx].status === 'resolved') {
        complaints[idx].solution = 'CIVIC AUDIT VERIFIED: Maintenance complete. Municipal team has sealed work logs and closed the ticket.';
    } else if (complaints[idx].status === 'repair') {
        complaints[idx].solution = 'REPAIR DISPATCH: Field repair squad has set up road safety cones and is working on immediate physical repair.';
    } else if (complaints[idx].status === 'inspection') {
        complaints[idx].solution = 'FIELD SURVEY: Local municipal inspector has arrived on scene, taken photo evidence, and initiated material procurement.';
    }
    
    saveData();
    updateDashboardUI();
    
    // Toast notification
    showNotification(id, `Advanced: ${STAGE_LABELS[STAGES[nextIdx]]}`);
}

function deleteComplaint(id) {
    if (confirm(`Acknowledge: Delete complaint record "${id}" from the municipal ledger?`)) {
        complaints = complaints.filter(c => c.id !== id);
        saveData();
        updateDashboardUI();
    }
}

// Department list filters
function filterAdminList(dept) {
    currentFilter = dept;
    
    // Update button styling
    const filters = ['All', 'Electricity', 'Roads', 'Sanitation', 'Water', 'General'];
    filters.forEach(f => {
        const btn = document.getElementById(`filter-${f}`);
        if (!btn) return;
        if (f === dept) {
            btn.className = "bg-primary text-black font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)]";
        } else {
            btn.className = "bg-white/5 text-gray-400 font-bold text-xs uppercase px-4 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/5";
        }
    });
    
    renderAdminList();
}

// Seed interactive prototype records
function seedMockData() {
    complaints = [...INITIAL_SEED_DATA];
    saveData();
    updateDashboardUI();
    alert("Prototype ledgers loaded with simulation complaints.");
}

// --- System Utils ---
function saveData() {
    localStorage.setItem('vb_database_v3', JSON.stringify(complaints));
}

function resetSystem() {
    if (confirm('Verify: Purge all digital records from the local storage cache?')) {
        complaints = [];
        saveData();
        updateDashboardUI();
    }
}

function showNotification(id, msg = "Digital Dispatch Success") {
    const notify = document.getElementById('notification');
    const notifyMsg = document.getElementById('notify-msg');
    const notifyId = document.getElementById('notify-id');
    
    notifyMsg.innerText = msg;
    notifyId.innerText = `NODE ID: ${id}`;
    
    notify.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
    notify.classList.add('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
        notify.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
        notify.classList.remove('opacity-100', 'translate-y-0');
    }, 4500);
}
