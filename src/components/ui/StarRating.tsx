import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'sm', 
  showValue = false,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index + 1 <= rating;
          const isHalfFilled = index + 0.5 === rating;
          
          return (
            <Star
              key={index}
              className={cn(
                sizeClasses[size],
                "transition-colors",
                isFilled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : isHalfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className={cn("text-muted-foreground ml-1", textSizeClasses[size])}>
          ({rating})
        </span>
      )}
    </div>
  );
}