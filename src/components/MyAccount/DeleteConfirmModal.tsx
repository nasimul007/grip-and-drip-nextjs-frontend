"use client";
import React from "react";
import Modal from "@/components/Common/Modal";
import { useT } from "@/lib/i18n/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading = false }: Props) => {
  const { t } = useT();
  return (
    <Modal open={isOpen} onClose={onClose} title={title || t("Delete address")} busy={loading}>
      <p className="text-sm text-brand-muted">{message || t("Are you sure you want to delete this address? This cannot be undone.")}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={loading} className="h-10 rounded-md border border-brand-border px-5 text-sm font-medium text-white hover:border-brand-accent disabled:opacity-60">
          {t("Cancel")}
        </button>
        <button type="button" onClick={onConfirm} disabled={loading} className="h-10 rounded-md bg-red px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
          {loading ? t("Deleting…") : t("Delete")}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
