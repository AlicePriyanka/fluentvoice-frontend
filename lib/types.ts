import { ObjectId } from "mongodb";

export interface DbUser {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: "patient" | "therapist";
  /** For patients: the ObjectId of their assigned therapist */
  therapistId?: ObjectId;
  joinedDate: string; // e.g. "Jan 2025"
  createdAt: Date;
}

export interface DbSession {
  _id?: ObjectId;
  userId: ObjectId;
  fluency_score: number;
  severity: "mild" | "moderate" | "severe";
  speech_rate: number;
  transcript: string;
  disfluencies: Array<{
    event: string;
    word?: string;
    time: string;
    duration?: number;
  }>;
  pauses: number;
  timeline: unknown[];
  audioUrl?: string;      // Cloudinary URL for replay
  createdAt: Date;
}

export interface DbAppointment {
  _id?: ObjectId;
  patientId: ObjectId;
  therapistId: ObjectId;
  patientName: string;
  date: string;           // "YYYY-MM-DD"
  time: string;           // "HH:MM"
  durationMinutes: number;
  type: "in-clinic" | "telehealth";
  status: "pending" | "confirmed" | "cancelled";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbProfile {
  _id?: ObjectId;
  userId: ObjectId;
  role: "patient" | "therapist";
  phone?: string;
  age?: number;
  condition?: string;           // patient
  bio?: string;                 // therapist
  specialty?: string;           // therapist
  licenseNumber?: string;       // therapist
  clinicName?: string;          // therapist
  updatedAt: Date;
}

export interface DbTreatmentPlan {
  _id?: ObjectId;
  /** Stored as a plain string so mock IDs like "p1" work alongside real ObjectId strings */
  patientId: string;
  therapistId?: string;
  goals: string[];
  exercises: string[];
  remarks: string;
  updatedAt: Date;
}

/** Safe user shape returned to the client (no passwordHash) */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: "patient" | "therapist";
  therapistId?: string;
  joinedDate: string;
}

/** JWT payload stored in the token */
export interface JwtPayload {
  sub: string;       // user _id
  email: string;
  name: string;
  role: "patient" | "therapist";
  iat?: number;
  exp?: number;
}
