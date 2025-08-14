import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, TrendingUp, Users, CheckCircle, XCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth";
import { formatBrazilianDate } from "@/lib/utils";

interface DashboardStats {
  timeBalance: number;
  totalServices: number;
  pendingRequests: number;
  completedExchanges: number;
}

interface ServiceRequest {
  id: string;
  description: string;
  requested_hours: number;
  total_time_cost: number;
  status: string;
  created_at: string;
  requester_profile: {
    name: string;
    avatar_url: string;
  };
  provider_profile: {
    name: string;
    avatar_url: string;
  };
  services: {
    title: string;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    timeBalance: 0,
    totalServices: 0,
    pendingRequests: 0,
    completedExchanges: 0
  });
  const [myServices, setMyServices] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState<ServiceRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("time_balance")
        .eq("id", user.id)
        .single();

      // Fetch user's services
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("provider_id", user.id)
        .eq("is_active", true);

      // Fetch pending requests (received)
      const { data: received } = await supabase
        .from("service_requests")
        .select(`
          *,
          requester_profile:profiles!service_requests_requester_id_fkey(name, avatar_url),
          provider_profile:profiles!service_requests_provider_id_fkey(name, avatar_url),
          services(title)
        `)
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch sent requests
      const { data: sent } = await supabase
        .from("service_requests")
        .select(`
          *,
          requester_profile:profiles!service_requests_requester_id_fkey(name, avatar_url),
          provider_profile:profiles!service_requests_provider_id_fkey(name, avatar_url),
          services(title)
        `)
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch completed exchanges count
      const { data: transactions } = await supabase
        .from("transactions")
        .select("id")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

      setStats({
        timeBalance: profile?.time_balance || 0,
        totalServices: services?.length || 0,
        pendingRequests: received?.filter(r => r.status === 'pending').length || 0,
        completedExchanges: transactions?.length || 0
      });

      setMyServices(services || []);
      setReceivedRequests(received || []);
      setSentRequests(sent || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ 
          status: action === 'accept' ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: action === 'accept' ? "Solicitação aceita!" : "Solicitação rejeitada",
        description: action === 'accept' 
          ? "A solicitação foi aceita. O solicitante será notificado."
          : "A solicitação foi rejeitada.",
      });

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const completeService = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('complete_service_request', {
        request_id: requestId
      });

      if (error) throw error;

      toast({
        title: "Serviço concluído!",
        description: "A transação foi processada e o tempo foi transferido.",
      });

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Erro ao concluir serviço",
        description: "Não foi possível concluir o serviço. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceito';
      case 'completed': return 'Concluído';
      case 'rejected': return 'Rejeitado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-rio animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Meu Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus serviços e acompanhe suas trocas de tempo
              </p>
            </div>
            <Button
              onClick={() => navigate("/services/new")}
              className="btn-rio"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-rio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo de Tempo</p>
                    <p className="text-2xl font-bold text-primary">
                      {stats.timeBalance}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-rio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meus Serviços</p>
                    <p className="text-2xl font-bold">
                      {stats.totalServices}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-rio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Solicitações Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pendingRequests}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-rio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trocas Realizadas</p>
                    <p className="text-2xl font-bold text-secondary">
                      {stats.completedExchanges}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requests">Solicitações Recebidas</TabsTrigger>
              <TabsTrigger value="sent">Solicitações Enviadas</TabsTrigger>
              <TabsTrigger value="services">Meus Serviços</TabsTrigger>
            </TabsList>

            {/* Received Requests */}
            <TabsContent value="requests" className="space-y-4">
              <Card className="card-rio">
                <CardHeader>
                  <CardTitle>Solicitações para Meus Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  {receivedRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhuma solicitação recebida ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {receivedRequests.map((request) => (
                        <div key={request.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{request.services.title}</h4>
                                <Badge className={getStatusColor(request.status)}>
                                  {getStatusLabel(request.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Solicitado por: {request.requester_profile.name}
                              </p>
                              {request.description && (
                                <p className="text-sm mb-2">{request.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{request.requested_hours}h solicitadas</span>
                                <span>Custo: {request.total_time_cost}h</span>
                                <span>{formatBrazilianDate(new Date(request.created_at))}</span>
                              </div>
                            </div>
                            
                            {request.status === 'pending' && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRequestAction(request.id, 'reject')}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestAction(request.id, 'accept')}
                                  className="btn-rio"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {request.status === 'accepted' && (
                              <Button
                                size="sm"
                                onClick={() => completeService(request.id)}
                                className="btn-nature ml-4"
                              >
                                Marcar como Concluído
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sent Requests */}
            <TabsContent value="sent" className="space-y-4">
              <Card className="card-rio">
                <CardHeader>
                  <CardTitle>Minhas Solicitações</CardTitle>
                </CardHeader>
                <CardContent>
                  {sentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Você ainda não fez nenhuma solicitação
                      </p>
                      <Button
                        onClick={() => navigate("/services")}
                        className="mt-4 btn-rio"
                      >
                        Explorar Serviços
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sentRequests.map((request) => (
                        <div key={request.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{request.services.title}</h4>
                                <Badge className={getStatusColor(request.status)}>
                                  {getStatusLabel(request.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Prestador: {request.provider_profile.name}
                              </p>
                              {request.description && (
                                <p className="text-sm mb-2">{request.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{request.requested_hours}h solicitadas</span>
                                <span>Custo: {request.total_time_cost}h</span>
                                <span>{formatBrazilianDate(new Date(request.created_at))}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Services */}
            <TabsContent value="services" className="space-y-4">
              <Card className="card-rio">
                <CardHeader>
                  <CardTitle>Meus Serviços Oferecidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {myServices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Você ainda não ofereceu nenhum serviço
                      </p>
                      <Button
                        onClick={() => navigate("/services/new")}
                        className="btn-rio"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ofertar Primeiro Serviço
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myServices.map((service: any) => (
                        <div key={service.id} className="relative">
                          <ServiceCard
                            service={{
                              ...service,
                              profiles: { name: "Você", avatar_url: "" },
                              service_categories: { name: "Categoria", icon: "Circle" }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/services/${service.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}