import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

interface MutationOptions<T> {
      invalidateKeys?: any[][];
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
}

export function useGenericMutations<T, TCreate = any, TUpdate = any>(
      baseKey: any[],
      services: {
            create?: (data: TCreate) => Promise<T>;
            update?: (id: string, data: TUpdate) => Promise<T>;
            delete?: (id: string) => Promise<void>;
      },
      options?: MutationOptions<T>
) {
      const queryClient = useQueryClient();
      const { operationSuccess, operationError } = useEnhancedToast();

      const invalidate = () => {
            queryClient.invalidateQueries({ queryKey: baseKey });
            options?.invalidateKeys?.forEach(key =>
                  queryClient.invalidateQueries({ queryKey: key })
            );
      };

      const createMutation = useMutation({
            mutationFn: async (data: TCreate) => {
                  if (!services.create) throw new Error("Create service not implemented");
                  return services.create(data);
            },
            onSuccess: (data) => {
                  invalidate();
                  operationSuccess("Item created successfully"); // TODO: localize
                  options?.onSuccess?.(data);
            },
            onError: (error: any) => {
                  operationError(error.message || "Failed to create item");
                  options?.onError?.(error);
            }
      });

      const updateMutation = useMutation({
            mutationFn: async ({ id, data }: { id: string; data: TUpdate }) => {
                  if (!services.update) throw new Error("Update service not implemented");
                  return services.update(id, data);
            },
            onSuccess: (data) => {
                  invalidate();
                  operationSuccess("Item updated successfully");
                  options?.onSuccess?.(data);
            },
            onError: (error: any) => {
                  operationError(error.message || "Failed to update item");
                  options?.onError?.(error);
            }
      });

      const deleteMutation = useMutation({
            mutationFn: async (id: string) => {
                  if (!services.delete) throw new Error("Delete service not implemented");
                  return services.delete(id);
            },
            onSuccess: () => {
                  invalidate();
                  operationSuccess("Item deleted successfully");
            },
            onError: (error: any) => {
                  operationError(error.message || "Failed to delete item");
            }
      });

      return {
            create: createMutation.mutateAsync,
            update: (id: string, data: TUpdate) => updateMutation.mutateAsync({ id, data }),
            remove: deleteMutation.mutateAsync,
            isCreating: createMutation.isPending,
            isUpdating: updateMutation.isPending,
            isDeleting: deleteMutation.isPending,
      };
}
