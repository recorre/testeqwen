import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCPF, formatPhone, validateCPF } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  cpf: z.string().optional().refine((cpf) => !cpf || validateCPF(cpf), {
    message: 'CPF inválido'
  }),
  phone: z.string().optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading } = useAuthStore();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [formattedCPF, setFormattedCPF] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isSignUpMode) {
        const { error } = await signUp(data.email, data.password, {
          name: data.name || '',
          cpf: data.cpf,
          phone: data.phone,
        });
        
        if (error) {
          toast.error(error.message || 'Erro ao criar conta');
          return;
        }
        
        toast.success('Conta criada! Verifique seu email para confirmar.');
      } else {
        const { error } = await signIn(data.email, data.password);
        
        if (error) {
          toast.error(error.message || 'Erro ao fazer login');
          return;
        }
        
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      setFormattedCPF(formatted);
      setValue('cpf', value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      setFormattedPhone(formatted);
      setValue('phone', value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <Heart className="h-8 w-8 text-destructive mr-2" />
            <h1 className="text-2xl font-bold text-primary">Banco de Tempo</h1>
          </div>
          <CardTitle className="text-xl">Casa Corre - RJ</CardTitle>
          <CardDescription>
            {isSignUpMode ? 'Criar nova conta' : 'Conecte-se com sua comunidade'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {isSignUpMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="João Santos"
                    {...register('name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (opcional)</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formattedCPF}
                    onChange={handleCPFChange}
                    maxLength={14}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formattedPhone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUpMode ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                isSignUpMode ? 'Criar conta' : 'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              {isSignUpMode 
                ? 'Já tem conta? Faça login' 
                : 'Não tem conta? Cadastre-se'
              }
            </button>
          </div>

          {!isSignUpMode && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Primeira vez? Crie sua conta acima!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}