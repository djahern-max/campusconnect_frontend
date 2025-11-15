import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '@/api/endpoints/institutions';

export function useInstitutions(state?: string) {
  return useQuery({
    queryKey: ['institutions', state],
    queryFn: () => institutionsApi.getAll({ state, limit: 100 }),
  });
}

export function useInstitution(ipeds_id: number) {
  return useQuery({
    queryKey: ['institution', ipeds_id],
    queryFn: () => institutionsApi.getById(ipeds_id),
    enabled: !!ipeds_id,
  });
}
