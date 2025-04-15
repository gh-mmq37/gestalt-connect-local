
import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { WellnessReminder } from "../Wellness/WellnessReminder";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 animate-fade-in">
        <Outlet />
      </main>
      <WellnessReminder />
    </div>
  );
};
