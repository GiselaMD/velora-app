export class Formatter {
  static formatAngle(angle: number): string {
    return `${Math.round(angle)}°`;
  }

  static formatAdjustment(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}cm`;
  }

  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static truncate(str: string, length: number): string {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  }
}