import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Search, ShieldCheck, CheckCircle2, User, Eye, Wrench, 
  Award, ChevronRight, BarChart2, Plus, Info, Landmark, 
  AlertTriangle, Clock, MapPin, Trash2, Key, HelpCircle,
  Keyboard, Camera, RotateCcw, Volume2, Map, Sparkles
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from './services/api';

// --- Constants & Preseeded Data ---
const STAGES = [
  { id: 'registered', label: 'Registered', icon: CheckCircle2, color: '#38bdf8' },
  { id: 'assigned', label: 'Assigned', icon: User, color: '#a855f7' },
  { id: 'inspection', label: 'Inspection', icon: Eye, color: '#f59e0b' },
  { id: 'repair', label: 'Repairing', icon: Wrench, color: '#ec4899' },
  { id: 'resolved', label: 'Resolved', icon: Award, color: '#39FF14' },
];

const INITIAL_SEED_DATA = [
  {
    _id: 'vb-mock-1',
    trackingId: 'VB-4318',
    complaintText: 'Electricity pole transformer sparking and blinking near Delhi Gate block C.',
    department: 'Electricity',
    status: 'inspection',
    priority: 'Critical',
    solution: 'Emergency transformer inspection, fuse replacement, and insulator realignment.',
    eta: '4 Hours',
    location: 'Delhi Gate Block C',
    lat: 28.6139,
    lng: 77.2090,
    address: 'Delhi Gate Block C, Daryaganj, New Delhi, Delhi 110002',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'vb-mock-2',
    trackingId: 'VB-9102',
    complaintText: 'Huge potholes on Noida Sector 15 road causing traffic jams and bike slippage.',
    department: 'Roads',
    status: 'repair',
    priority: 'High',
    solution: 'Pothole asphalt filling, leveling with compact roller, and surface re-seal.',
    eta: '48 Hours',
    location: 'Noida Sector 15 Road',
    lat: 28.5835,
    lng: 77.3150,
    address: 'Sector 15, Noida, Uttar Pradesh 201301',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    _id: 'vb-mock-3',
    trackingId: 'VB-5047',
    complaintText: 'Sanitation vehicle has not visited Sector 62 for 3 days, garbage overflow is causing stench.',
    department: 'Sanitation',
    status: 'assigned',
    priority: 'Medium',
    solution: 'Immediate dispatch of municipal sanitation garbage compactor and site cleaning team.',
    eta: '12 Hours',
    location: 'Sector 62',
    lat: 28.6219,
    lng: 77.3712,
    address: 'Sector 62, Noida, Uttar Pradesh 201309',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: 'vb-mock-4',
    trackingId: 'VB-1284',
    complaintText: 'Underground pipeline burst and drinking water leakage in Nehru Place near Metro Station.',
    department: 'Water',
    status: 'registered',
    priority: 'Medium',
    solution: 'Hydro-excavation to locate pipeline rupture, pipe replacement, and pressure valve sealing.',
    eta: '24 Hours',
    location: 'Nehru Place near Metro Station',
    lat: 28.5494,
    lng: 77.2515,
    address: 'Nehru Place Metro Station, Outer Ring Rd, Nehru Place, New Delhi, Delhi 110019',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    _id: 'vb-mock-5',
    trackingId: 'VB-7729',
    complaintText: 'Street light not working near market area behind block 4, very dark at night.',
    department: 'Electricity',
    status: 'resolved',
    priority: 'Low',
    solution: 'Replacement of blown bulb with 120W LED module and photo-sensor calibration.',
    eta: '24 Hours',
    location: 'Karol Bagh Block 4',
    lat: 28.6444,
    lng: 77.1900,
    address: 'Block 4, Karol Bagh, New Delhi, Delhi 110005',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    _id: 'vb-mock-6',
    trackingId: 'VB-3301',
    complaintText: 'Sanitation pile is rotting in the middle of Connaught Place Outer Ring Road near block N.',
    department: 'Sanitation',
    status: 'registered',
    priority: 'Medium',
    solution: 'Cleanup order routed to central municipal waste clearing service compactor crew.',
    eta: '12 Hours',
    location: 'Connaught Place block N',
    lat: 28.6304,
    lng: 77.2177,
    address: 'Block N, Connaught Place, New Delhi, Delhi 110001',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'vb-mock-7',
    trackingId: 'VB-6218',
    complaintText: 'Water pipeline leakage is flooding the road outside Saket Block J community center.',
    department: 'Water',
    status: 'inspection',
    priority: 'High',
    solution: 'Plumbing response squad sent to close primary sub-valves and weld reinforcement sleeve.',
    eta: '12 Hours',
    location: 'Saket Block J',
    lat: 28.5244,
    lng: 77.2066,
    address: 'Block J, Saket, New Delhi, Delhi 110017',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: 'vb-mock-8',
    trackingId: 'VB-2093',
    complaintText: 'Dangerous asphalt potholes forming on Dwarka Sector 10 Road near the sports complex.',
    department: 'Roads',
    status: 'repair',
    priority: 'Critical',
    solution: 'Urgent thermal aggregates patching to resolve safety hazards for commuters.',
    eta: '8 Hours',
    location: 'Dwarka Sector 10',
    lat: 28.5794,
    lng: 77.0600,
    address: 'Sector 10, Dwarka, New Delhi, Delhi 110075',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'vb-mock-9',
    trackingId: 'VB-8821',
    complaintText: 'Whole street light pole has collapsed after storm on Indiranagar double road.',
    department: 'Electricity',
    status: 'assigned',
    priority: 'High',
    solution: 'Field engineer squad dispatched to isolate live wire cables and raise a new lighting pole structure.',
    eta: '24 Hours',
    location: 'Indiranagar Double Road',
    lat: 28.6012,
    lng: 77.1500,
    address: 'Double Road, Indiranagar, New Delhi, Delhi 110008',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    _id: 'vb-mock-10',
    trackingId: 'VB-1052',
    complaintText: 'Major cracks on the flyover expansion joint at Rajouri Garden Main Chowk.',
    department: 'Roads',
    status: 'inspection',
    priority: 'Critical',
    solution: 'Emergency structural audit initiated. Road cones placed for joint expansion repair.',
    eta: '48 Hours',
    location: 'Rajouri Garden Chowk',
    lat: 28.6415,
    lng: 77.1200,
    address: 'Rajouri Garden Main Chowk, New Delhi, Delhi 110027',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    _id: 'vb-mock-11',
    trackingId: 'VB-7164',
    complaintText: 'Drinking water is coming brownish and highly contaminated in Mayur Vihar Phase 1.',
    department: 'Water',
    status: 'assigned',
    priority: 'High',
    solution: 'Audit water purification lines and flush distribution pipeline blocks for contaminant removal.',
    eta: '24 Hours',
    location: 'Mayur Vihar Phase 1',
    lat: 28.6044,
    lng: 77.2915,
    address: 'Phase 1, Mayur Vihar, New Delhi, Delhi 110091',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    _id: 'vb-mock-12',
    trackingId: 'VB-4521',
    complaintText: 'Laxmi Nagar metro station street has heaps of plastic bags and general garbage pile.',
    department: 'Sanitation',
    status: 'resolved',
    priority: 'Low',
    solution: 'Sanitation clearing dump truck completed local debris lift and disinfected the node.',
    eta: '24 Hours',
    location: 'Laxmi Nagar Metro Station',
    lat: 28.6300,
    lng: 77.2780,
    address: 'Laxmi Nagar Metro Station, Vikas Marg, Laxmi Nagar, New Delhi, Delhi 110092',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString()
  },
  {
    _id: 'vb-mock-13',
    trackingId: 'VB-6612',
    complaintText: 'Severe mosquito breeding from open drainage water stagnation behind Okhla Block D.',
    department: 'Sanitation',
    status: 'assigned',
    priority: 'Medium',
    solution: 'Anti-larval chemical spray and fogging operations ordered across stagnant water drains.',
    eta: '12 Hours',
    location: 'Okhla Industrial Area Block D',
    lat: 28.5360,
    lng: 77.2715,
    address: 'Okhla Industrial Estate Phase 3, Okhla, New Delhi, Delhi 110020',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'vb-mock-14',
    trackingId: 'VB-3310',
    complaintText: 'Complete blackout of electric grids in Sector 18 commercial market since afternoon.',
    department: 'Electricity',
    status: 'repair',
    priority: 'High',
    solution: 'Grid switchgear replacement and main substation transformer reset.',
    eta: '6 Hours',
    location: 'Noida Sector 18 Market',
    lat: 28.5708,
    lng: 77.3260,
    address: 'Sector 18, Noida, Uttar Pradesh 201301',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: 'vb-mock-15',
    trackingId: 'VB-9921',
    complaintText: 'Broken foothpaths and side pavement blocks causing accidents in Indirapuram block A.',
    department: 'Roads',
    status: 'registered',
    priority: 'Low',
    solution: 'Repair and realignment of concrete side blocks scheduled for pavement safety.',
    eta: '72 Hours',
    location: 'Indirapuram Block A',
    lat: 28.6366,
    lng: 77.3730,
    address: 'Block A, Indirapuram, Ghaziabad, Uttar Pradesh 201014',
    language: 'en-IN',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

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
    analysis.solution = 'Engineering dispatch ordered: thermal aggregate asphalt mixture and rapid compactor rollout planned.';
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

// --- Components ---

const WorkflowBar = ({ currentStage }) => {
  const activeIndex = STAGES.findIndex(s => s.id === currentStage);
  const displayIndex = activeIndex === -1 ? 0 : activeIndex;
  
  return (
    <div className="flex justify-between items-center w-full relative py-6">
      {/* Background Connecting Line */}
      <div className="absolute top-[28px] left-8 right-8 h-[2px] bg-white/5 -translate-y-1/2">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 shadow-[0_0_10px_#39FF14]" 
          style={{ width: `${(displayIndex / (STAGES.length - 1)) * 100}%` }} 
        />
      </div>
      
      {STAGES.map((s, i) => {
        const Icon = s.icon;
        const isCompleted = i < displayIndex;
        const isActive = i === displayIndex;
        
        return (
          <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <motion.div 
              animate={isActive ? { scale: [1, 1.1, 1], boxShadow: '0 0 15px rgba(0, 255, 255, 0.6)' } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                isCompleted 
                  ? 'bg-primary border-primary text-black' 
                  : isActive 
                    ? 'bg-secondary border-secondary text-black' 
                    : 'bg-dark-base border-white/10 text-gray-500'
              }`}
            >
              <Icon size={16} />
            </motion.div>
            <span 
              className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-center max-w-[80px] ${
                isCompleted 
                  ? 'text-primary' 
                  : isActive 
                    ? 'text-secondary font-black' 
                    : 'text-gray-600'
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchId, setSearchId] = useState('');
  const [tracked, setTracked] = useState(null);
  
  // Local Database and Fallback Mode indicators
  const [complaints, setComplaints] = useState([]);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  // Admin Login and Filter States
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Advanced PS-A02 States
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [isManualTextMode, setIsManualTextMode] = useState(false);
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const recognitionRef = useRef(null);
  const simulationTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  // Initialize Geolocation on Mount & auto-select language
  useEffect(() => {
    // 1. Detect and set browser language
    const sysLang = navigator.language || 'en-IN';
    let matched = 'en-IN';
    if (sysLang.startsWith('hi')) matched = 'hi-IN';
    else if (sysLang.startsWith('ta')) matched = 'ta-IN';
    else if (sysLang.startsWith('te')) matched = 'te-IN';
    else if (sysLang.startsWith('bn')) matched = 'bn-IN';
    else if (sysLang.startsWith('mr')) matched = 'mr-IN';
    setSelectedLanguage(matched);

    // 2. Capture physical location
    captureLocation();

    // 3. Setup speech recognition
    const sr = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (sr) {
      recognitionRef.current = new sr();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = matched;
      
      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join('');
        setTranscript(text);
      };
      recognitionRef.current.onerror = (err) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
        if (err.error === 'not-allowed') {
          toast.error("Microphone access blocked. Auto-toggling Keyboard Fallback mode.", { duration: 5000 });
          setIsManualTextMode(true);
        } else if (err.error === 'audio-capture') {
          toast.error("No microphone hardware found.", { duration: 5000 });
        } else if (err.error === 'no-speech') {
          toast.info("No speech detected. Speak clearly into the microphone.", { duration: 3000 });
        } else {
          toast.error(`Speech recognition error: ${err.error}`, { duration: 4000 });
        }
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }

    // 4. Load Initial Complaints database (LocalStorage or API)
    loadDatabase();

    // 5. Detect and notify Secure Context (Web Speech API restriction)
    if (!window.isSecureContext) {
      toast.warning(
        "Secure Context Required: Browser security restricts microphone recording to HTTPS or localhost. Preset simulations and keyboard entry are fully enabled for testing.",
        { duration: 10000 }
      );
    }
  }, []);

  // Geolocation & Reverse Geocoding via Nominatim
  const captureLocation = (customLat = null, customLng = null) => {
    setIsLocating(true);
    if (customLat !== null && customLng !== null) {
      setLat(customLat);
      setLng(customLng);
      fetchAddress(customLat, customLng);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude);
          setLng(longitude);
          fetchAddress(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation permission denied, using mock coordinates near Delhi Gate.");
          const mockLat = 28.6139 + (Math.random() - 0.5) * 0.05;
          const mockLng = 77.2090 + (Math.random() - 0.5) * 0.05;
          setLat(mockLat);
          setLng(mockLng);
          fetchAddress(mockLat, mockLng);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      console.warn("Geolocation not supported by browser.");
      fetchAddress(28.6139, 77.2090);
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      if (response.ok) {
        const data = await response.json();
        setAddress(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } else {
        setAddress(`Municipal Area, Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      setAddress(`Municipal Area, Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
    toast.info(`Language set to ${lang === 'hi-IN' ? 'Hindi' : lang === 'ta-IN' ? 'Tamil' : lang === 'te-IN' ? 'Telugu' : lang === 'bn-IN' ? 'Bengali' : lang === 'mr-IN' ? 'Marathi' : 'English'}`);
  };

  const loadDatabase = async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data);
      setIsFallbackMode(false);
    } catch (err) {
      console.warn("API server down. Falling back to LocalStorage system.", err);
      setIsFallbackMode(true);
      
      let localDB = localStorage.getItem('vb_react_database');
      if (!localDB) {
        localStorage.setItem('vb_react_database', JSON.stringify(INITIAL_SEED_DATA));
        setComplaints(INITIAL_SEED_DATA);
      } else {
        setComplaints(JSON.parse(localDB));
      }
    }
  };

  // Text-To-Speech Speech Synthesis Confirmation for Low Literacy Accessibility
  const speakText = (text, lang = 'en-IN') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const announceSubmission = (trackingId, dept, lang = 'en-IN') => {
    let msg = `Complaint registered successfully. Tracking ID is ${trackingId.split('').join(' ')}. Department assigned is ${dept}.`;
    if (lang.startsWith('hi')) {
      msg = `शिकायत सफलतापूर्वक दर्ज कर ली गई है। आपका ट्रैकिंग नंबर है ${trackingId.split('').join(' ')}। और इसे ${dept === 'Electricity' ? 'बिजली विभाग' : dept === 'Water' ? 'जल विभाग' : dept === 'Sanitation' ? 'सफाई विभाग' : dept === 'Roads' ? 'सड़क विभाग' : 'सामान्य विभाग'} को सौंप दिया गया है।`;
    } else if (lang.startsWith('ta')) {
      msg = `புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. உங்கள் கண்காணிப்பு எண் ${trackingId.split('').join(' ')}.`;
    } else if (lang.startsWith('te')) {
      msg = `ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది. మీ ట్రాకింగ్ ఐడి ${trackingId.split('').join(' ')}.`;
    } else if (lang.startsWith('bn')) {
      msg = `অভিযোগ সফলভাবে নথিভুক্ত করা হয়েছে। আপনার ট্র্যাকিং নম্বর হলো ${trackingId.split('').join(' ')}.`;
    } else if (lang.startsWith('mr')) {
      msg = `तक्रार यशस्वीरित्या नोंदवली गेली आहे. तुमचा ट्रॅकिंग आयडी ${trackingId.split('').join(' ')} आहे.`;
    }
    speakText(msg, lang);
  };

  const handleMic = () => {
    if (!window.isSecureContext) {
      toast.error("Microphone access blocked on insecure HTTP. Please use the simulated preset buttons or toggle manual keyboard mode!");
      setIsManualTextMode(true);
      return;
    }

    if (!recognitionRef.current) {
      toast.error('Voice Recognition is not supported on this browser. Try Simulation Triggers!');
      return;
    }
    
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
        setIsRecording(false);
      }
    }
  };

  // Mock voice input typist simulation
  const handleSimulate = (phrase, presetLat = null, presetLng = null) => {
    if (isRecording) {
      recognitionRef.current.stop();
    }
    
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);
    
    setTranscript('');
    setIsRecording(true);

    if (presetLat && presetLng) {
      captureLocation(presetLat, presetLng);
    } else {
      const mockLat = 28.6139 + (Math.random() - 0.5) * 0.05;
      const mockLng = 77.2090 + (Math.random() - 0.5) * 0.05;
      captureLocation(mockLat, mockLng);
    }
    
    let index = 0;
    const type = () => {
      if (index < phrase.length) {
        setTranscript(prev => prev + phrase.charAt(index));
        index++;
        simulationTimeoutRef.current = setTimeout(type, 10 + Math.random() * 15);
      } else {
        setIsRecording(false);
      }
    };
    type();
  };

  // Submit Complaint Handler
  const handleSumbit = async () => {
    if (!transcript || transcript.startsWith('"Click')) return;
    const analysis = ANALYZE_COMPLAINT(transcript);
    const trackingId = `VB-${Math.floor(Math.random() * 9000) + 1000}`;
    
    const payload = {
      complaintText: transcript,
      department: analysis.dept,
      priority: analysis.priority,
      solution: analysis.solution,
      eta: analysis.eta,
      location: address || analysis.location,
      lat: lat,
      lng: lng,
      address: address || analysis.location,
      photo: photo,
      language: selectedLanguage,
      status: 'registered'
    };

    if (!isFallbackMode) {
      try {
        const { data } = await api.post('/complaints', payload);
        toast.success(`Diagnostic filed successfully! ID: ${data.trackingId}`);
        setTranscript('');
        setPhoto('');
        loadDatabase();
        setSearchId(data.trackingId); // Prefill track field
        announceSubmission(data.trackingId, data.department, selectedLanguage);
      } catch (err) {
        console.error("API submission failed, caching to LocalStorage instead.", err);
        saveToLocalFallback(payload, trackingId);
      }
    } else {
      saveToLocalFallback(payload, trackingId);
    }
  };

  const saveToLocalFallback = (payload, trackingId) => {
    const newRecord = {
      _id: `vb-local-${Date.now()}`,
      trackingId,
      ...payload,
      createdAt: new Date().toISOString()
    };
    
    const updated = [newRecord, ...complaints];
    localStorage.setItem('vb_react_database', JSON.stringify(updated));
    setComplaints(updated);
    toast.success(`[Local DB] Diagnostic Filed! ID: ${trackingId}`);
    setTranscript('');
    setPhoto('');
    setSearchId(trackingId); // Prefill search tracking field
    announceSubmission(trackingId, payload.department, selectedLanguage);
  };

  // Search Complaint Status
  const handleSearch = async () => {
    if (!searchId) {
      toast.error("Please enter a Reference ID");
      return;
    }
    
    const idClean = searchId.trim().toUpperCase();

    if (!isFallbackMode) {
      try {
        const { data } = await api.get(`/complaints/${idClean}`);
        setTracked(data);
      } catch (err) {
        console.warn("API fetch error, searching locally.", err);
        searchLocalDB(idClean);
      }
    } else {
      searchLocalDB(idClean);
    }
  };

  const searchLocalDB = (id) => {
    const found = complaints.find(c => c.trackingId === id);
    if (found) {
      setTracked(found);
    } else {
      toast.error('Invalid ID: Record not found in civic ledger');
      setTracked(null);
    }
  };

  // Advance stage in the workflow
  const updateStage = async (id, currentStatus) => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStatus);
    if (currentIndex === -1) return;
    const nextStatus = STAGES[(currentIndex + 1) % STAGES.length].id;
    
    let solutionUpdate = '';
    if (nextStatus === 'resolved') {
      solutionUpdate = 'CIVIC AUDIT VERIFIED: Maintenance complete. Municipal team has sealed work logs and closed the ticket.';
    } else if (nextStatus === 'repair') {
      solutionUpdate = 'REPAIR DISPATCH: Field repair squad has set up road safety cones and is working on immediate physical repair.';
    } else if (nextStatus === 'inspection') {
      solutionUpdate = 'FIELD SURVEY: Local municipal inspector has arrived on scene, taken photo evidence, and initiated material procurement.';
    }

    if (!isFallbackMode && !id.startsWith('vb-local-')) {
      try {
        await api.patch(`/complaints/${id}/status`, { status: nextStatus });
        toast.success(`Advanced: status set to ${nextStatus.toUpperCase()}`);
        loadDatabase();
      } catch (err) {
        console.error("API update stage failed. Applying local fallback.", err);
        updateLocalStage(id, nextStatus, solutionUpdate);
      }
    } else {
      updateLocalStage(id, nextStatus, solutionUpdate);
    }
  };

  const updateLocalStage = (id, nextStatus, solutionUpdate) => {
    const updated = complaints.map(c => {
      if (c._id === id) {
        return { 
          ...c, 
          status: nextStatus,
          solution: solutionUpdate || c.solution
        };
      }
      return c;
    });
    localStorage.setItem('vb_react_database', JSON.stringify(updated));
    setComplaints(updated);
    toast.success(`[Local DB] Advanced: status set to ${nextStatus.toUpperCase()}`);
  };

  // Delete complaint record
  const deleteRecord = (id) => {
    if (!window.confirm("Verify: Purge complaint record from ledger?")) return;

    if (!isFallbackMode && !id.startsWith('vb-local-')) {
      api.delete(`/complaints/${id}`)
        .then(() => {
          toast.success("Ledger record purged successfully");
          loadDatabase();
        })
        .catch(err => {
          console.error("API delete failed, removing locally", err);
          deleteLocalRecord(id);
        });
    } else {
      deleteLocalRecord(id);
    }
  };

  const deleteLocalRecord = (id) => {
    const updated = complaints.filter(c => c._id !== id);
    localStorage.setItem('vb_react_database', JSON.stringify(updated));
    setComplaints(updated);
    toast.success("Ledger record purged locally");
  };

  // Reset or Seed mock system database
  const resetDatabase = () => {
    if (!window.confirm("Verify: Flush database ledger?")) return;
    localStorage.setItem('vb_react_database', JSON.stringify([]));
    setComplaints([]);
    toast.success("Civic Ledger Purged");
  };

  const seedMockLedger = () => {
    localStorage.setItem('vb_react_database', JSON.stringify(INITIAL_SEED_DATA));
    setComplaints(INITIAL_SEED_DATA);
    toast.success("Mock Ledgers Seeded successfully");
  };

  // Admin passcode verification
  const handleAdminUnlock = async (e) => {
    e.preventDefault();
    if (passcode === 'admin' || passcode === 'admin123') {
      if (!isFallbackMode) {
        try {
          const res = await api.post('/auth/login', { username: 'admin', password: 'admin123' });
          localStorage.setItem('vb_token', res.data.token);
          setIsAdminUnlocked(true);
          toast.success("Authenticated via Secure Backend. Operation Deck Active.");
          loadDatabase();
        } catch (err) {
          console.warn("Backend login failed. Attempting auto-registration...", err);
          try {
            const regRes = await api.post('/auth/register', { username: 'admin', password: 'admin123' });
            localStorage.setItem('vb_token', regRes.data.token);
            setIsAdminUnlocked(true);
            toast.success("Backend Admin Registered and Authenticated!");
            loadDatabase();
          } catch (regErr) {
            console.error("Backend auth failed completely, unlocking in local mode.", regErr);
            setIsAdminUnlocked(true);
            toast.success("Authenticated in Local Prototype Mode.");
          }
        }
      } else {
        setIsAdminUnlocked(true);
        toast.success("Access Granted. Operation Deck Active (Local Mode).");
      }
    } else {
      toast.error("Incorrect node passkey. Access Denied.");
    }
  };

  // Leaflet Map Initialization and Update Loop
  useEffect(() => {
    if (activeTab !== 'admin' || !isAdminUnlocked) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const container = document.getElementById('admin-map');
      if (!container) return;

      const filteredForMap = complaints.filter(c => {
        const matchDept = filterDept === 'All' || c.department === filterDept;
        const matchPriority = filterPriority === 'All' || c.priority === filterPriority;
        return matchDept && matchPriority;
      });

      const centerLat = 28.6139;
      const centerLng = 77.2090;

      if (!mapRef.current) {
        mapRef.current = L.map('admin-map', {
          zoomControl: true,
          scrollWheelZoom: false
        }).setView([centerLat, centerLng], 10);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(mapRef.current);
      }

      mapRef.current.eachLayer((layer) => {
        if (layer.options && (layer.options.pane === 'markerPane' || layer.options.pane === 'overlayPane' || layer.options.radius)) {
          mapRef.current.removeLayer(layer);
        }
      });

      if (showHeatmap) {
        const heatPoints = filteredForMap.map(c => {
          const latVal = c.lat || 28.6139;
          const lngVal = c.lng || 77.2090;
          const intensity = c.priority === 'Critical' ? 1.0 : c.priority === 'High' ? 0.7 : c.priority === 'Medium' ? 0.4 : 0.2;
          return [latVal, lngVal, intensity];
        });

        if (heatPoints.length > 0) {
          L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: '#38bdf8', 0.65: '#f59e0b', 1: '#ef4444' }
          }).addTo(mapRef.current);
        }
      } else {
        filteredForMap.forEach(c => {
          const latVal = c.lat || 28.6139;
          const lngVal = c.lng || 77.2090;
          
          const color = c.department === 'Electricity' ? '#39FF14' 
                      : c.department === 'Roads' ? '#00FFFF' 
                      : c.department === 'Water' ? '#38bdf8' 
                      : c.department === 'Sanitation' ? '#a855f7' 
                      : '#ec4899';
          
          const customIcon = L.divIcon({
            html: `<div class="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-pulse" style="background-color: ${color}; box-shadow: 0 0 12px ${color}">
                     <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                   </div>`,
            className: 'custom-leaflet-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const popupContent = `
            <div class="text-black font-sans p-2 max-w-xs leading-normal">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="bg-gray-100 text-gray-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-gray-200">${c.trackingId}</span>
                <span class="text-[10px] uppercase font-bold text-gray-600">${c.department}</span>
              </div>
              <p class="text-xs font-bold text-gray-800 mb-1.5">"${c.complaintText.substring(0, 80)}${c.complaintText.length > 80 ? '...' : ''}"</p>
              <div class="text-[9px] text-gray-500 font-semibold mb-1">${c.address || c.location || 'NCR Municipal Area'}</div>
              <div class="text-[9px] font-bold text-red-600 uppercase">Priority: ${c.priority} // Status: ${c.status}</div>
            </div>
          `;

          L.marker([latVal, lngVal], { icon: customIcon })
            .bindPopup(popupContent, { closeButton: false })
            .addTo(mapRef.current);
        });
      }

      if (filteredForMap.length > 0) {
        const bounds = L.latLngBounds(filteredForMap.map(c => [c.lat || centerLat, c.lng || centerLng]));
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
      
      mapRef.current.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [activeTab, isAdminUnlocked, complaints, showHeatmap, filterDept, filterPriority]);

  // --- Recharts Chart Processing ---
  const getDeptChartData = () => {
    const depts = ['Electricity', 'Roads', 'Sanitation', 'Water', 'General'];
    return depts.map(d => ({
      name: d,
      Dispatches: complaints.filter(c => c.department === d).length
    }));
  };

  const getStatusChartData = () => {
    return STAGES.map(s => ({
      name: s.label,
      value: complaints.filter(c => c.status === s.id).length
    })).filter(item => item.value > 0);
  };

  // Counting dynamic stats
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status !== 'resolved').length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    const matchDept = filterDept === 'All' || c.department === filterDept;
    const matchPriority = filterPriority === 'All' || c.priority === filterPriority;
    return matchDept && matchPriority;
  });

  const CHART_COLORS = ['#38bdf8', '#a855f7', '#f59e0b', '#ec4899', '#39FF14'];

  return (
    <div className="min-h-screen bg-dark-base text-gray-200 font-outfit selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0F131A', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' } }} />
      
      {/* Dynamic Glow and Grid Overlays */}
      <div className="fixed inset-0 bg-grid -z-20 opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center glass m-4 rounded-2xl border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(57,255,20,0.3)]">VB</div>
          <div>
            <span className="font-bold text-xl tracking-tighter leading-none block">VOICEBRIDGE</span>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Digital Governance Node</span>
          </div>
        </div>
        
        <div className="flex gap-2 bg-black/30 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'home' ? 'bg-primary text-black shadow-md' : 'hover:bg-white/5'}`}
          >
            Home Node
          </button>
          <button 
            onClick={() => setActiveTab('admin')} 
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-primary text-black shadow-md' : 'hover:bg-white/5'}`}
          >
            Admin Deck
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-32 px-4 max-w-6xl mx-auto pb-32">
        {/* Connection Fallback Pill */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${
            isFallbackMode 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isFallbackMode ? 'bg-amber-400' : 'bg-primary animate-ping'}`}></span>
            {isFallbackMode ? 'LocalStorage (Isolated Node)' : 'Live MongoDB Sync Active'}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-16"
            >
              {/* Hero Recording Interface */}
              <section className="text-center">
                <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-none italic font-outfit">
                  SPEAK YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic font-black">CIVIC PORT.</span>
                </h1>
                <p className="text-gray-500 text-base md:text-lg mb-12 max-w-2xl mx-auto font-medium">
                  AI-driven dispatch for smart urban infrastructure. Say your complaint and watch AI parse & assign in real time.
                </p>
                
                {/* Visual Glassmorphism Recording Card */}
                <div className="glass p-6 md:p-10 rounded-[35px] border-white/5 max-w-3xl mx-auto shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-6 right-10 flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-gray-700'}`} />
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{isRecording ? 'Listening' : 'Neural Standby'}</span>
                  </div>

                  {/* Language Selector Dropdown */}
                  <div className="flex flex-col items-center justify-center gap-2 mb-6">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Input Language</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all cursor-pointer"
                    >
                      <option value="en-IN">🇮🇳 English (Indian)</option>
                      <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
                      <option value="ta-IN">🇮🇳 Tamil (தமிழ்)</option>
                      <option value="te-IN">🇮🇳 Telugu (తెలుగు)</option>
                      <option value="bn-IN">🇮🇳 Bengali (বাংলা)</option>
                      <option value="mr-IN">🇮🇳 Marathi (मराठी)</option>
                    </select>
                  </div>

                  {/* Microphone Action Button & Text Input Toggler */}
                  <div className="flex items-center justify-center gap-4 mb-6 max-w-xs mx-auto">
                    <button 
                      type="button"
                      onClick={() => setIsManualTextMode(!isManualTextMode)}
                      className={`p-4 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        isManualTextMode 
                          ? 'bg-primary border-primary text-black' 
                          : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                      title="Toggle Text Input Fallback"
                    >
                      <Keyboard size={24} />
                    </button>

                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMic}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isRecording 
                          ? 'bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.4)]' 
                          : 'bg-primary shadow-[0_0_40px_rgba(57,255,20,0.2)]'
                      }`}
                    >
                      <Mic className={isRecording ? 'text-white animate-pulse' : 'text-black'} size={40} />
                    </motion.button>
                  </div>

                  {/* Framer-Motion Wave Visualizer */}
                  <div className="h-10 flex justify-center items-center gap-1.5 mb-6">
                    {isRecording ? (
                      [...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 38, 8] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.2, 
                            delay: i * 0.15,
                            ease: "easeInOut"
                          }}
                          className="w-[4px] rounded-full bg-gradient-to-t from-primary to-secondary"
                        />
                      ))
                    ) : (
                      <div className="text-xs font-mono text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <Info size={12} /> {isManualTextMode ? "Type Below or Click presets" : "Click Microphone or Keyboard fallback"}
                      </div>
                    )}
                  </div>

                  {/* Real-time Location Info Pill */}
                  {address && (
                    <div className="mb-6 text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1.5 uppercase bg-white/5 border border-white/5 px-4 py-2 rounded-xl max-w-md mx-auto tracking-wider">
                      {isLocating ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                      ) : (
                        <MapPin size={10} className="text-red-400 animate-bounce" />
                      )}
                      <span>{isLocating ? 'Resolving Geolocation...' : `Location: ${address}`}</span>
                    </div>
                  )}

                  {/* Photo Attachment Section */}
                  <div className="flex flex-col items-center justify-center mb-6 gap-3">
                    <input 
                      type="file" 
                      id="photo-capture" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhoto(reader.result);
                            toast.success("Civic photo attached successfully!");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    
                    {photo ? (
                      <div className="relative w-full max-w-[200px] rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                        <img src={photo} alt="Civic Issue" className="w-full h-32 object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhoto('')}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 p-1.5 rounded-full text-white transition-all cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <label 
                        htmlFor="photo-capture" 
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-bold cursor-pointer uppercase tracking-wider"
                      >
                        <Camera size={14} className="text-secondary animate-pulse" />
                        Attach Issue Snapshot
                      </label>
                    )}
                  </div>

                  {/* Editable or Real-time transcript box */}
                  <div className="bg-black/30 rounded-2xl p-6 min-h-[140px] border border-white/5 mb-8 text-left relative overflow-hidden">
                    <div className="absolute top-2 left-4 text-[9px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-2">
                      <span>{isManualTextMode ? 'Manual Input Mode' : 'Real-time Stream Parser'}</span>
                    </div>
                    {isManualTextMode ? (
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Type your municipal complaint here... (e.g. Street light not working on Nehru road...)"
                        className="w-full min-h-[90px] pt-4 bg-transparent border-none outline-none text-gray-200 placeholder-gray-600 text-base md:text-lg resize-none leading-relaxed font-medium"
                      />
                    ) : (
                      <p className={`text-base md:text-lg leading-relaxed pt-4 ${transcript ? 'text-gray-200' : 'text-gray-500 italic opacity-50'}`}>
                        {transcript || '"Electricity pole sparking near Delhi Gate market..."'}
                      </p>
                    )}
                  </div>

                  {/* Dispatch Submission Button */}
                  <button 
                    disabled={!transcript || isRecording}
                    onClick={handleSumbit}
                    className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${
                      !transcript || isRecording 
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
                        : 'bg-white text-black hover:bg-primary shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-[1.01] active:scale-95 cursor-pointer border border-primary/20'
                    }`}
                  >
                    Initialize AI Diagnostic Dispatch
                  </button>
                </div>
              </section>

              {/* Simulation triggers grid */}
              <section className="max-w-3xl mx-auto">
                <h3 className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Interactive Simulation Presets (Quick Test)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleSimulate("Street light not working near Delhi Gate market area", 28.6139, 77.2090)}
                    className="flex items-center gap-3 bg-white/5 border border-white/5 hover:border-primary/20 p-4 rounded-xl text-left transition-all hover:translate-y-[-2px] group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-105 transition-all"><Clock size={16} /></div>
                    <span className="font-semibold text-xs text-gray-300">Delhi Gate Luminaire failure</span>
                  </button>
                  <button 
                    onClick={() => handleSimulate("Huge potholes on Noida Sector 15 road causing traffic jam", 28.5835, 77.3150)}
                    className="flex items-center gap-3 bg-white/5 border border-white/5 hover:border-primary/20 p-4 rounded-xl text-left transition-all hover:translate-y-[-2px] group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-105 transition-all"><AlertTriangle size={16} /></div>
                    <span className="font-semibold text-xs text-gray-300">Noida Sec-15 Road Crater</span>
                  </button>
                  <button 
                    onClick={() => handleSimulate("Garbage collection vehicle has not visited Sector 62 for 3 days", 28.6219, 77.3712)}
                    className="flex items-center gap-3 bg-white/5 border border-white/5 hover:border-primary/20 p-4 rounded-xl text-left transition-all hover:translate-y-[-2px] group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-105 transition-all"><Trash2 size={16} /></div>
                    <span className="font-semibold text-xs text-gray-300">Sanitation pile Sector 62</span>
                  </button>
                  <button 
                    onClick={() => handleSimulate("Underground pipeline burst and drinking water leakage in Nehru Place", 28.5494, 77.2515)}
                    className="flex items-center gap-3 bg-white/5 border border-white/5 hover:border-primary/20 p-4 rounded-xl text-left transition-all hover:translate-y-[-2px] group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-all"><Mic size={16} /></div>
                    <span className="font-semibold text-xs text-gray-300">Water Pipe burst Nehru Place</span>
                  </button>
                </div>
              </section>

              {/* Civic Reference Verification Portal */}
              <section className="glass rounded-[35px] p-6 md:p-10 border-white/5 shadow-xl max-w-3xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-[80px]" />
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3"><Search className="text-primary" /> Dynamic Reference Tracker</h2>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <input 
                    type="text" 
                    placeholder="Enter Reference ID (e.g. VB-4318)" 
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 text-base font-mono uppercase tracking-wider font-bold" 
                    value={searchId} 
                    onChange={e => setSearchId(e.target.value.toUpperCase())} 
                  />
                  <button onClick={handleSearch} className="bg-white/10 hover:bg-white/20 hover:text-primary px-8 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all py-4 sm:py-0 border border-white/10 cursor-pointer">Verify Protocol</button>
                </div>

                <AnimatePresence>
                  {tracked && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-8 border-t border-white/5 pt-10 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl">
                          <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Lifecycle State</span>
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            {tracked.status}
                          </span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl">
                          <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Priority Level</span>
                          <span className={`text-xs font-mono font-bold uppercase ${tracked.priority === 'Critical' ? 'text-red-500' : 'text-primary'}`}>{tracked.priority}</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl">
                          <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Department</span>
                          <span className="text-xs font-bold">{tracked.department}</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl">
                          <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">ETA Window</span>
                          <span className="text-xs font-bold text-secondary font-mono">{tracked.eta}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`bg-white/5 p-5 rounded-2xl ${tracked.photo ? 'md:col-span-1' : 'md:col-span-2'}`}>
                          <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Transcription Record</span>
                          <p className="text-xs md:text-sm font-semibold text-gray-300 italic">"{tracked.complaintText}"</p>
                          {tracked.language && (
                            <span className="inline-block mt-3 text-[9px] px-2 py-0.5 rounded bg-white/5 text-gray-500 font-mono uppercase">Lang: {tracked.language}</span>
                          )}
                        </div>
                        {tracked.photo && (
                          <div className="bg-white/5 p-5 rounded-2xl flex flex-col justify-between">
                            <span className="text-[9px] text-gray-500 uppercase font-bold mb-2 block">Attached Issue Snapshot</span>
                            <img src={tracked.photo} alt="Issue" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                          </div>
                        )}
                        <div className="bg-white/5 p-5 rounded-2xl">
                          <span className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Civic Geolocation</span>
                          <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5"><MapPin size={12} className="text-red-400" /> {tracked.address || tracked.location || 'Municipal Area'}</span>
                          <span className="text-[9px] text-gray-600 font-mono mt-1 block">LAT/LNG: {tracked.lat ? `${tracked.lat.toFixed(4)}, ${tracked.lng.toFixed(4)}` : '28.6139, 77.2090'}</span>
                        </div>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                        <h4 className="text-xs font-bold text-primary uppercase mb-2 flex items-center gap-1.5"><Landmark size={14} /> Automated Diagnostic Plan:</h4>
                        <p className="italic text-xs md:text-sm text-gray-300 font-medium leading-relaxed">"{tracked.solution}"</p>
                      </div>

                      {/* Interactive Workflow line diagram */}
                      <WorkflowBar currentStage={tracked.status} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="admin" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-10"
            >
              {/* Admin Gate Passcode Screen */}
              {!isAdminUnlocked ? (
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="glass p-8 md:p-12 rounded-[40px] max-w-md mx-auto text-center border-white/5 shadow-2xl relative overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                    <Key size={30} />
                  </div>
                  <h3 className="font-outfit font-black text-2xl mb-2">OPERATIONS CREDENTIALS</h3>
                  <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-bold">Smart Node Clearance Required</p>
                  
                  <form onSubmit={handleAdminUnlock} className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="Enter Passkey (admin)" 
                      value={passcode}
                      onChange={e => setPasscode(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-center text-sm focus:border-primary/50 tracking-widest font-bold"
                    />
                    <button 
                      type="submit" 
                      className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg hover:scale-[1.01] transition-transform active:scale-95 cursor-pointer"
                    >
                      Authenticate Node
                    </button>
                  </form>
                  <div className="text-[10px] text-gray-600 mt-6 flex items-center justify-center gap-1">
                    <HelpCircle size={10} /> Tip: Use credentials <strong>admin</strong> to bypass gateway.
                  </div>
                </motion.div>
              ) : (
                /* Unlocked Admin Operations Control Deck */
                <div className="space-y-10 animate-fade-in">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
                    <div>
                      <h2 className="text-4xl font-outfit font-black italic tracking-tighter">OPERATION CONTROL CENTER</h2>
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Live Civic Node Stream | Region: NCR Grid</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={seedMockLedger}
                        className="text-[10px] font-bold text-secondary border border-secondary/20 px-4 py-2.5 rounded-lg hover:bg-secondary/10 transition-all uppercase tracking-widest cursor-pointer"
                      >
                        Load Simulation
                      </button>
                      <button 
                        onClick={resetDatabase}
                        className="text-[10px] font-bold text-red-500 border border-red-500/20 px-4 py-2.5 rounded-lg hover:bg-red-500/10 transition-all uppercase tracking-widest cursor-pointer"
                      >
                        Purge Ledger
                      </button>
                    </div>
                  </div>

                  {/* Dashboard Statistics Counters Grid */}
                  <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Dispatches</span>
                        <BarChart2 size={16} className="text-gray-400" />
                      </div>
                      <div className="text-3xl font-extrabold text-white">{totalCount}</div>
                      <div className="text-[9px] text-gray-600 font-mono mt-1">LEDGER ENTRIES</div>
                    </div>
                    <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pending Audit</span>
                        <Clock size={16} className="text-amber-500 animate-spin" />
                      </div>
                      <div className="text-3xl font-extrabold text-amber-500">{pendingCount}</div>
                      <div className="text-[9px] text-gray-600 font-mono mt-1">ACTIVE LIFECYCLE TICKETS</div>
                    </div>
                    <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Critical Alarms</span>
                        <AlertTriangle size={16} className="text-red-500 animate-bounce" />
                      </div>
                      <div className="text-3xl font-extrabold text-red-500">{criticalCount}</div>
                      <div className="text-[9px] text-gray-600 font-mono mt-1">REQUIRES IMMEDIATE AUDIT</div>
                    </div>
                    <div className="glass p-6 rounded-2xl border-white/5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Resolved Nodes</span>
                        <CheckCircle2 size={16} className="text-primary" />
                      </div>
                      <div className="text-3xl font-extrabold text-primary">{resolvedCount}</div>
                      <div className="text-[9px] text-gray-600 font-mono mt-1">VERIFIED ACTIONS</div>
                    </div>
                  </section>

                  {/* Interactive Recharts Analytics Panel */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-3xl border-white/5 lg:col-span-2 min-h-[300px]">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                        <BarChart2 size={14} className="text-secondary" /> Department Load Distribution
                      </h3>
                      <div className="w-full h-64">
                        {totalCount > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getDeptChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                              <Tooltip 
                                contentStyle={{ background: '#0F131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                              />
                              <Bar dataKey="Dispatches" radius={[6, 6, 0, 0]}>
                                {getDeptChartData().map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold uppercase text-gray-600">No Analytics Data Available</div>
                        )}
                      </div>
                    </div>

                    <div className="glass p-6 rounded-3xl border-white/5 flex flex-col justify-between min-h-[300px]">
                      <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                          <Award size={14} className="text-primary" /> Lifecycle Distribution
                        </h3>
                        <div className="w-full h-44 flex items-center justify-center relative">
                          {getStatusChartData().length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie 
                                  data={getStatusChartData()} 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={45} 
                                  outerRadius={65} 
                                  dataKey="value"
                                  paddingAngle={3}
                                >
                                  {getStatusChartData().map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={CHART_COLORS[STAGES.findIndex(s => s.label === entry.name) % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ background: '#0F131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-xs font-bold text-gray-600 uppercase">No Data</div>
                          )}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Stream Load</span>
                            <span className="text-2xl font-black text-white font-mono mt-1">{totalCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-white/5 pt-4">
                        <div className="text-[9px] text-gray-500 font-mono mb-1">LOCAL PROTOCOL VERSION</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5 uppercase font-bold font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> Node.12 // Smart-Civic-Engine
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Leaflet Map Widget Card */}
                  <section className="glass p-6 rounded-3xl border-white/5 animate-fade-in relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Map size={14} className="text-primary" /> Geolocation Incident Tracker
                      </h3>
                      
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                          onClick={() => setShowHeatmap(false)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${!showHeatmap ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                          Standard Pins
                        </button>
                        <button
                          onClick={() => setShowHeatmap(true)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${showHeatmap ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                          Density Heatmap
                        </button>
                      </div>
                    </div>

                    <div id="admin-map" className="w-full h-80 rounded-2xl border border-white/5 overflow-hidden relative z-0" style={{ minHeight: '320px' }}>
                      {complaints.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs font-bold uppercase text-gray-500 z-10">No Coordinates Registered</div>
                      )}
                    </div>
                  </section>

                  {/* Operational Ledger Filter and Search Section */}
                  <section className="flex flex-wrap items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filter Dept:</span>
                      <select 
                        value={filterDept} 
                        onChange={e => setFilterDept(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="All">All Departments</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Roads">Roads</option>
                        <option value="Sanitation">Sanitation</option>
                        <option value="Water">Water</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Priority:</span>
                      <select 
                        value={filterPriority} 
                        onChange={e => setFilterPriority(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="All">All Priorities</option>
                        <option value="Critical">Critical Only</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="ml-auto text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
                      Ledger Match: {filteredComplaints.length} Records Found
                    </div>
                  </section>

                  {/* Complaint Cards Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map(c => {
                        const currentStageObject = STAGES.find(s => s.id === c.status) || STAGES[0];
                        const StageIcon = currentStageObject.icon;
                        
                        return (
                          <motion.div 
                            key={c._id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 md:p-8 rounded-[35px] border-white/5 hover:border-primary/20 transition-all relative overflow-hidden group font-sans"
                          >
                            {/* Left border glow accent representing priority */}
                            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                              c.priority === 'Critical' ? 'bg-red-500' : c.priority === 'High' ? 'bg-orange-500' : 'bg-primary'
                            }`} />

                            <div className="flex flex-col lg:flex-row justify-between gap-8 pl-4">
                              <div className="flex-1 font-sans">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                  <span className="bg-primary/10 text-primary px-3 py-0.5 rounded text-[10px] font-bold font-mono border border-primary/20 tracking-wider">
                                    {c.trackingId}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 font-mono">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                    c.priority === 'Critical' 
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' 
                                      : c.priority === 'High' 
                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                                        : 'bg-white/5 text-gray-500 border-white/10'
                                  }`}>
                                    {c.priority}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-tight flex items-center gap-1">
                                    <MapPin size={10} /> {c.address || c.location || 'NCR Municipal Area'}
                                  </span>
                                </div>

                                <h3 className="text-xl font-bold mb-4 leading-snug group-hover:text-primary transition-colors text-white font-sans">
                                  "{c.complaintText}"
                                </h3>

                                {c.photo && (
                                  <div className="mb-4 max-w-xs rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                    <img src={c.photo} alt="Issue Snap" className="w-full h-40 object-cover" />
                                  </div>
                                )}

                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4 max-w-4xl">
                                  <div className="text-[9px] text-primary font-bold uppercase tracking-wider mb-1">AI Solution Pipeline</div>
                                  <div className="text-xs text-gray-400 leading-normal italic font-medium">"{c.solution}"</div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-gray-500 uppercase">
                                  <div className="flex items-center gap-1.5"><Landmark size={14} /> {c.department} Department</div>
                                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> Action ETA: {c.eta}</div>
                                </div>
                              </div>

                              <div className="lg:w-60 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between min-h-[140px]">
                                <div className="flex justify-between items-start lg:block text-right">
                                  <div className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest mb-1.5">Lifecycle State</div>
                                  <div 
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                    style={{ color: currentStageObject.color, background: `${currentStageObject.color}15`, border: `1px solid ${currentStageObject.color}30` }}
                                  >
                                    <StageIcon size={10} />
                                    {c.status.toUpperCase()}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => updateStage(c._id, c.status)} 
                                    className="flex-1 py-3 bg-white/5 hover:bg-primary border border-white/5 hover:border-primary/20 hover:text-black rounded-xl font-bold uppercase text-[9px] tracking-widest flex items-center justify-center gap-1 transition-all cursor-pointer"
                                  >
                                    <span>Advance Node</span>
                                    <ChevronRight size={12} />
                                  </button>
                                  <button 
                                    onClick={() => deleteRecord(c._id)}
                                    className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="glass p-12 rounded-[40px] text-center border-white/5">
                        <AlertTriangle size={30} className="text-gray-600 mx-auto mb-4 animate-bounce" />
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">No matching ledger records</h4>
                        <p className="text-xs text-gray-600 mt-1">Adjust department/priority filters or seed mock simulation data.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Futuristic noise overlay for deep styling texture */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none -z-10" />
    </div>
  );
};

export default App;
