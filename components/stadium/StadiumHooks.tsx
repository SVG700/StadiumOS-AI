'use client';

import { useStadium } from './StadiumContext';

// 1. useTelemetry
export const useTelemetry = () => {
  const { stadiumHealth, healthScore, sustainability, resilienceScore } = useStadium();
  return {
    stadiumHealth,
    healthScore,
    resilienceScore,
    energyUsageKw: sustainability.energyUsageKw,
    renewablePercentage: sustainability.renewablePercentage,
    carbonOffsetKg: sustainability.carbonOffsetKg,
    wasteRecycledKg: sustainability.wasteRecycledKg,
    waterSavedLitres: sustainability.waterSavedLitres
  };
};

// 2. useNotifications
export const useNotifications = () => {
  const { notifications, clearNotifications, markNotificationRead } = useStadium();
  const unreadCount = notifications.filter(n => !n.read).length;
  return {
    notifications,
    unreadCount,
    clearNotifications,
    markNotificationRead
  };
};

// 3. useMatchEngine
export const useMatchEngine = () => {
  const { selectedStadium, changeMatchPhase } = useStadium();
  return {
    match: selectedStadium.match,
    matchPhase: selectedStadium.matchPhase,
    changeMatchPhase
  };
};

// 4. useIncidentLifecycle
export const useIncidentLifecycle = () => {
  const { selectedStadium, alerts, incidents, addEmergency, resolveEmergency, triggerRandomIncident } = useStadium();
  return {
    alerts,
    incidents,
    simulatedIncidents: selectedStadium.simulatedIncidents,
    addEmergency,
    resolveEmergency,
    triggerRandomIncident
  };
};

// 5. useWeather
export const useWeather = () => {
  const { selectedStadium } = useStadium();
  return {
    weather: selectedStadium.weather
  };
};

// 6. useCrowdMetrics
export const useCrowdMetrics = () => {
  const { crowdDensity, visitors, refreshFeeds } = useStadium();
  return {
    crowdDensity,
    visitors,
    refreshFeeds
  };
};

// 7. useAccessibility
export const useAccessibility = () => {
  const { accessibility, volunteers, claimAccessibility } = useStadium();
  return {
    accessibility,
    volunteers,
    claimAccessibility
  };
};
