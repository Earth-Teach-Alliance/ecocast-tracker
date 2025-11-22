import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Upload, Map, BookOpen, User, TrendingUp, Languages, Mail } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter } from
"@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EarthReporterLogo from "./components/EarthReporterLogo";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import NotificationDropdown from "./components/community/NotificationDropdown";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { language, changeLanguage, t } = useLanguage();

  const navigationItems = [
  {
    title: t("feed"),
    url: createPageUrl("Feed"),
    icon: Home
  },
  {
    title: t("fieldNotebook"),
    url: createPageUrl("FieldNotebook"),
    icon: BookOpen
  },
  {
    title: t("map"),
    url: createPageUrl("Map"),
    icon: Map
  },
  {
    title: t("trendsAnalyst"),
    url: createPageUrl("TrendsAnalyst"),
    icon: TrendingUp
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: Mail
  },
  {
    title: t("profile"),
    url: createPageUrl("Profile"),
    icon: User
  }];


  return (
    <div className="min-h-screen flex w-full bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a]">
      <Sidebar className="border-r border-cyan-900/30 bg-[#1a2332]">
        <SidebarHeader className="border-b border-cyan-900/30 p-6 bg-[#1a2332]">
          <div className="flex items-center gap-3">
            <div className="shadow-lg shadow-cyan-500/30 rounded-full">
              <EarthReporterLogo className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold drop-shadow-lg">EcoCast Tracker</h2>
              <p className="text-cyan-300 text-xs font-medium">
                {language === 'es' ?
                'Midiendo el impacto humano en un planeta cambiante' :
                'Measuring human impact in a changing planet'}
              </p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-2 bg-[#1a2332]">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) =>
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                    asChild
                    className={`hover:bg-cyan-800/40 hover:text-white transition-all duration-200 rounded-xl mb-1 ${
                    location.pathname === item.url ?
                    'bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/30' :
                    'text-cyan-100'}`
                    }>

                      <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-cyan-900/30 bg-[#1a2332]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-500">

                <Languages className="w-4 h-4 mr-2" />
                {language === 'en' ? 'English' : 'Español'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a2332] border-cyan-900/50 w-48">
              <DropdownMenuItem
                onClick={() => changeLanguage('en')}
                className={`text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer ${
                language === 'en' ? 'bg-cyan-900/20 font-semibold' : ''}`
                }>

                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLanguage('es')}
                className={`text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer ${
                language === 'es' ? 'bg-cyan-900/20 font-semibold' : ''}`
                }>

                Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col">
        <header className="bg-[#0a1628] backdrop-blur-md border-b border-cyan-900/30 px-6 py-4 sticky top-0 z-40 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-cyan-900/30 p-2 rounded-lg transition-colors duration-200 text-cyan-300 md:hidden" />
              <div className="flex items-center gap-2">
                <EarthReporterLogo className="w-8 h-8 md:hidden" />
                <h1 className="text-lg font-bold text-white md:hidden">EcoCast Tracker</h1>
              </div>
            </div>
            <NotificationDropdown />
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>);

}

export default function Layout({ children, currentPageName }) {
  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --space-dark: #0a1628;
            --space-blue: #1b263b;
            --space-lighter: #1e3a8a;
            --glow-cyan: #06b6d4;
            --glow-blue: #0ea5e9;
            --primary-500: #22c55e;
            --primary-600: #16a34a;
            --primary-700: #15803d;
          }
          
          body {
            background: linear-gradient(to bottom, #0a1628, #1b263b);
          }
        `}
      </style>
      <LanguageProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </LanguageProvider>
    </SidebarProvider>);

}