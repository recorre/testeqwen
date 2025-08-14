import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth";
import { formatBrazilianDate } from "@/lib/utils";

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  time_rate: number;
  location: string;
  availability: string;
  tags: string[];
  provider_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
    time_balance: number;
    experience_hours: number;
  };
  service_categories: {
    name: string;
    icon: string;
  };
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestDescription, setRequestDescription] = useState("");
  const [requestedHours, setRequestedHours] = useState(1);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          profiles!services_provider_id_fkey(name, avatar_url, time_balance, experience_hours),
          service_categories(name, icon)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      toast({
        title: "Serviço não encontrado",
        description: "O serviço solicitado não foi encontrado ou não está mais disponível.",
        variant: "destructive",
      });
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceRequest = async () => {
    if (!user || !service) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para solicitar um serviço.",
        variant: "destructive",
      });
      return;
    }

    if (user.id === service.provider_id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode solicitar seu próprio serviço.",
        variant: "destructive",
      });
      return;
    }

    const totalCost = requestedHours * service.time_rate;
    
    // Check if user has enough time balance
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("time_balance")
      .eq("id", user.id)
      .single();

    if (!userProfile || userProfile.time_balance < totalCost) {
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de ${totalCost} horas de tempo, mas tem apenas ${userProfile?.time_balance || 0} horas.`,
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        .insert({
          service_id: service.id,
          requester_id: user.id,
          provider_id: service.provider_id,
          description: requestDescription,
          requested_hours: requestedHours,
          total_time_cost: totalCost,
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada ao provedor do serviço. Você será notificado quando houver uma resposta.",
      });

      // Reset form
      setRequestDescription("");
      setRequestedHours(1);
    } catch (error) {
      toast({
        title: "Erro ao enviar solicitação",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card-rio animate-pulse">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const totalCost = requestedHours * service.time_rate;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/services")}
            className="btn-ghost mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Serviços
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-rio">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <CategoryIcon 
                    name={service.service_categories?.icon || "Circle"} 
                    className="h-8 w-8 text-primary mt-1" 
                  />
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <span className="category-badge">
                        {service.service_categories?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.time_rate}h/h
                      </span>
                      {service.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {service.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {service.availability && (
                  <div>
                    <h3 className="font-semibold mb-2">Disponibilidade</h3>
                    <p className="text-muted-foreground">{service.availability}</p>
                  </div>
                )}

                {service.tags && service.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Info */}
            <Card className="card-rio">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Prestador do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={service.profiles.avatar_url} />
                    <AvatarFallback>
                      {service.profiles.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{service.profiles.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{service.profiles.experience_hours}h de experiência</span>
                      <span>{service.profiles.time_balance}h de saldo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Membro desde {formatBrazilianDate(new Date(service.created_at))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Service */}
          <div className="lg:col-span-1">
            <Card className="card-rio sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Solicitar Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && user.id !== service.provider_id ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Horas necessárias
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={requestedHours}
                        onChange={(e) => setRequestedHours(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Descrição da solicitação
                      </label>
                      <Textarea
                        value={requestDescription}
                        onChange={(e) => setRequestDescription(e.target.value)}
                        placeholder="Descreva o que você precisa..."
                        rows={3}
                      />
                    </div>

                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Horas solicitadas:</span>
                        <span>{requestedHours}h</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa por hora:</span>
                        <span>{service.time_rate}h</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{totalCost}h de tempo</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleServiceRequest}
                      disabled={requesting || !requestDescription.trim()}
                      className="w-full btn-rio"
                    >
                      {requesting ? "Enviando..." : "Solicitar Serviço"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      {user ? 
                        "Este é seu serviço" : 
                        "Faça login para solicitar este serviço"
                      }
                    </p>
                    {!user && (
                      <Button
                        onClick={() => navigate("/login")}
                        className="mt-4 btn-rio"
                      >
                        Fazer Login
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}