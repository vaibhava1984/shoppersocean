"use client";
import { useEffect } from "react";

export default function AdminDeviceMarker() {
  useEffect(() => {
    try { localStorage.setItem("so-admin-device-shortcut", "registered"); } catch {}
  }, []);
  return null;
}
