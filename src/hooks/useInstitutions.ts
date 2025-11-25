import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '@/api/endpoints/institutions';

// Priority states to display first
const PRIORITY_STATES = ['NH', 'MA', 'CA'];

function sortInstitutionsByPriorityStates<T extends { state: string }>(institutions: T[]): T[] {
  return institutions.sort((a, b) => {
    const aIndex = PRIORITY_STATES.indexOf(a.state);
    const bIndex = PRIORITY_STATES.indexOf(b.state);
    
    // Both are priority states - sort by priority order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // Only a is priority - a comes first
    if (aIndex !== -1) {
      return -1;
    }
    
    // Only b is priority - b comes first
    if (bIndex !== -1) {
      return 1;
    }
    
    // Neither are priority - maintain original order (alphabetical by state)
    return a.state.localeCompare(b.state);
  });
}

export function useInstitutions(state?: string) {
  return useQuery({
    queryKey: ['institutions', state],
    queryFn: async () => {
      const data = await institutionsApi.getAll({ state, limit: 100 });
      // Apply custom sorting if no state filter is active
      if (!state && Array.isArray(data)) {
        return sortInstitutionsByPriorityStates(data);
      }
      return data;
    },
  });
}

export function useInstitution(ipeds_id: number) {
  return useQuery({
    queryKey: ['institution', ipeds_id],
    queryFn: () => institutionsApi.getById(ipeds_id),
    enabled: !!ipeds_id,
  });
}
