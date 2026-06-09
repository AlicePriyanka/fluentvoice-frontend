export type DisfluencyEvent = {
  event: "block" | "word_rep" | "sound_rep" | "prolongation" | "interjection" | "pause"
       | "repetition" | "filler" | "revision" | "false_start" | "phrase_rep" | "unknown";
  time: string;
  word?: string;
  duration?: number;
};

export type Session = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  fluencyScore: number;
  severity: "mild" | "moderate" | "severe";
  speechRate: number;
  transcript: string;
  disfluencies: DisfluencyEvent[];
  pauses: number;
  notes: string;
  audioUrl?: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  joinedDate: string;
  therapistId: string;
  condition: string;
  treatmentGoals: string[];
  practiceExercises: string[];
  treatmentRemarks: string;
  nextAppointment: string;
  sessionsCount: number;
  avgFluency: number;
  trend: "improving" | "stable" | "declining";
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Arjun Kumar",
    age: 24,
    joinedDate: "2026-01-10",
    therapistId: "t1",
    condition: "Developmental Stuttering",
    treatmentGoals: [
      "Reduce block frequency below 3 per minute",
      "Increase speech rate to 140–160 wpm",
      "Build confidence in group conversation settings",
    ],
    practiceExercises: [
      "Prolonged speech — 5 min daily reading aloud",
      "Voluntary stuttering — 10 min per session",
      "Diaphragmatic breathing exercises — 3×/day",
    ],
    treatmentRemarks:
      "Arjun shows consistent improvement in controlled settings. Blocks have reduced from 8/min to ~4/min over 6 weeks. Focus next sessions on spontaneous speech and social contexts.",
    nextAppointment: "2026-06-02 10:00",
    sessionsCount: 12,
    avgFluency: 64,
    trend: "improving",
  },
  {
    id: "p2",
    name: "Priya Nair",
    age: 31,
    joinedDate: "2026-02-15",
    therapistId: "t1",
    condition: "Cluttering",
    treatmentGoals: [
      "Slow speech rate to below 160 wpm",
      "Improve awareness of speech clarity",
      "Reduce filler words by 50%",
    ],
    practiceExercises: [
      "Slow reading passages — 15 min/day",
      "Self-monitoring with recordings",
      "Pause practice between sentences",
    ],
    treatmentRemarks:
      "Priya is highly motivated. Speech rate remains elevated at ~240 wpm. Prioritising rate reduction and self-monitoring tools.",
    nextAppointment: "2026-06-04 14:30",
    sessionsCount: 7,
    avgFluency: 51,
    trend: "stable",
  },
  {
    id: "p3",
    name: "Rahul Menon",
    age: 19,
    joinedDate: "2026-03-01",
    therapistId: "t1",
    condition: "Developmental Stuttering",
    treatmentGoals: [
      "Manage situational anxiety around speech",
      "Establish fluency shaping baseline",
    ],
    practiceExercises: [
      "Easy onset — 10 min daily",
      "Light articulatory contact drills",
    ],
    treatmentRemarks:
      "Early stages. High situational anxiety. Recommend CBT referral alongside speech therapy.",
    nextAppointment: "2026-06-06 11:00",
    sessionsCount: 4,
    avgFluency: 38,
    trend: "improving",
  },
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: "s1",
    patientId: "p1",
    patientName: "Arjun Kumar",
    date: "2026-05-25 09:30",
    fluencyScore: 68,
    severity: "moderate",
    speechRate: 132,
    transcript:
      "I was trying to explain the project to my manager and I felt confident at first but then I started to b-block on the word 'because' and I couldn't get past it for a few seconds. Eventually I switched to a different word.",
    disfluencies: [
      { event: "block", time: "0:08", word: "because", duration: 2.1 },
      { event: "word_rep", time: "0:22", word: "the", duration: 0.4 },
      { event: "prolongation", time: "0:41", word: "explain", duration: 1.8 },
      { event: "pause", time: "1:03", duration: 3.2 },
      { event: "interjection", time: "1:15", word: "um" },
    ],
    pauses: 4,
    notes: "Good recovery strategy — word substitution used effectively. Discuss voluntary stuttering next session.",
    audioUrl: "",
  },
  {
    id: "s2",
    patientId: "p1",
    patientName: "Arjun Kumar",
    date: "2026-05-18 09:30",
    fluencyScore: 61,
    severity: "moderate",
    speechRate: 118,
    transcript:
      "The meeting was stressful. I had to present in front of the entire team and I remember feeling my chest tighten before I even began speaking.",
    disfluencies: [
      { event: "block", time: "0:05", word: "meeting", duration: 3.0 },
      { event: "block", time: "0:19", word: "present", duration: 2.5 },
      { event: "word_rep", time: "0:33", word: "I", duration: 0.5 },
      { event: "pause", time: "0:55", duration: 4.1 },
      { event: "pause", time: "1:20", duration: 2.8 },
      { event: "prolongation", time: "1:35", word: "remember", duration: 2.1 },
    ],
    pauses: 5,
    notes: "Higher anxiety this session — pre-presentation stress evident. Introduce relaxation techniques.",
    audioUrl: "",
  },
  {
    id: "s3",
    patientId: "p2",
    patientName: "Priya Nair",
    date: "2026-05-24 14:00",
    fluencyScore: 53,
    severity: "moderate",
    speechRate: 238,
    transcript:
      "I think the main issue is that I speak too quickly and people sometimes ask me to repeat myself which is frustrating because I feel like I'm communicating clearly in my head.",
    disfluencies: [
      { event: "interjection", time: "0:03", word: "um" },
      { event: "word_rep", time: "0:12", word: "I", duration: 0.3 },
      { event: "interjection", time: "0:28", word: "like" },
      { event: "sound_rep", time: "0:44", word: "comm-communicating", duration: 0.6 },
    ],
    pauses: 1,
    notes: "Speech rate still at 238 wpm. Patient aware of the issue. Introduce pacing board technique.",
    audioUrl: "",
  },
  {
    id: "s4",
    patientId: "p3",
    patientName: "Rahul Menon",
    date: "2026-05-23 11:00",
    fluencyScore: 38,
    severity: "severe",
    speechRate: 89,
    transcript:
      "I... I don't know how to start. Every time I try to say something important, I just... freeze. Like the words are there but they won't come out.",
    disfluencies: [
      { event: "block", time: "0:01", word: "I", duration: 4.2 },
      { event: "pause", time: "0:15", duration: 5.8 },
      { event: "block", time: "0:31", word: "something", duration: 3.5 },
      { event: "pause", time: "0:48", duration: 6.1 },
      { event: "prolongation", time: "1:02", word: "freeze", duration: 2.9 },
    ],
    pauses: 6,
    notes: "Significant blocking. Situational anxiety high. Referred to CBT colleague. Continue easy onset exercises.",
    audioUrl: "",
  },
];

export const MOCK_PATIENT_TREND = [
  { week: "Wk 1", fluency: 42 },
  { week: "Wk 2", fluency: 47 },
  { week: "Wk 3", fluency: 44 },
  { week: "Wk 4", fluency: 52 },
  { week: "Wk 5", fluency: 58 },
  { week: "Wk 6", fluency: 61 },
  { week: "Wk 7", fluency: 68 },
];

export const MOCK_DISF_BREAKDOWN = [
  { type: "Block", count: 8, color: "#EF4444" },
  { type: "Pause", count: 13, color: "#6366F1" },
  { type: "Word Rep", count: 5, color: "#F59E0B" },
  { type: "Prolongation", count: 6, color: "#8B5CF6" },
  { type: "Interjection", count: 4, color: "#9CA3AF" },
  { type: "Sound Rep", count: 2, color: "#F97316" },
];
