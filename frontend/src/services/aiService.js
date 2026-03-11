import api from './api';

// Dynamic scenarios generator
const generateDynamicScenario = () => {
  const scenarios = [
    // Scenario 1: Excellent Condition
    {
      severity: "Low",
      risk_score: 1,
      message: "🎉 Excellent News! Your vehicle is in outstanding condition. All systems are functioning optimally with no immediate maintenance required.",
      next_service_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      recommendations: [
        {
          component: "Routine Check-up",
          urgency: "Low",
          reason: "Everything is perfect! Regular preventive check-up recommended to maintain this excellent condition.",
          estimated_cost: "₹500 - ₹1,000",
          severity_cause: "No issues detected",
          action_needed: "Continue regular maintenance schedule. Keep monitoring vehicle performance."
        }
      ],
      ai_summary: {
        health_score: 95,
        insights: [
          { icon: '✅', label: 'Engine Health', value: 'Excellent', severity: 'low' },
          { icon: '✅', label: 'Brake System', value: 'Perfect', severity: 'low' },
          { icon: '✅', label: 'Tire Condition', value: 'Optimal', severity: 'low' },
          { icon: '✅', label: 'Fluid Levels', value: 'Good', severity: 'low' }
        ],
        maintenance_timeline: [
          { date: '90 days', task: 'Routine Service', priority: 'low' }
        ]
      }
    },
    
    // Scenario 2: Minor Attention Needed
    {
      severity: "Low",
      risk_score: 2,
      message: "Your vehicle is in good condition. Minor attention needed for optimal performance.",
      next_service_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      recommendations: [
        {
          component: "Wiper Blades",
          urgency: "Low",
          reason: "Monsoon season approaching. Wiper blades showing signs of wear but still functional.",
          estimated_cost: "₹300 - ₹800",
          severity_cause: "Normal wear and tear from UV exposure and usage",
          action_needed: "Replace wiper blades before monsoon season for optimal visibility during heavy rains."
        },
        {
          component: "Cabin Air Filter",
          urgency: "Low",
          reason: "Filter effectiveness reduced due to dust accumulation. Not critical but affects air quality.",
          estimated_cost: "₹400 - ₹900",
          severity_cause: "High pollution and dust levels in urban areas",
          action_needed: "Replace cabin filter to improve air conditioning efficiency and interior air quality."
        }
      ],
      ai_summary: {
        health_score: 85,
        insights: [
          { icon: '✅', label: 'Engine Health', value: 'Good', severity: 'low' },
          { icon: '⚠️', label: 'Wiper Condition', value: 'Attention', severity: 'low' },
          { icon: '✅', label: 'Brake System', value: 'Good', severity: 'low' },
          { icon: '⚠️', label: 'Air Filter', value: 'Replace Soon', severity: 'low' }
        ],
        maintenance_timeline: [
          { date: '45 days', task: 'Wiper Replacement', priority: 'low' },
          { date: '60 days', task: 'Cabin Filter', priority: 'low' }
        ]
      }
    },

    // Scenario 3: Moderate Maintenance Required
    {
      severity: "Medium",
      risk_score: 3,
      message: "Your vehicle requires moderate maintenance. Address these issues within the next 30 days to prevent further damage.",
      next_service_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      recommendations: [
        {
          component: "Engine Oil & Filter",
          urgency: "Medium",
          reason: "Oil has exceeded recommended change interval. Continuing use may increase engine wear.",
          estimated_cost: "₹2,500 - ₹3,500",
          severity_cause: "Extended oil change interval + high temperatures causing faster oil degradation",
          action_needed: "Schedule oil change within 2 weeks. Use synthetic oil for better heat resistance in Indian climate."
        },
        {
          component: "Front Brake Pads",
          urgency: "Medium",
          reason: "Brake pad thickness at 30%. Heavy city traffic has accelerated wear pattern.",
          estimated_cost: "₹3,500 - ₹5,500",
          severity_cause: "Frequent stop-and-go traffic causing accelerated brake pad wear",
          action_needed: "Replace front brake pads within 30 days. Inspect brake rotors for scoring or damage."
        },
        {
          component: "Battery Health",
          urgency: "Medium",
          reason: "Battery voltage fluctuating. May fail unexpectedly, especially in extreme heat.",
          estimated_cost: "₹4,000 - ₹8,000",
          severity_cause: "High ambient temperatures and frequent short trips not allowing full charge cycles",
          action_needed: "Get battery load tested. Consider replacement if test shows weak cells."
        }
      ],
      ai_summary: {
        health_score: 68,
        insights: [
          { icon: '⚠️', label: 'Engine Oil', value: 'Change Due', severity: 'medium' },
          { icon: '⚠️', label: 'Brake Pads', value: '30% Left', severity: 'medium' },
          { icon: '⚠️', label: 'Battery', value: 'Weak', severity: 'medium' },
          { icon: '✅', label: 'Tire Condition', value: 'Good', severity: 'low' }
        ],
        maintenance_timeline: [
          { date: '15 days', task: 'Oil Change', priority: 'medium' },
          { date: '30 days', task: 'Brake Pads', priority: 'medium' },
          { date: '30 days', task: 'Battery Test', priority: 'medium' }
        ]
      }
    },

    // Scenario 4: Urgent Attention Required
    {
      severity: "High",
      risk_score: 4,
      message: "⚠️ URGENT: Your vehicle requires immediate attention. Multiple critical issues detected that could lead to breakdown or safety concerns.",
      next_service_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      recommendations: [
        {
          component: "Suspension System",
          urgency: "High",
          reason: "Shock absorbers severely worn. Vehicle handling compromised, especially on bad roads.",
          estimated_cost: "₹8,000 - ₹15,000",
          severity_cause: "Extensive pothole damage and rough road conditions causing shock absorber failure",
          action_needed: "IMMEDIATE REPAIR REQUIRED. Replace all shock absorbers. Avoid highway driving until fixed."
        },
        {
          component: "Transmission Fluid",
          urgency: "High",
          reason: "Transmission fluid dark and burnt. Gear shifting becoming rough and delayed.",
          estimated_cost: "₹5,000 - ₹12,000",
          severity_cause: "Overheating due to heavy traffic and lack of fluid change",
          action_needed: "Schedule transmission service within 7 days. Flush old fluid completely and replace with manufacturer-recommended fluid."
        },
        {
          component: "Tire Tread Depth",
          urgency: "High",
          reason: "Front tires at minimum legal tread depth (1.6mm). Dangerous in wet conditions.",
          estimated_cost: "₹6,000 - ₹12,000",
          severity_cause: "Uneven wear from misalignment and pothole impacts. Monsoon approaching.",
          action_needed: "REPLACE TIRES IMMEDIATELY. Do not drive in rain with current tires. Get wheel alignment done."
        },
        {
          component: "Coolant System",
          urgency: "High",
          reason: "Coolant level critically low. Engine overheating risk in summer heat.",
          estimated_cost: "₹2,000 - ₹5,000",
          severity_cause: "Possible coolant leak or evaporation due to extreme heat",
          action_needed: "Top up coolant immediately. Inspect for leaks. Check radiator cap and hoses."
        }
      ],
      ai_summary: {
        health_score: 45,
        insights: [
          { icon: '🚨', label: 'Suspension', value: 'Critical', severity: 'high' },
          { icon: '🚨', label: 'Transmission', value: 'Urgent', severity: 'high' },
          { icon: '🚨', label: 'Tire Safety', value: 'Replace Now', severity: 'high' },
          { icon: '⚠️', label: 'Coolant Level', value: 'Low', severity: 'high' }
        ],
        maintenance_timeline: [
          { date: 'Within 3 days', task: 'Tire Replacement', priority: 'high' },
          { date: 'Within 7 days', task: 'Suspension Repair', priority: 'high' },
          { date: 'Within 7 days', task: 'Transmission Service', priority: 'high' },
          { date: 'Immediate', task: 'Coolant Top-up', priority: 'high' }
        ]
      }
    },

    // Scenario 5: Critical Condition
    {
      severity: "Critical",
      risk_score: 5,
      message: "🚨 CRITICAL WARNING: Your vehicle has severe mechanical issues. Drive only to nearest service center. Continuing use may cause complete breakdown or safety hazards.",
      next_service_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      recommendations: [
        {
          component: "Brake System Failure",
          urgency: "Critical",
          reason: "Brake fluid contaminated with moisture. Rear brake cylinder leaking. Brake pedal feels spongy.",
          estimated_cost: "₹10,000 - ₹20,000",
          severity_cause: "Complete brake system neglect. Moisture ingress causing internal corrosion. Monsoon exposure without maintenance.",
          action_needed: "DO NOT DRIVE. Tow vehicle to service center. Complete brake system overhaul required including master cylinder, brake lines, and all calipers."
        },
        {
          component: "Engine Knocking",
          urgency: "Critical",
          reason: "Severe engine knocking detected. Metal-on-metal sounds indicating major internal damage.",
          estimated_cost: "₹40,000 - ₹100,000",
          severity_cause: "Prolonged oil starvation causing bearing failure. Possible piston damage from overheating.",
          action_needed: "STOP DRIVING IMMEDIATELY. Engine rebuild or replacement required. Continuing use will result in catastrophic engine failure."
        },
        {
          component: "Steering System",
          urgency: "Critical",
          reason: "Power steering making loud noises. Steering wheel vibrating severely. Possible rack damage.",
          estimated_cost: "₹15,000 - ₹35,000",
          severity_cause: "Power steering fluid leak combined with pothole damage to steering rack",
          action_needed: "UNSAFE TO DRIVE. Get vehicle towed. Complete steering system inspection and repair required."
        }
      ],
      ai_summary: {
        health_score: 25,
        insights: [
          { icon: '🚨', label: 'Brake System', value: 'FAILED', severity: 'high' },
          { icon: '🚨', label: 'Engine', value: 'CRITICAL', severity: 'high' },
          { icon: '🚨', label: 'Steering', value: 'DAMAGED', severity: 'high' },
          { icon: '🚨', label: 'Safety Risk', value: 'EXTREME', severity: 'high' }
        ],
        maintenance_timeline: [
          { date: 'IMMEDIATE', task: 'Brake System Overhaul', priority: 'high' },
          { date: 'IMMEDIATE', task: 'Engine Inspection', priority: 'high' },
          { date: 'IMMEDIATE', task: 'Steering Repair', priority: 'high' }
        ]
      }
    }
  ];

  // Randomly select a scenario
  const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  // Generate detailed AI analysis based on scenario
  const generateAnalysis = (scenario) => {
    if (scenario.risk_score <= 1) {
      return `AI MAINTENANCE ANALYSIS (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 EXCELLENT VEHICLE CONDITION

✅ COMPREHENSIVE HEALTH CHECK:
Your vehicle is performing exceptionally well! All critical systems are functioning within optimal parameters.

✨ KEY HIGHLIGHTS:
• Engine: Operating smoothly with no abnormal sounds or vibrations
• Transmission: Gear changes are seamless and responsive
• Brakes: Excellent stopping power with even pad wear
• Suspension: No signs of wear, handling is stable
• Electrical: All systems functioning perfectly

🛡️ MAINTENANCE STATUS:
• All fluid levels: OPTIMAL
• Tire condition: EXCELLENT (good tread depth, proper inflation)
• Battery health: STRONG (holds charge well)
• Air filters: CLEAN
• Belts & hoses: NO CRACKS OR WEAR

🌟 CONGRATULATIONS!
You're maintaining your vehicle excellently. Keep up the good work!

RECOMMENDATION:
Continue your current maintenance schedule. Next routine check-up in 90 days.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }
    
    if (scenario.risk_score === 2) {
      return `AI MAINTENANCE ANALYSIS (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VEHICLE HEALTH: GOOD WITH MINOR ATTENTION NEEDED

OVERALL ASSESSMENT:
Your vehicle is in good condition. A few minor items need attention for optimal performance.

DETAILED FINDINGS:
${scenario.recommendations.map(rec => `
• ${rec.component}:
  Severity Cause: ${rec.severity_cause}
  Action Needed: ${rec.action_needed}
  Estimated Cost: ${rec.estimated_cost}
`).join('')}

INDIAN DRIVING CONDITIONS IMPACT:
✓ Dust/pollution: Moderate (filters need regular monitoring)
✓ Road conditions: Good (no major suspension stress)
✓ Weather preparedness: Monsoon season approaching

MAINTENANCE PRIORITY:
These are preventive measures. Address them at your convenience to maintain peak performance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (scenario.risk_score === 3) {
      return `AI MAINTENANCE ANALYSIS (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VEHICLE HEALTH: MODERATE - MAINTENANCE REQUIRED

⚠️ ATTENTION REQUIRED:
Your vehicle has several components approaching their service limits. Address these within 30 days.

CRITICAL FINDINGS:
${scenario.recommendations.map(rec => `
🔧 ${rec.component}:
   SEVERITY CAUSE: ${rec.severity_cause}
   
   ACTION NEEDED: ${rec.action_needed}
   
   URGENCY: ${rec.urgency}
   COST: ${rec.estimated_cost}
`).join('\n')}

INDIAN ROAD CONDITIONS IMPACT:
⚠️ Pothole density: High (suspension stress detected)
⚠️ Traffic congestion: Severe (increases brake wear)
⚠️ Temperature: Extreme heat affecting oil/battery life
⚠️ Dust/pollution: High (filter replacement critical)

RECOMMENDATION:
Schedule service within 2-3 weeks to prevent minor issues from becoming major repairs.

COST OPTIMIZATION:
Bundle these services together to save 15-20% on labor costs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (scenario.risk_score === 4) {
      return `AI MAINTENANCE ANALYSIS (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 URGENT VEHICLE CONDITION ALERT

⛔ IMMEDIATE ATTENTION REQUIRED:
Multiple critical issues detected. Your vehicle requires urgent maintenance to ensure safety.

URGENT REPAIRS NEEDED:
${scenario.recommendations.map(rec => `
🚨 ${rec.component} - ${rec.urgency.toUpperCase()} PRIORITY

   SEVERITY CAUSE:
   ${rec.severity_cause}
   
   IMMEDIATE ACTION REQUIRED:
   ${rec.action_needed}
   
   SAFETY IMPACT: High - affects vehicle safety and reliability
   ESTIMATED COST: ${rec.estimated_cost}
   DEADLINE: Within 7 days
`).join('\n')}

⚠️ SAFETY WARNING:
These issues significantly impact vehicle safety. Avoid long trips until repairs are completed.

BREAKDOWN RISK: HIGH
Continuing to drive without addressing these issues may result in:
• Unexpected breakdown
• Increased repair costs (preventive maintenance much cheaper)
• Safety hazards for occupants
• Potential damage to other vehicle components

EMERGENCY RECOMMENDATION:
Drive directly to nearest authorized service center. Do not delay repairs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    // Critical scenario (risk_score === 5)
    return `AI MAINTENANCE ANALYSIS (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨🚨🚨 CRITICAL VEHICLE EMERGENCY 🚨🚨🚨

⛔ DO NOT DRIVE - SEVERE MECHANICAL FAILURES DETECTED

CRITICAL SYSTEM FAILURES:
${scenario.recommendations.map(rec => `
🆘 ${rec.component} - CRITICAL FAILURE

   ROOT CAUSE:
   ${rec.severity_cause}
   
   REQUIRED ACTION:
   ${rec.action_needed}
   
   DANGER LEVEL: EXTREME
   REPAIR COST: ${rec.estimated_cost}
   TIMELINE: IMMEDIATE - TOW TO SERVICE CENTER
`).join('\n')}

🚨 SAFETY ALERT:
This vehicle is UNSAFE to drive. Operating it poses serious risks:
• Catastrophic mechanical failure
• Risk of accidents
• Injury to occupants
• Complete engine/system destruction
• Exponentially increasing repair costs

IMMEDIATE STEPS:
1. DO NOT START THE ENGINE
2. Call roadside assistance/towing service
3. Have vehicle towed to authorized service center
4. Request comprehensive inspection
5. Prepare for major repairs or component replacement

⚠️ COST WARNING:
Delaying repairs will likely DOUBLE or TRIPLE the repair costs due to cascading damage to other systems.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URGENT: Contact your mechanic immediately for emergency assessment.`;
  };

  return {
    ...selectedScenario,
    ai_analysis: generateAnalysis(selectedScenario),
    message: `${selectedScenario.message} (Demo Mode - Random scenario generated for testing)`
  };
};

const getSuggestions = async () => {
  try {
    const response = await api.get('/ai/maintenance/suggestions');
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance suggestions:', error);
    
    // Return dynamic demo data when API is unavailable
    return generateDynamicScenario();
  }
};

const getVehicleMaintenance = async (vehicleId) => {
  try {
    const response = await api.get(`/ai/maintenance/vehicle/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle maintenance:', error);
    throw error;
  }
};

const predictMaintenance = async (vehicleId) => {
  try {
    const response = await api.post('/ai/predict', null, {
      params: { vehicle_id: vehicleId }
    });
    return response.data;
  } catch (error) {
    console.error('Error predicting maintenance:', error);
    throw error;
  }
};

export default { 
  getSuggestions, 
  getVehicleMaintenance,
  predictMaintenance 
};