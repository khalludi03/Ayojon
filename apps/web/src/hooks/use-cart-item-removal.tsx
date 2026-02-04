import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useCart, type CartItem } from '@/stores/cart-store';

export function useCartItemRemoval() {
  const { removeItem, restoreItem } = useCart();
  const [pendingRemoveItem, setPendingRemoveItem] = useState<CartItem | null>(null);

  const handleConfirmRemove = () => {
    if (!pendingRemoveItem) return;
    const removedItem = pendingRemoveItem;
    removeItem(removedItem.id);
    setPendingRemoveItem(null);
    const toastId = toast.success('Removed from cart', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          restoreItem(removedItem);
          toast.dismiss(toastId);
        },
      },
    });
  };

  return { pendingRemoveItem, setPendingRemoveItem, handleConfirmRemove };
}

export function CartRemoveConfirmDialog({
  pendingRemoveItem,
  onClose,
  onConfirm,
}: {
  pendingRemoveItem: CartItem | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={pendingRemoveItem !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Remove item</DialogTitle>
          <DialogDescription>Remove &quot;{pendingRemoveItem?.product.title}&quot; from your cart?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
