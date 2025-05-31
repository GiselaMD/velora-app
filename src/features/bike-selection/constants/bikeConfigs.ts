import type { BikeOption } from "../types/bike.types";

export const bikeTypes: BikeOption[] = [
  {
    id: 'road',
    title: 'Road Bike',
    description: 'Perfect for speed and endurance',
    imageSrc: require('../../../../assets/images/road-bike.png'),
    icon: '🚴',
  },
  {
    id: 'time-trial',
    title: 'Time Trial Bike',
    description: 'Engineered for maximum speed',
    imageSrc: require('../../../../assets/images/tt-bike.png'),
    icon: '🕶️',
  },
  {
    id: 'mountain',
    title: 'Mountain Bike',
    description: 'Built for trails and adventure',
    imageSrc: require('../../../../assets/images/mountain-bike.png'),
    icon: '🚵',
  },
];