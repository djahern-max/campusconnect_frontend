import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryApi } from '@/api/endpoints/gallery';

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: galleryApi.getAll,
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, caption, imageType }: { 
      file: File; 
      caption?: string; 
      imageType?: string;
    }) => galleryApi.upload(file, caption, imageType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => galleryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useReorderImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageIds: number[]) => galleryApi.reorder(imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}
