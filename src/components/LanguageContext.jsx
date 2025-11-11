
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    feed: "Feed",
    upload: "Upload",
    map: "Map",
    fieldNotebook: "Field Notebook",
    trendsAnalyst: "Trends Analyst",
    profile: "Profile",
    
    // Common
    logout: "Logout",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading",
    
    // Feed
    measuringImpact: "Measuring human impact",
    earthReporters: "Earth reporters are investigators of anthropogenic activity in our changing planet. Discover what earth reporters are documenting around the world.",
    impactDashboard: "Impact Dashboard",
    totalObservations: "Total Observations",
    mostReported: "Most Reported Issue",
    breakdown: "Breakdown by Category",
    like: "Like",
    share: "Share",
    noReportsYet: "No Reports Yet",
    beFirst: "Be the first to document environmental change in your area!",
    uploadFirstReport: "Upload First Report",
    
    // Upload
    documentChange: "Document Change",
    shareObservations: "Share your environmental observations with the world",
    uploadMedia: "Upload Media",
    photo: "Photo",
    video: "Video",
    audio: "Audio",
    details: "Details",
    title: "Title",
    description: "Description",
    category: "Impact Category",
    tags: "Tags",
    location: "Location",
    getGPS: "Get GPS",
    orEnterManually: "Or enter manually",
    city: "City",
    state: "State/Province",
    country: "Country",
    getCoordinates: "Get Coordinates",
    submitReport: "Submit Report",
    uploading: "Uploading",
    
    // Categories
    pollutantsAndWaste: "Pollutants and Waste",
    airQuality: "Air Quality",
    deforestation: "Deforestation",
    biodiversityImpacts: "Biodiversity Impacts", // Replaced wildlife and habitatLoss
    waterQuality: "Water Quality",
    extremeHeatAndDroughtImpacts: "Extreme Heat and Drought Impacts",
    firesNaturalOrHumanCaused: "Fires (Natural or Human Caused)",
    conservationRestoration: "Conservation/Restoration Activity",
    humanDisparitiesAndInequity: "Human Disparities and Inequity",
    soundscape: "Soundscape",
    other: "Other",
    
    // Profile
    observations: "Observations",
    fieldNotes: "Field Notes",
    locations: "Locations",
    recentActivity: "Recent Activity",
    earthReporter: "Earth Reporter",
    
    // Map
    globalMap: "Global Impact Map",
    observationsWorldwide: "observations documented worldwide",
    noLocations: "No Locations Yet",
    startDocumenting: "Start documenting observations with GPS coordinates to see them on the map"
  },
  es: {
    // Navigation
    feed: "Inicio",
    upload: "Subir",
    map: "Mapa",
    fieldNotebook: "Cuaderno de Campo",
    trendsAnalyst: "Analista de Tendencias",
    profile: "Perfil",
    
    // Common
    logout: "Cerrar Sesión",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    loading: "Cargando",
    
    // Feed
    measuringImpact: "Midiendo el impacto humano",
    earthReporters: "Los reporteros terrestres son investigadores de la actividad antropogénica en nuestro planeta cambiante. Descubre lo que los reporteros terrestres están documentando en todo el mundo.",
    impactDashboard: "Panel de Impacto",
    totalObservations: "Observaciones Totales",
    mostReported: "Problema Más Reportado",
    breakdown: "Desglose por Categoría",
    like: "Me Gusta",
    share: "Compartir",
    noReportsYet: "No Hay Reportes Todavía",
    beFirst: "¡Sé el primero en documentar el cambio ambiental en tu área!",
    uploadFirstReport: "Subir Primer Reporte",
    
    // Upload
    documentChange: "Documentar Cambio",
    shareObservations: "Comparte tus observaciones ambientales con el mundo",
    uploadMedia: "Subir Medios",
    photo: "Foto",
    video: "Video",
    audio: "Audio",
    details: "Detalles",
    title: "Título",
    description: "Descripción",
    category: "Categoría de Impacto",
    tags: "Etiquetas",
    location: "Ubicación",
    getGPS: "Obtener GPS",
    orEnterManually: "O ingresa manualmente",
    city: "Ciudad",
    state: "Estado/Provincia",
    country: "País",
    getCoordinates: "Obtener Coordenadas",
    submitReport: "Enviar Reporte",
    uploading: "Subiendo",
    
    // Categories
    pollutantsAndWaste: "Contaminantes y Residuos",
    airQuality: "Calidad del Aire",
    deforestation: "Deforestación",
    biodiversityImpacts: "Impactos en la Biodiversidad", // Replaced wildlife and habitatLoss
    waterQuality: "Calidad del Agua",
    extremeHeatAndDroughtImpacts: "Impactos de Calor Extremo y Sequía",
    firesNaturalOrHumanCaused: "Incendios (Naturales o Provocados)",
    conservationRestoration: "Actividad de Conservación/Restauración",
    humanDisparitiesAndInequity: "Disparidades e Inequidad Humana",
    soundscape: "Paisaje Sonoro",
    other: "Otro",
    
    // Profile
    observations: "Observaciones",
    fieldNotes: "Notas de Campo",
    locations: "Ubicaciones",
    recentActivity: "Actividad Reciente",
    earthReporter: "Reportero Terrestre",
    
    // Map
    globalMap: "Mapa de Impacto Global",
    observationsWorldwide: "observaciones documentadas en todo el mundo",
    noLocations: "No Hay Ubicaciones Todavía",
    startDocumenting: "Comienza a documentar observaciones con coordenadas GPS para verlas en el mapa"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language');
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
