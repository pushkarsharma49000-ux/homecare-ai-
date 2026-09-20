export interface CallVolumeDay {
  date: string;
  day: string;
  totalCalls: number;
  aiResolved: number;
  escalated: number;
  serviceRequests: number;
}

export interface ApplianceDistribution {
  appliance: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopProblem {
  issue: string;
  count: number;
  appliance: string;
  percentage: number;
}

export const mockDailyCallVolume: CallVolumeDay[] = [
  { date: 'Sep 07', day: 'Mon', totalCalls: 112, aiResolved: 92, escalated: 20, serviceRequests: 26 },
  { date: 'Sep 08', day: 'Tue', totalCalls: 128, aiResolved: 104, escalated: 24, serviceRequests: 31 },
  { date: 'Sep 09', day: 'Wed', totalCalls: 135, aiResolved: 112, escalated: 23, serviceRequests: 33 },
  { date: 'Sep 10', day: 'Thu', totalCalls: 142, aiResolved: 118, escalated: 24, serviceRequests: 36 },
  { date: 'Sep 11', day: 'Fri', totalCalls: 156, aiResolved: 129, escalated: 27, serviceRequests: 39 },
  { date: 'Sep 12', day: 'Sat', totalCalls: 168, aiResolved: 140, escalated: 28, serviceRequests: 42 },
  { date: 'Sep 13', day: 'Sun', totalCalls: 140, aiResolved: 116, escalated: 24, serviceRequests: 32 },
  { date: 'Sep 14', day: 'Mon', totalCalls: 132, aiResolved: 109, escalated: 23, serviceRequests: 30 },
  { date: 'Sep 15', day: 'Tue', totalCalls: 144, aiResolved: 120, escalated: 24, serviceRequests: 34 },
  { date: 'Sep 16', day: 'Wed', totalCalls: 139, aiResolved: 115, escalated: 24, serviceRequests: 33 },
  { date: 'Sep 17', day: 'Thu', totalCalls: 151, aiResolved: 126, escalated: 25, serviceRequests: 37 },
  { date: 'Sep 18', day: 'Fri', totalCalls: 160, aiResolved: 132, escalated: 28, serviceRequests: 40 },
  { date: 'Sep 19', day: 'Sat', totalCalls: 172, aiResolved: 144, escalated: 28, serviceRequests: 44 },
  { date: 'Sep 20', day: 'Today', totalCalls: 147, aiResolved: 121, escalated: 18, serviceRequests: 34 },
];

export const mockApplianceBreakdown: ApplianceDistribution[] = [
  { appliance: 'Air Conditioner', count: 48, percentage: 33, color: '#0284c7' },
  { appliance: 'Washing Machine', count: 37, percentage: 25, color: '#3b82f6' },
  { appliance: 'Refrigerator', count: 28, percentage: 19, color: '#06b6d4' },
  { appliance: 'Water Purifier', count: 19, percentage: 13, color: '#10b981' },
  { appliance: 'Television', count: 15, percentage: 10, color: '#8b5cf6' },
];

export const mockTopProblems: TopProblem[] = [
  { issue: 'AC Cooling', count: 32, appliance: 'Air Conditioner', percentage: 22 },
  { issue: 'Washing Machine Vibration', count: 24, appliance: 'Washing Machine', percentage: 16 },
  { issue: 'Refrigerator Cooling', count: 19, appliance: 'Refrigerator', percentage: 13 },
  { issue: 'Installation', count: 17, appliance: 'Multiple', percentage: 12 },
  { issue: 'Warranty', count: 14, appliance: 'Multiple', percentage: 10 },
  { issue: 'Water Leakage', count: 11, appliance: 'AC / Washing Machine', percentage: 7 },
];

export const mockAIQualityMetrics = {
  intentAccuracy: 94,
  actionAccuracy: 91,
  averageAIConfidence: 92,
  humanEscalationRate: 12,
  averageResolutionTime: '03:12',
};

export const mockOperationalMetrics = {
  averageHandlingTime: '02:41',
  averageResolutionTime: '03:12',
  serviceRequestCreationRate: '23.1%',
  repeatCallRate: '4.2%',
  firstCallResolutionRate: '82.3%',
  callAnswerSpeed: '0.8s',
};
