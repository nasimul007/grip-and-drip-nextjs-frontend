"use client";
import React, { useEffect, useState } from "react";
import { LocationSelectors } from "@/components/Common/LocationSelectors";
import type { AddressFormData } from "@/lib/types";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: AddressFormData;
  onSubmit: (data: AddressFormData) => Promise<void>;
  loading?: boolean;
}

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const fieldClass = (error?: string) =>
  `${inputClass} border ${error ? "border-red" : "border-gray-3"}`;

const AddressModal = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  loading = false,
}: AddressModalProps) => {
  const [formData, setFormData] = useState<AddressFormData>(() => ({
    address_name: initialData?.address_name || "",
    division_id: initialData?.division_id || "",
    division_name: initialData?.division_name || "",
    city_id: initialData?.city_id || "",
    city_name: initialData?.city_name || "",
    area_id: initialData?.area_id || "",
    area_name: initialData?.area_name || "",
    address: initialData?.address || "",
    is_default_shipping: initialData?.is_default_shipping || false,
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        address_name: initialData.address_name || "",
        division_id: initialData.division_id || "",
        division_name: initialData.division_name || "",
        city_id: initialData.city_id || "",
        city_name: initialData.city_name || "",
        area_id: initialData.area_id || "",
        area_name: initialData.area_name || "",
        address: initialData.address || "",
        is_default_shipping: initialData.is_default_shipping || false,
      });
    } else {
      setFormData({
        address_name: "",
        division_id: "",
        division_name: "",
        city_id: "",
        city_name: "",
        area_id: "",
        area_name: "",
        address: "",
        is_default_shipping: false,
      });
    }
    setErrors({});
    setSubmitError("");
  }, [initialData, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent && !modalContent.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};
    if (!formData.address_name.trim()) newErrors.address_name = "Address name is required";
    if (!formData.division_id) newErrors.division_id = "Division is required";
    if (!formData.city_id) newErrors.city_id = "City is required";
    if (!formData.area_id) newErrors.area_id = "Area is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string, displayName?: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value } as Record<string, unknown>;
      if (displayName !== undefined) {
        const displayField = field.replace("_id", "_name") as keyof AddressFormData;
        updated[displayField] = displayName;
      }
      return updated as AddressFormData;
    });
    if (errors[field as keyof AddressFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AddressFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDefaultShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_default_shipping: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save address");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto no-scrollbar bg-dark/70 sm:px-8 px-4 z-99999">
      <div className="min-h-full flex items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-2xl rounded-xl shadow-3 bg-white relative modal-content flex flex-col max-h-[calc(100vh-4rem)]">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-gray-1 text-dark-2 hover:text-dark hover:bg-gray-2"
            disabled={loading}
          >
            <svg className="fill-current" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z" fill="" />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-7.5 pt-7.5">
              <h3 className="font-medium text-xl text-dark mb-6">
                {mode === "add" ? "Add New Address" : "Edit Address"}
              </h3>

              {submitError && (
                <div className="mb-5 p-3 rounded-md bg-red/10 text-red text-sm">
                  {submitError}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="address_name" className="block mb-2.5">
                  Address Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="address_name"
                  id="address_name"
                  value={formData.address_name}
                  onChange={(e) => handleChange("address_name", e.target.value)}
                  placeholder="e.g., Home, Office, Parents' House"
                  className={fieldClass(errors.address_name)}
                  disabled={loading}
                />
                {errors.address_name && <p className="text-red text-custom-sm mt-1">{errors.address_name}</p>}
              </div>

              <LocationSelectors
                formData={formData}
                onChange={handleChange}
                errors={errors}
                disabled={loading}
              />

              <div className="mb-5">
                <label htmlFor="address" className="block mb-2.5">
                  Address <span className="text-red">*</span>
                </label>
                <textarea
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleAddressChange}
                  placeholder="House number, road, block, etc."
                  rows={3}
                  className={fieldClass(errors.address)}
                  disabled={loading}
                />
                {errors.address && <p className="text-red text-custom-sm mt-1">{errors.address}</p>}
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  name="is_default_shipping"
                  id="is_default_shipping"
                  checked={formData.is_default_shipping}
                  onChange={handleDefaultShippingChange}
                  className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue/20"
                  disabled={loading}
                />
                <label htmlFor="is_default_shipping" className="ml-2 text-dark-2 text-sm">
                  Set as default shipping address
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-gray-3 p-7.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex font-medium text-dark bg-gray-1 py-3 px-7 rounded-md ease-out duration-200 hover:bg-gray-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
              >
                {loading ? "Saving..." : mode === "add" ? "Add Address" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;