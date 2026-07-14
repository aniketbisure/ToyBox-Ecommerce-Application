import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export default function Logo({
  className = "",
  size = 40,
  showText = true,
  textColor = "text-dark",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <img
          src="/logo.png"
          alt="ToyBox Logo"
          className="object-contain w-full h-full"
        />
      </div>
      {showText && (
        <h1 className={`font-black tracking-tight ${textColor}`} style={{ fontSize: size * 0.45 }}>
          ToyBox <span className="text-primary">Admin</span>
        </h1>
      )}
    </div>
  );
}
