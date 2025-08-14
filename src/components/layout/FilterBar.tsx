import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { zones, categories } from '@/data/mock';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  selectedZone?: string;
  selectedCategory?: string;
  categories?: any[];
  onZoneChange: (zone: string | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
}

export function FilterBar({ 
  selectedZone, 
  selectedCategory, 
  onZoneChange, 
  onCategoryChange 
}: FilterBarProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Zone Filters */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Região</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(
              "chip-filter cursor-pointer",
              !selectedZone && "active"
            )}
            onClick={() => onZoneChange(undefined)}
          >
            Todas
          </Badge>
          {zones.map((zone) => (
            <Badge
              key={zone}
              variant="outline"
              className={cn(
                "chip-filter cursor-pointer",
                selectedZone === zone && "active"
              )}
              onClick={() => onZoneChange(zone === selectedZone ? undefined : zone)}
            >
              {zone}
            </Badge>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Categoria</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(
              "chip-filter cursor-pointer",
              !selectedCategory && "active"
            )}
            onClick={() => onCategoryChange(undefined)}
          >
            Todas
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={cn(
                "chip-filter cursor-pointer flex items-center gap-1.5",
                selectedCategory === category && "active"
              )}
              onClick={() => onCategoryChange(category === selectedCategory ? undefined : category)}
            >
              <CategoryIcon category={category} className="h-3.5 w-3.5" />
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}