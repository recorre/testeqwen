import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionCard } from "@/components/cards/TransactionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth";
import { formatBrazilianDate } from "@/lib/utils";

interface Transaction {
  id: string;
  time_amount: number;
  description: string;
  transaction_type: string;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  from_profile: {
    name: string;
    avatar_url: string;
  };
  to_profile: {
    name: string;
    avatar_url: string;
  };
  service_requests?: {
    services: {
      title: string;
    };
  };
}

interface Stats {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  totalTransactions: number;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEarned: 0,
    totalSpent: 0,
    currentBalance: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchStats();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          from_profile:profiles!transactions_from_user_id_fkey(name, avatar_url),
          to_profile:profiles!transactions_to_user_id_fkey(name, avatar_url),
          service_requests(
            services(title)
          )
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar seu histórico de transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get current balance from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("time_balance")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Calculate earned and spent from transactions
      const { data: earnedData, error: earnedError } = await supabase
        .from("transactions")
        .select("time_amount")
        .eq("to_user_id", user.id);

      const { data: spentData, error: spentError } = await supabase
        .from("transactions")
        .select("time_amount")
        .eq("from_user_id", user.id);

      if (earnedError || spentError) throw earnedError || spentError;

      const totalEarned = earnedData?.reduce((sum, t) => sum + t.time_amount, 0) || 0;
      const totalSpent = spentData?.reduce((sum, t) => sum + t.time_amount, 0) || 0;
      const totalTransactions = (earnedData?.length || 0) + (spentData?.length || 0);

      setStats({
        totalEarned,
        totalSpent,
        currentBalance: profile?.time_balance || 0,
        totalTransactions
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Histórico de Transações
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe suas trocas de tempo e saldo atual
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-rio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <p className="text-2xl font-bold text-primary">
                      {stats.currentBalance}h
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
                    <p className="text-sm text-muted-foreground">Tempo Ganho</p>
                    <p className="text-2xl font-bold text-secondary">
                      {stats.totalEarned}h
                    </p>
                  </div>
                  <ArrowDownLeft className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-rio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Gasto</p>
                    <p className="text-2xl font-bold text-destructive">
                      {stats.totalSpent}h
                    </p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-rio">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transações</p>
                    <p className="text-2xl font-bold">
                      {stats.totalTransactions}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card className="card-rio">
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Nenhuma transação encontrada"
                  description="Você ainda não possui transações em seu histórico. Comece oferecendo ou solicitando serviços!"
                />
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={{
                        id: transaction.id,
                        service: {
                          title: transaction.service_requests?.services?.title || transaction.description,
                          category: "Geral"
                        },
                        provider: {
                          name: transaction.from_profile?.name || transaction.to_profile?.name || "Usuário",
                          avatarUrl: transaction.from_profile?.avatar_url || transaction.to_profile?.avatar_url || ""
                        },
                        hours: transaction.time_amount,
                        date: new Date(transaction.created_at),
                        status: "completed" as const,
                        type: transaction.from_user_id === user?.id ? "spent" as const : "earned" as const
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}