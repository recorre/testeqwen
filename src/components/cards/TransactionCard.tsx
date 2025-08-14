import React, { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Transaction } from '@/stores/transactions';
import { formatBrazilianDate, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TransactionCardProps {
  transaction: Transaction;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function TransactionCard({ transaction, onComplete, onCancel }: TransactionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  const handleMarkComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete?.(transaction.id);
      toast({
        title: "Transação concluída!",
        description: `${transaction.type === 'earned' ? '+' : '-'}${transaction.hours}h ${transaction.type === 'earned' ? 'adicionadas' : 'deduzidas'} do seu saldo`,
      });
      setIsCompleting(false);
    }, 500);
  };

  const handleCancel = () => {
    onCancel?.(transaction.id);
    toast({
      title: "Transação cancelada",
      description: "A transação foi cancelada com sucesso",
      variant: "destructive",
    });
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
    }
  };

  const getTypeIcon = () => {
    return transaction.type === 'earned' ? (
      <TrendingUp className="w-4 h-4 text-secondary" />
    ) : (
      <TrendingDown className="w-4 h-4 text-destructive" />
    );
  };

  return (
    <Card className="card-rio">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={transaction.provider.avatarUrl} alt={transaction.provider.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {transaction.provider.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{transaction.service.title}</h3>
              <p className="text-xs text-muted-foreground">{transaction.service.category}</p>
            </div>
          </div>
          
          <div className={cn(
            "status-badge",
            transaction.status === 'completed' && "status-completed",
            transaction.status === 'pending' && "status-pending",
            transaction.status === 'cancelled' && "status-cancelled"
          )}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">
            <p>Com: {transaction.provider.name}</p>
            <p>Data: {formatBrazilianDate(transaction.date)}</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1">
              {getTypeIcon()}
              <span className={cn(
                "font-semibold text-lg",
                transaction.type === 'earned' ? "text-secondary" : "text-destructive"
              )}>
                {transaction.type === 'earned' ? '+' : '-'}{transaction.hours}h
              </span>
            </div>
          </div>
        </div>

        {transaction.status === 'pending' && (
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="btn-nature flex-1"
                  disabled={isCompleting}
                >
                  {isCompleting ? 'Finalizando...' : 'Marcar como concluído'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar conclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você tem certeza que deseja marcar esta transação como concluída? 
                    {transaction.type === 'earned' 
                      ? ` Você receberá +${transaction.hours}h no seu saldo.`
                      : ` Serão deduzidas -${transaction.hours}h do seu saldo.`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMarkComplete}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="btn-ghost"
                >
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar transação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você tem certeza que deseja cancelar esta transação? Esta ação não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancelar transação
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}