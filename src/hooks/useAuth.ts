import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (data) => {
      // Store token first
      login(data.access_token, { 
        id: 0, 
        email: '', 
        entity_type: 'institution', 
        entity_id: 0, 
        role: '', 
        is_active: true 
      });
      
      // Then fetch user with new token
      try {
        const user = await authApi.getCurrentUser();
        login(data.access_token, user);
        router.push('/admin/dashboard');
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated && !!token,
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  return () => {
    logout();
    router.push('/');
  };
}
