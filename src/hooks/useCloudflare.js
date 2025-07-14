import { useMutation } from "@tanstack/react-query";
import { uploadToCloudflare } from "../services/admin/cloudflareService";

export const useUploadToCloudflare = () => {
  return useMutation({
    mutationFn: uploadToCloudflare,
    onSuccess: (data) => {
      if (data.status !== 200) {
        throw new Error(data.message || 'Error al subir los archivos');
      }
      return data.data;
    },
  });
}; 