import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { AddressCard } from '@/components/address/address-card';
import { AddressFormModal } from '@/components/address/address-form-modal';
import { DeleteConfirmationModal } from '@/components/address/delete-confirmation-modal';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { Address, AddressFormData } from '@/types/address';

export const Route = createFileRoute('/addresses')({
  component: AddressesPage,
});

function AddressesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch addresses
  const {
    data: addresses = [],
    isLoading,
    error,
  } = useQuery(orpc.address.list.queryOptions());

  // Create address mutation
  const createMutation = useMutation(orpc.address.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.address.list.key() });
      toast.success('Address added successfully');
      setIsFormOpen(false);
      setSelectedAddress(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add address');
    },
  }));

  // Update address mutation
  const updateMutation = useMutation(orpc.address.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.address.list.key() });
      toast.success('Address updated successfully');
      setIsFormOpen(false);
      setSelectedAddress(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update address');
    },
  }));

  // Delete address mutation
  const deleteMutation = useMutation(orpc.address.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.address.list.key() });
      toast.success('Address deleted successfully');
      setIsDeleteOpen(false);
      setAddressToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete address');
    },
  }));

  // Set default address mutation
  const setDefaultMutation = useMutation(orpc.address.setDefault.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.address.list.key() });
      toast.success('Default address updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update default address');
    },
  }));

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsFormOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsFormOpen(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      deleteMutation.mutate({ id: addressToDelete });
    }
  };

  const handleSetDefault = (addressId: string, isDefault: boolean) => {
    if (isDefault) {
      setDefaultMutation.mutate({ id: addressId });
    }
  };

  const handleFormSubmit = (data: AddressFormData & { isDefault?: boolean }) => {
    if (selectedAddress) {
      updateMutation.mutate({
        id: selectedAddress.id,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const addressToDeleteName = addresses.find((a) => a.id === addressToDelete)?.name;
  const canAddMore = addresses.length < 5;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saved Addresses</h1>
            <p className="mt-1 text-[hsl(var(--muted-foreground))]">
              Manage your delivery addresses
            </p>
          </div>
          <Button
            onClick={handleAddAddress}
            disabled={!canAddMore || isLoading}
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Address
          </Button>
        </div>

        {/* Addresses limit warning */}
        {!canAddMore && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You have reached the maximum limit of 5 addresses. Please delete an existing address
              to add a new one.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-[hsl(var(--muted-foreground))]">Loading addresses...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Failed to load addresses. Please try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && addresses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No saved addresses</h3>
            <p className="mb-4 text-[hsl(var(--muted-foreground))]">
              Add your first delivery address to get started
            </p>
            <Button onClick={handleAddAddress}>
              <Plus className="mr-2 h-5 w-5" />
              Add Address
            </Button>
          </div>
        )}

        {/* Addresses Grid */}
        {!isLoading && !error && addresses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}

        {/* Form Modal */}
        <AddressFormModal
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedAddress(null);
          }}
          onSubmit={handleFormSubmit}
          address={selectedAddress}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setAddressToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          isLoading={deleteMutation.isPending}
          addressName={addressToDeleteName}
        />
      </div>
    </div>
  );
}

export default AddressesPage;
