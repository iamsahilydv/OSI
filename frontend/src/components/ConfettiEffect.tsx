"use client";

import { motion } from "framer-motion";

export default function ConfettiEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            backgroundColor: ["#FF5733", "#33FF57", "#3357FF"][i % 3],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 1 + Math.random(),
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  );
}
