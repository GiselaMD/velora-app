export interface Point {
  x: number;
  y: number;
}

export class AngleCalculator {
  static calculateAngle(pointA: Point, pointB: Point, pointC: Point): number {
    const AB = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
    const BC = Math.sqrt(Math.pow(pointB.x - pointC.x, 2) + Math.pow(pointB.y - pointC.y, 2));
    const AC = Math.sqrt(Math.pow(pointC.x - pointA.x, 2) + Math.pow(pointC.y - pointA.y, 2));
    
    const angle = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
    return Math.round(angle * (180 / Math.PI));
  }

  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}