import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Heart, User, MapPin, TrendingUp, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { TransactionCard } from '@/components/cards/TransactionCard';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { AccountDeletionDialog } from '@/components/forms/AccountDeletionDialog';
import { useAuthStore } from '@/stores/auth';
import { useFavoritesStore } from '@/stores/favorites';
import { useTransactionStore } from '@/stores/transactions';
import { mockServices } from '@/data/mock';
import { maskCPF, formatPhone } from '@/lib/utils';

const Profile = () => {
  const { user, profile } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const { transactions, completeTransaction, cancelTransaction, getTimeBalance } = useTransactionStore();
  const [animatedBalance, setAnimatedBalance] = useState(getTimeBalance());

  const favoriteServices = useMemo(() => {
    return mockServices.filter(service => favorites.includes(service.id));
  }, [favorites]);

  const totalEarned = transactions
    .filter(t => t.type === 'earned' && t.status === 'completed')
    .reduce((sum, t) => sum + t.hours, 0);

  const totalSpent = transactions
    .filter(t => t.type === 'spent' && t.status === 'completed')
    .reduce((sum, t) => sum + t.hours, 0);

  // Animate balance changes
  useEffect(() => {
    const newBalance = getTimeBalance();
    if (newBalance !== animatedBalance) {
      const startBalance = animatedBalance;
      const diff = newBalance - startBalance;
      const duration = 800;
      const steps = 30;
      const increment = diff / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setAnimatedBalance(newBalance);
          clearInterval(timer);
        } else {
          setAnimatedBalance(startBalance + (increment * currentStep));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [getTimeBalance()]);

  const handleCompleteTransaction = (id: string) => {
    completeTransaction(id);
  };

  const handleCancelTransaction = (id: string) => {
    cancelTransaction(id);
  };

  if (!user) return null;

  return (
    <MainLayout>
      {/* Profile Header */}
      <Card className="card-rio mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-rio text-white text-xl">
                {profile?.name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold">{profile?.name || user?.email}</h1>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{profile?.zone || 'Zona não informada'}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-2xl font-bold text-primary transition-all duration-300">
                  {Math.round(animatedBalance * 10) / 10}h
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Saldo disponível</p>
            </div>
          </div>

          {/* Profile Info */}
          {(profile?.cpf || profile?.phone) && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações pessoais
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {profile?.cpf && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPF:</span>
                    <span className="font-mono">{maskCPF(profile.cpf)}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-mono">{formatPhone(profile.phone)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-secondary">+{totalEarned}h</p>
              <p className="text-xs text-muted-foreground">Tempo ganho</p>
            </div>
            <div className="bg-destructive/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-destructive">-{totalSpent}h</p>
              <p className="text-xs text-muted-foreground">Tempo gasto</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favoritos ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionCard 
                key={transaction.id} 
                transaction={transaction}
                onComplete={handleCompleteTransaction}
                onCancel={handleCancelTransaction}
              />
            ))
          ) : (
            <Card className="card-rio">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhuma transação ainda</h3>
                <p className="text-muted-foreground">
                  Comece a trocar serviços para ver seu histórico aqui
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favoriteServices.length > 0 ? (
            favoriteServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card className="card-rio">
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum favorito ainda</h3>
                <p className="text-muted-foreground">
                  Adicione serviços aos favoritos para encontrá-los facilmente
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="card-rio">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações da conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-sm font-medium mb-3">Informações da conta</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo de conta:</span>
                    <span className="capitalize">{profile?.user_role || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horas de experiência:</span>
                    <span>{profile?.experience_hours || 0}h</span>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div>
                <h3 className="text-sm font-medium mb-3">Privacidade e segurança</h3>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Seus dados pessoais são protegidos e apenas você tem acesso a eles.
                    O CPF é mascarado para sua segurança.
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-3 text-destructive">Zona de perigo</h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    A exclusão da conta é permanente e não pode ser desfeita.
                  </p>
                  <AccountDeletionDialog>
                    <Button variant="destructive" size="sm" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Excluir conta permanentemente
                    </Button>
                  </AccountDeletionDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Profile;