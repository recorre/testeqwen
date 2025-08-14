import React from 'react';
import { Heart, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { StarRating } from '@/components/ui/StarRating';
import { Service } from '@/data/mock';
import { useFavoritesStore } from '@/stores/favorites';
import { ServiceDetailsCard } from './ServiceDetailsCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isServiceFavorited = isFavorite(service.id);

  const handleFavoriteToggle = () => {
    toggleFavorite(service.id);
    if (!isServiceFavorited) {
      toast.success('Serviço adicionado aos favoritos! ❤️');
    } else {
      toast.success('Serviço removido dos favoritos');
    }
  };

  return (
    <Card className="card-rio hover:scale-[1.02] hover:shadow-glow transition-all duration-300 overflow-hidden cursor-pointer group">
      <ServiceDetailsCard 
        service={service}
        trigger={
          <CardContent className="p-0 w-full">
            <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{service.title}</h3>
                {service.isUrgent && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Urgente
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className={cn(
                "ml-2 p-2 heart-pulse",
                isServiceFavorited && "favorited"
              )}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isServiceFavorited ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"
                )}
              />
            </Button>
          </div>

          {/* Provider Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-rio flex items-center justify-center text-white font-medium">
              {service.provider.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{service.provider.name}</p>
                <StarRating rating={service.provider.rating} size="sm" showValue />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{service.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{service.timeRequired}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <CategoryIcon category={service.category} className="h-3 w-3" />
                {service.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {service.zone}
              </Badge>
            </div>
            
            <Button 
              size="sm" 
              className="btn-rio text-xs px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      </CardContent>
        }
      />
    </Card>
  );
}