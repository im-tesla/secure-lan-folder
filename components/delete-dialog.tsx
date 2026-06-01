'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TriangleAlert } from 'lucide-react';

interface DeleteDialogProps {
  open: boolean;
  fileName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ open, fileName, onClose, onConfirm }: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
              <TriangleAlert className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete file?</AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5">
                This will permanently delete <strong className="text-foreground">{fileName}</strong>.
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
