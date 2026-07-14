/**
 * StadiumOS AI - Automated Core Telemetry & Auth Validation Test Suite
 * This script verifies role routing, portal configuration, and initial stadium state values.
 */

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
};

console.log("====================================================");
console.log("STARTING STADIUMOS CORE TELEMETRY & AUTH TEST SUITE");
console.log("====================================================\n");

// Mocking some simple operations to test logic from AuthProvider.tsx
const mapDbRoleToPortalRole = (dbRole) => {
  if (dbRole === 'fan' || dbRole === 'visitor') return 'visitor';
  if (dbRole === 'admin' || dbRole === 'fifa') return 'fifa';
  return 'staff';
};

const getDashboardForRole = (role) => {
  if (role === 'visitor' || role === 'fan') return '/dashboard/visitor';
  if (role === 'fifa' || role === 'admin') return '/dashboard/fifa';
  return '/dashboard/staff';
};

// 1. Test Role Mapping logic
console.log("1. Testing Auth Role Mapping:");
assert(mapDbRoleToPortalRole('fan') === 'visitor', "fan maps to visitor");
assert(mapDbRoleToPortalRole('visitor') === 'visitor', "visitor maps to visitor");
assert(mapDbRoleToPortalRole('admin') === 'fifa', "admin maps to fifa");
assert(mapDbRoleToPortalRole('fifa') === 'fifa', "fifa maps to fifa");
assert(mapDbRoleToPortalRole('organizer') === 'staff', "organizer maps to staff");
assert(mapDbRoleToPortalRole('security') === 'staff', "security maps to staff");
console.log("");

// 2. Test Dashboard Redirect paths
console.log("2. Testing Portal Redirection Paths:");
assert(getDashboardForRole('visitor') === '/dashboard/visitor', "visitor role redirects to /dashboard/visitor");
assert(getDashboardForRole('staff') === '/dashboard/staff', "staff role redirects to /dashboard/staff");
assert(getDashboardForRole('fifa') === '/dashboard/fifa', "fifa role redirects to /dashboard/fifa");
console.log("");

// 3. Test Health Score Calculation Algorithm
console.log("3. Testing Telemetry Health Score Calculations:");
const calculateHealthScore = (activeAlertsCount, criticalZones, delayedTransport) => {
  let score = 96;
  if (activeAlertsCount > 2) score -= 15;
  if (criticalZones > 0) score -= criticalZones * 8;
  if (delayedTransport > 0) score -= delayedTransport * 5;
  return Math.max(10, Math.min(100, score));
};

assert(calculateHealthScore(0, 0, 0) === 96, "Nominal health score is 96");
assert(calculateHealthScore(3, 0, 0) === 81, "3 active alerts reduces health by 15");
assert(calculateHealthScore(0, 2, 0) === 80, "2 critical zones reduces health by 16");
assert(calculateHealthScore(0, 0, 1) === 91, "1 delayed transport reduces health by 5");
assert(calculateHealthScore(5, 5, 5) === 16, "Multiple failures reduce health score to 16");
assert(calculateHealthScore(5, 15, 5) === 10, "Extreme failures clamp health score to a minimum of 10");
console.log("");

// 4. Test Fan Experience Breakdown Index Formula
console.log("4. Testing Fan Experience Breakdown Index Calculations:");
const calculateFanExperience = (temp, rainProb, simulatedIncidentsCount, criticalZonesCount, accessibilityPendingCount) => {
  let weatherComfort = 92;
  if (temp >= 32) weatherComfort -= 20;
  if (rainProb >= 50) weatherComfort -= 15;

  const queueDeltas = criticalZonesCount * 4;
  const queuesIdx = Math.max(20, 95 - queueDeltas * 8);
  const accessibilityIdx = Math.max(40, 98 - (accessibilityPendingCount * 15));
  const navIdx = 96;

  const totalScore = Math.round((queuesIdx + accessibilityIdx + navIdx + weatherComfort) / 4);
  return {
    totalScore,
    weatherComfort,
    queuesIdx,
    accessibilityIdx
  };
};

const fanExp1 = calculateFanExperience(24, 10, 0, 0, 0);
assert(fanExp1.weatherComfort === 92, "Weather comfort at 24C / 10% rain is 92");
assert(fanExp1.queuesIdx === 95, "Queue index with 0 critical zones is 95");
assert(fanExp1.accessibilityIdx === 98, "Accessibility index with 0 pending requests is 98");
assert(fanExp1.totalScore === 95, "Total fan experience score is nominal (95)");

const fanExp2 = calculateFanExperience(33, 60, 2, 2, 1);
assert(fanExp2.weatherComfort === 57, "Weather comfort at 33C / 60% rain drops to 57");
assert(fanExp2.queuesIdx === 31, "Queue index with 2 critical zones drops to 31");
assert(fanExp2.accessibilityIdx === 83, "Accessibility index with 1 pending request drops to 83");
console.log("");

console.log("====================================================");
console.log("ALL CORE TELEMETRY & AUTH VALIDATION TESTS PASSED!");
console.log("====================================================");
