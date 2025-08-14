import React from 'react';
import { 
  Heart, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Star, 
  Phone, 
  MessageCircle,
  Calendar,
  User,
  Shield,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Service } from '@/data/mock';
import { useFavoritesStore } from '@/stores/favorites';
import { useTransactionStore } from '@/stores/transactions';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ServiceDetailsCardProps {
  service: Service;
  trigger?: React.ReactNode;
}

export function ServiceDetailsCard({ service, trigger }: ServiceDetailsCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addTransaction } = useTransactionStore();
  const isServiceFavorited = isFavorite(service.id);

  const handleFavoriteToggle = () => {
    toggleFavorite(service.id);
    if (!isServiceFavorited) {
      toast.success('Serviço adicionado aos favoritos! ❤️');
    } else {
      toast.success('Serviço removido dos favoritos');
    }
  };

  const handleRequestService = () => {
    const newTransaction = {
      id: `t${Date.now()}`,
      service: { 
        title: service.title, 
        category: service.category 
      },
      provider: { 
        name: service.provider.name, 
        avatarUrl: service.provider.avatar 
      },
      hours: parseFloat(service.timeRequired.replace(/[^\d.]/g, '')),
      date: new Date(),
      status: 'pending' as const,
      type: 'spent' as const
    };
    
    addTransaction(newTransaction);
    toast.success('Solicitação enviada com sucesso! 🎉');
  };

  // Mock additional data that would come from a real API
  const providerDetails = {
    rating: 4.8,
    completedServices: 127,
    joinedDate: 'Março 2023',
    verified: true,
    responseTime: '2 horas',
    location: `${service.zone}, Rio de Janeiro`,
    bio: 'Profissional experiente com mais de 5 anos no mercado. Sempre pontual e dedicado a oferecer o melhor serviço.',
    skills: ['Pontualidade', 'Qualidade', 'Comunicação'],
    availability: ['Segunda a Sexta: 8h-18h', 'Sábado: 8h-14h']
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Ver detalhes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {service.title}
            {service.isUrgent && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="w-3 h-3 mr-1" />
                Urgente
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Detalhes do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Duração:</strong> {service.timeRequired}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Distância:</strong> {service.distance}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline">{service.category}</Badge>
                <Badge variant="outline">{service.zone}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Provider Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Sobre o Prestador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-rio text-white text-xl">
                    {service.provider.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{service.provider.name}</h3>
                    {providerDetails.verified && (
                      <Shield className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{providerDetails.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>{providerDetails.completedServices} serviços</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {providerDetails.joinedDate}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {providerDetails.bio}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Localização</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {providerDetails.location}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tempo de Resposta</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {providerDetails.responseTime}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-2">
                  {providerDetails.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Disponibilidade</h4>
                <div className="space-y-1">
                  {providerDetails.availability.map((time, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {time}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Localização e Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Região</h4>
                  <p className="text-sm text-muted-foreground">{service.zone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Distância</h4>
                  <p className="text-sm text-muted-foreground">{service.distance} de você</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Transporte</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">🚇 Metrô próximo</Badge>
                  <Badge variant="outline" className="text-xs">🚌 Ônibus disponível</Badge>
                  <Badge variant="outline" className="text-xs">🚗 Estacionamento</Badge>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Dica:</strong> O prestador está localizado em uma área de fácil acesso, 
                  com boa infraestrutura de transporte público e opções de estacionamento.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleRequestService}
              className="btn-rio flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Solicitar Serviço
            </Button>
            
            <Button
              variant="outline"
              onClick={handleFavoriteToggle}
              className={cn(
                "heart-pulse",
                isServiceFavorited && "favorited border-destructive"
              )}
            >
              <Heart 
                className={cn(
                  "w-4 h-4",
                  isServiceFavorited ? "fill-destructive text-destructive" : "text-muted-foreground"
                )}
              />
            </Button>
            
            <Button variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Contato
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}