// ============================================================
// DeleteConfirmDialog — Reusable AlertDialog for delete confirmations
// Uses shadcn/ui AlertDialog for destructive actions
// ============================================================

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description = 'Data yang dihapus tidak dapat dikembalikan.',
  onConfirm,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white/90 border-white/60 backdrop-blur-xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-800">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/[0.07] border border-white/[0.12] text-slate-600 hover:bg-white/50">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500/80 text-white hover:bg-red-500 border-0"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
