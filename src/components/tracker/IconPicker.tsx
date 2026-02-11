import React from 'react';
import {
  Droplets, Dumbbell, BookOpen, Brain, Heart, Sun,
  Moon, Coffee, Apple, Bike, Footprints, Pencil,
  Music, Leaf, Flame, Target, Clock, Smile,
  Zap, Star, Trophy, Gem, Sparkles, Shield,
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Droplets, Dumbbell, BookOpen, Brain, Heart, Sun,
  Moon, Coffee, Apple, Bike, Footprints, Pencil,
  Music, Leaf, Flame, Target, Clock, Smile,
  Zap, Star, Trophy, Gem, Sparkles, Shield,
};

interface HabitIconProps {
  name: string;
  className?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const Icon = iconMap[name] || Target;
  return <Icon className={className} />;
};

export { iconMap };
export default HabitIcon;
