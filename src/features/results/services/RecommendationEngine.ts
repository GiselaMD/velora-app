import type { AngleData } from '../../pose-analysis/types/pose.types';

export interface Recommendation {
  title: string;
  description: string;
  adjustment: string;
  icon: string;
  type: 'raise' | 'lower' | 'optimal';
}

export class RecommendationEngine {
  static getKneeAngleAdvice(angle: number): string {
    if (angle < 25)
      return "Your knee angle is too acute. Raise your saddle height for better power transfer.";
    if (angle > 35)
      return "Your knee angle is too obtuse. Lower your saddle height slightly for optimal pedaling.";
    return "Your knee angle is within the optimal range for efficient pedaling.";
  }

  static getHipAngleAdvice(angle: number): string {
    if (angle < 40)
      return "Your hip angle is too closed. Consider moving your saddle back or handlebars forward.";
    if (angle > 50)
      return "Your hip angle is too open. Try moving your saddle forward or handlebars back slightly.";
    return "Your hip angle is in a good range for comfort and power.";
  }

  static getBackAngleAdvice(angle: number): string {
    if (angle < 20)
      return "Your back is too flat. Adjust your handlebar height or reach for a more comfortable position.";
    if (angle > 45)
      return "Your back is too upright. Lower your handlebars or increase reach for better aerodynamics.";
    return "Your back angle is good for a balance of comfort and aerodynamics.";
  }

  static generateRecommendations(angles: AngleData): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Saddle height recommendations based on knee angle
    if (angles.kneeAngle < 25) {
      recommendations.push({
        title: "Raise Saddle Height",
        description: "Current position is too low",
        adjustment: "+2cm",
        icon: "↑",
        type: "raise"
      });
    } else if (angles.kneeAngle > 35) {
      recommendations.push({
        title: "Lower Saddle Height",
        description: "Current position is too high",
        adjustment: "-1cm",
        icon: "↓",
        type: "lower"
      });
    }

    // Handlebar recommendations based on back angle
    if (angles.backAngle > 45) {
      recommendations.push({
        title: "Adjust Handlebar Height",
        description: "Lower for better aerodynamics",
        adjustment: "-1cm",
        icon: "↓",
        type: "lower"
      });
    } else if (angles.backAngle < 20) {
      recommendations.push({
        title: "Raise Handlebar Height",
        description: "Increase for comfort",
        adjustment: "+1cm",
        icon: "↑",
        type: "raise"
      });
    }

    // If all angles are optimal
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Handlebar Reach",
        description: "Current position is optimal",
        adjustment: "",
        icon: "✓",
        type: "optimal"
      });
    }

    return recommendations;
  }
}