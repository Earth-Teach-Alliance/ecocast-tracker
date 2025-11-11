import React from "react";

export default function EarthReporterLogo({ className = "w-10 h-10" }) {
  return (
    <img 
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ea68d0d5ddf7783ea8c465/7443d09b1_EarthTeach480x480px22.png"
      alt="EcoCast Tracker Logo"
      className={`${className} object-cover rounded-lg shadow-lg block`}
      style={{ display: 'block' }}
    />
  );
}