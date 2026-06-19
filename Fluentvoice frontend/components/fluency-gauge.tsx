"use client";

import { motion } from "framer-motion";

interface FluencyGaugeProps {
  score: number;
  size?: number;
}

export function FluencyGauge({ score, size = 180 }: FluencyGaugeProps) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score / 100, 0), 1);
  const offset = circ * (1 - pct);

  const color =
    score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";
  const grade =
    score >= 70 ? "Good" : score >= 40 ? "Fair" : "Low";
  const label =
    score >= 70 ? "Fluent range" : score >= 40 ? "Moderate stuttering" : "Significant disruption";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          role="img"
          aria-label={`Fluency score ${score} out of 100, rated ${grade}`}
        >
          {/* Track */}
          <circle
            cx="80" cy="80" r={r}
            fill="none"
            stroke="#E8EDF5"
            strokeWidth="14"
          />
          {/* Progress */}
          <motion.circle
            cx="80" cy="80" r={r}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
          {/* Score */}
          <text
            x="80" y="72"
            textAnchor="middle"
            fontSize="36"
            fontWeight="900"
            fill="#1B2B5E"
            fontFamily="Inter, sans-serif"
            letterSpacing="-1"
          >
            {score}
          </text>
          <text
            x="80" y="88"
            textAnchor="middle"
            fontSize="11"
            fill="#9CA3AF"
            fontFamily="Inter, sans-serif"
          >
            out of 100
          </text>
          <text
            x="80" y="106"
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fill={color}
            fontFamily="Inter, sans-serif"
          >
            {grade}
          </text>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Fluency Score</div>
        <div className="text-[11px] text-[#9CA3AF] mt-0.5">{label}</div>
      </div>
    </div>
  );
}
