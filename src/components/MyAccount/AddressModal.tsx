"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/components/Common/Modal";
import { LocationSelectors } from "@/components/Common/LocationSelectors";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/client";
import type { AddressFormData } from "@/lib/types";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  initialData?: AddressFormData;
  onSubmit: (data: AddressFormData) => Promise<void>;
  loading?: boolean;
  /** Prefill for new addresses (the customer's own name and phone). */
  defaults?: { recipient_name?: string; phone?: string };
}

const EMPTY: AddressFormData = {
  address_name: "", recipient_name: "", phone: "",
  division_id: "", division_name: "", city_id: "", city_name: "", area_id: "", area_name: "",
  address: "", is_default_shipping: false,
};

const AddressModal = ({ isOpen, onClose, mode = "add", initialData, onSubmit, loading = false, defaults }: AddressModalProps) => {
  const { t } = useT();
  const [form, setForm] = useState<AddressFormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      mode === "edit" && initialData
        ? { ...EMPTY, ...initialData }
        : { ...EMPTY, recipient_name: defaults?.recipient_name || "", phone: defaults?.phone || "" }
    );
    setErrors({});
    setSubmitError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialData]);

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLocation = (field: string, value: string, displayName?: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value } as Record<string, unknown>;
      if (displayName !== undefined) next[field.replace("_id", "_name")] = displayName;
      return next as AddressFormData;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.address_name.trim()) err.address_name = t("Give this address a name, for example Home.");
    if (!form.recipient_name?.trim()) err.recipient_name = t("Enter the receiver's name.");
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test((form.phone || "").replace(/[\s-]/g, ""))) err.phone = t("Enter a valid Bangladeshi mobile number (01XXXXXXXXX).");
    if (!form.division_id) err.division_id = t("Select a division.");
    if (!form.city_id) err.city_id = t("Select a city.");
    if (!form.area_id) err.area_id = t("Select an area.");
    if (!form.address.trim()) err.address = t("Enter your full address.");
    setErrors(err);
    setSubmitError("");
    if (Object.keys(err).length) return;
    try {
      await onSubmit({ ...form, phone: (form.phone || "").replace(/[\s-]/g, "") });
    } catch (e2) {
      setSubmitError((e2 as Error).message || t("Could not save the address."));
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={mode === "edit" ? t("Edit address") : t("Add new address")} wide busy={loading}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {submitError && (
          <p role="alert" className="rounded-md border border-red bg-red-light-6/10 px-3.5 py-2.5 text-sm text-white">
            {submitError}
          </p>
        )}
        <TextField id="address_name" label={t("Address name")} placeholder={t("Home, Office, Parents' house")} value={form.address_name} onChange={(e) => setField("address_name", e.target.value)} error={errors.address_name} disabled={loading} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="recipient_name" label={t("Receiver's name")} autoComplete="name" value={form.recipient_name || ""} onChange={(e) => setField("recipient_name", e.target.value)} error={errors.recipient_name} disabled={loading} required />
          <TextField id="phone" type="tel" label={t("Phone")} placeholder="01XXXXXXXXX" autoComplete="tel" inputMode="tel" value={form.phone || ""} onChange={(e) => setField("phone", e.target.value)} error={errors.phone} disabled={loading} required />
        </div>
        <LocationSelectors formData={form} onChange={handleLocation} errors={errors} disabled={loading} />
        <TextAreaField id="address" label={t("Full address")} placeholder={t("House, road, landmark")} rows={3} value={form.address} onChange={(e) => setField("address", e.target.value)} error={errors.address} disabled={loading} required />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
          <input type="checkbox" checked={form.is_default_shipping} onChange={(e) => setForm((p) => ({ ...p, is_default_shipping: e.target.checked }))} disabled={loading} className="h-4 w-4 accent-brand-accent" />
          {t("Use as my default delivery address")}
        </label>
        <div className="flex justify-end gap-3 border-t border-brand-border pt-4">
          <button type="button" onClick={onClose} disabled={loading} className="h-10 rounded-md border border-brand-border px-5 text-sm font-medium text-white hover:border-brand-accent disabled:opacity-60">
            {t("Cancel")}
          </button>
          <button type="submit" disabled={loading} className="h-10 rounded-md bg-brand-accent px-6 text-sm font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60">
            {loading ? t("Saving…") : mode === "edit" ? t("Save changes") : t("Save address")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressModal;
