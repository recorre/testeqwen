import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
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
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';

interface AccountDeletionDialogProps {
  children: React.ReactNode;
}

export function AccountDeletionDialog({ children }: AccountDeletionDialogProps) {
  const navigate = useNavigate();
  const { deleteAccount } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { error } = await deleteAccount();
      
      if (error) {
        toast.error('Erro ao excluir conta: ' + error.message);
        return;
      }
      
      toast.success('Conta excluída com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro inesperado ao excluir conta');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Excluir conta permanentemente
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>Esta ação não pode ser desfeita.</strong> Ao excluir sua conta:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Todos os seus dados pessoais serão removidos</li>
              <li>Seu histórico de transações será apagado</li>
              <li>Você perderá acesso permanente à plataforma</li>
              <li>Será necessário criar uma nova conta para usar novamente</li>
            </ul>
            <p className="text-sm font-medium mt-4">
              Tem certeza que deseja continuar?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Sim, excluir minha conta'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}