import React from 'react';
import { 
  Sparkles, 
  ChefHat, 
  Laptop, 
  Flower, 
  Music, 
  Hammer, 
  Car, 
  Package 
} from 'lucide-react';

const categoryIcons = {
  'Limpeza': Sparkles,
  'Culinária': ChefHat,
  'Tecnologia': Laptop,
  'Jardim': Flower,
  'Música': Music,
  'Reforma': Hammer,
  'Transporte': Car,
  'Organização': Package
} as const;

interface CategoryIconProps {
  category?: string;
  name?: string;
  className?: string;
}

export function CategoryIcon({ category, name, className = "h-4 w-4" }: CategoryIconProps) {
  const categoryName = category || name || '';
  const IconComponent = categoryIcons[categoryName as keyof typeof categoryIcons];
  
  if (!IconComponent) {
    return <Package className={className} />;
  }
  
  return <IconComponent className={className} />;
}