import { ClientStatus } from '@/types/clients';

export interface StatusRule {
  condition: (client: any) => boolean;
  status: ClientStatus;
  priority: number; // Higher number = higher priority
  reason: string;
}

export const statusRules: StatusRule[] = [
  {
    condition: (client) => {
      const lastActivity = client.last_activity_date ? new Date(client.last_activity_date) : null;
      const daysSinceActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      // More than 30 days without activity and no medical clearance
      return daysSinceActivity > 30 && !client.medical_clearance;
    },
    status: 'at_risk',
    priority: 10,
    reason: 'No activity for 30+ days and missing medical clearance'
  },
  {
    condition: (client) => {
      const lastActivity = client.last_activity_date ? new Date(client.last_activity_date) : null;
      const daysSinceActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      return daysSinceActivity > 21;
    },
    status: 'at_risk',
    priority: 8,
    reason: 'No activity for 21+ days'
  },
  {
    condition: (client) => {
      const lastActivity = client.last_activity_date ? new Date(client.last_activity_date) : null;
      const daysSinceActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      return daysSinceActivity > 14;
    },
    status: 'needs_attention',
    priority: 6,
    reason: 'No activity for 14+ days'
  },
  {
    condition: (client) => !client.onboarding_completed,
    status: 'needs_attention',
    priority: 7,
    reason: 'Onboarding not completed'
  },
  {
    condition: (client) => {
      // Check if client has overdue goals
      const overdueGoals = client.goals?.filter((goal: any) => {
        const targetDate = new Date(goal.target_date);
        const today = new Date();
        return targetDate < today && goal.status !== 'completed';
      }) || [];
      
      return overdueGoals.length > 0;
    },
    status: 'needs_attention',
    priority: 5,
    reason: 'Has overdue goals'
  },
  {
    condition: (client) => {
      // Check if client has critical medical conditions without clearance
      const hasCriticalConditions = client.medical_conditions?.some((condition: string) => {
        const critical = ['heart disease', 'diabetes', 'hypertension', 'heart condition'];
        return critical.some(c => condition.toLowerCase().includes(c));
      });
      
      return hasCriticalConditions && !client.medical_clearance;
    },
    status: 'needs_attention',
    priority: 9,
    reason: 'Critical medical conditions without clearance'
  },
  {
    condition: (client) => {
      // Check if client has negative progress trend
      if (!client.measurements || client.measurements.length < 3) return false;
      
      const sortedMeasurements = client.measurements
        .filter((m: any) => m.weight_kg)
        .sort((a: any, b: any) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime())
        .slice(0, 3);
      
      if (sortedMeasurements.length < 3) return false;
      
      // Check if weight has been consistently increasing (for weight loss goals)
      const isWeightLossGoal = client.primary_goal?.toLowerCase().includes('lose') || 
                              client.primary_goal?.toLowerCase().includes('weight loss');
      
      if (isWeightLossGoal) {
        const trend = sortedMeasurements.every((curr: any, idx: number) => {
          if (idx === sortedMeasurements.length - 1) return true;
          const prev = sortedMeasurements[idx + 1];
          return curr.weight_kg >= prev.weight_kg;
        });
        return trend;
      }
      
      return false;
    },
    status: 'needs_attention',
    priority: 4,
    reason: 'Negative progress trend detected'
  },
  {
    condition: (client) => {
      const lastActivity = client.last_activity_date ? new Date(client.last_activity_date) : null;
      const daysSinceActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      return daysSinceActivity <= 7 && client.onboarding_completed;
    },
    status: 'active',
    priority: 1,
    reason: 'Regular activity and completed onboarding'
  }
];

export function calculateClientStatus(client: any): {
  status: ClientStatus;
  reason: string;
  confidence: number;
  recommendations: string[];
} {
  // Don't auto-calculate status if manually set to inactive or paused
  if (client.status === 'inactive' || client.status === 'paused') {
    return {
      status: client.status,
      reason: 'Manually set status',
      confidence: 100,
      recommendations: []
    };
  }
  
  // Find the highest priority rule that matches
  const matchingRules = statusRules
    .filter(rule => rule.condition(client))
    .sort((a, b) => b.priority - a.priority);
  
  if (matchingRules.length === 0) {
    return {
      status: 'active',
      reason: 'Default status - no specific conditions detected',
      confidence: 50,
      recommendations: ['Consider adding more activity tracking', 'Schedule regular check-ins']
    };
  }
  
  const primaryRule = matchingRules[0];
  const confidence = Math.min(95, 60 + (matchingRules.length * 10));
  
  const recommendations = generateRecommendations(client, primaryRule.status);
  
  return {
    status: primaryRule.status,
    reason: primaryRule.reason,
    confidence,
    recommendations
  };
}

function generateRecommendations(client: any, status: ClientStatus): string[] {
  const recommendations: string[] = [];
  
  const lastActivity = client.last_activity_date ? new Date(client.last_activity_date) : null;
  const daysSinceActivity = lastActivity 
    ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  switch (status) {
    case 'at_risk':
      if (daysSinceActivity > 21) {
        recommendations.push('Schedule an immediate check-in call');
        recommendations.push('Send motivational message and goal reassessment');
      }
      if (!client.medical_clearance) {
        recommendations.push('Require medical clearance before resuming training');
      }
      recommendations.push('Consider adjusting training program difficulty');
      recommendations.push('Investigate barriers to participation');
      break;
      
    case 'needs_attention':
      if (daysSinceActivity > 7) {
        recommendations.push('Send friendly check-in message');
        recommendations.push('Offer schedule flexibility or program adjustments');
      }
      if (!client.onboarding_completed) {
        recommendations.push('Complete onboarding process');
        recommendations.push('Schedule onboarding call');
      }
      if (client.goals?.some((g: any) => new Date(g.target_date) < new Date() && g.status !== 'completed')) {
        recommendations.push('Review and update goal timelines');
        recommendations.push('Celebrate partial progress and reset expectations');
      }
      break;
      
    case 'active':
      recommendations.push('Continue current engagement strategy');
      recommendations.push('Consider introducing new challenges or goals');
      if (daysSinceActivity <= 3) {
        recommendations.push('Acknowledge recent consistency');
      }
      break;
      
    case 'paused':
    case 'inactive':
      recommendations.push('Status set manually - review periodically');
      break;
  }
  
  // General recommendations based on client data
  if (!client.latest_measurement || 
      (client.latest_measurement.measurement_date && 
       Math.floor((Date.now() - new Date(client.latest_measurement.measurement_date).getTime()) / (1000 * 60 * 60 * 24)) > 30)) {
    recommendations.push('Schedule progress measurement session');
  }
  
  if (!client.photos || client.photos.length === 0) {
    recommendations.push('Encourage progress photo documentation');
  }
  
  return recommendations.slice(0, 4); // Limit to top 4 recommendations
}

export function getStatusDisplay(status: ClientStatus) {
  const displays = {
    active: {
      label: 'Active',
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Client is actively engaged and making progress'
    },
    needs_attention: {
      label: 'Needs Attention',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Client requires check-in or intervention'
    },
    at_risk: {
      label: 'At Risk',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Client may discontinue or has concerning patterns'
    },
    paused: {
      label: 'Paused',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Client temporarily suspended training'
    },
    inactive: {
      label: 'Inactive',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Client no longer active or archived'
    }
  };
  
  return displays[status];
}

export function getStatusIcon(status: ClientStatus) {
  const icons = {
    active: '✓',
    needs_attention: '⚠️',
    at_risk: '🚨',
    paused: '⏸️',
    inactive: '⭕'
  };
  
  return icons[status];
}

export interface StatusTransition {
  from: ClientStatus;
  to: ClientStatus;
  reason: string;
  timestamp: Date;
  automatic: boolean;
}

export class ClientStatusManager {
  private transitions: StatusTransition[] = [];
  
  updateStatus(
    client: any,
    newStatus: ClientStatus,
    reason: string,
    automatic: boolean = false
  ): StatusTransition {
    const transition: StatusTransition = {
      from: client.status,
      to: newStatus,
      reason,
      timestamp: new Date(),
      automatic
    };
    
    this.transitions.push(transition);
    
    // In a real app, this would:
    // 1. Update the database
    // 2. Log the transition
    // 3. Trigger notifications
    // 4. Update any related systems
    
    console.log('Status transition:', transition);
    
    return transition;
  }
  
  getStatusHistory(clientId: string): StatusTransition[] {
    // In a real app, this would fetch from database
    return this.transitions.filter(t => t.from !== t.to);
  }
  
  shouldNotifyOnStatusChange(transition: StatusTransition): boolean {
    // Define which transitions warrant notifications
    const notifiableTransitions = [
      'active->needs_attention',
      'active->at_risk',
      'needs_attention->at_risk',
      'at_risk->active',
      'needs_attention->active'
    ];
    
    const transitionKey = `${transition.from}->${transition.to}`;
    return notifiableTransitions.includes(transitionKey);
  }
}

export const statusManager = new ClientStatusManager();