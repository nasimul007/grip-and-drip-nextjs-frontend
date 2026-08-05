"use client";
import React, { useEffect, useState } from "react";

type Option = { id: string; displayName: string };

type LocationSelectProps = {
  name: string;
  id: string;
  label: string;
  required?: boolean;
  value: string;
  options: Option[];
  disabled?: boolean;
  loading?: boolean;
  placeholder: string;
  wrapperClassName?: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

const inputClass =
  "rounded-md border border-brand-border bg-brand-surface placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-60";

const LocationSelect = ({
  name,
  id,
  label,
  required,
  value,
  options,
  disabled,
  loading,
  placeholder,
  wrapperClassName = "mb-5",
  onChange,
}: LocationSelectProps) => (
  <div className={wrapperClassName}>
    <label htmlFor={id} className="block mb-2.5">
      {label} {required && <span className="text-red">*</span>}
    </label>
    <select
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled || loading}
      className={inputClass}
    >
      <option value="">
        {loading ? "Loading..." : placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.displayName}>
          {opt.displayName}
        </option>
      ))}
    </select>
  </div>
);

async function fetchOptions(addressId?: string): Promise<Option[]> {
  const query = addressId
    ? `?countryCode=BD&addressId=${addressId}`
    : "?countryCode=BD";
  const res = await fetch(`/daraz-location${query}`);
  if (!res.ok) throw new Error("Failed to load location data.");
  const data = await res.json();
  return (data?.module ?? []).map((item: any) => ({
    id: item.id,
    displayName: item.displayName,
  }));
}

const Billing = ({ formData, onChange }: any) => {
  const [divisions, setDivisions] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [areas, setAreas] = useState<Option[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingDivisions(true);
    fetchOptions()
      .then((opts) => {
        if (active) setDivisions(opts);
      })
      .catch(() => {
        if (active) setDivisions([]);
      })
      .finally(() => {
        if (active) setLoadingDivisions(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDivisionChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCities([]);
    setAreas([]);
    onChange({
      target: { name: "city", value: "" },
    } as React.ChangeEvent<HTMLSelectElement>);
    onChange({
      target: { name: "area", value: "" },
    } as React.ChangeEvent<HTMLSelectElement>);
    const divisionName = e.target.value;
    onChange(e);

    if (!divisionName) return;
    const division = divisions.find((d) => d.displayName === divisionName);
    if (!division) return;
    setLoadingCities(true);
    try {
      const opts = await fetchOptions(division.id);
      setCities(opts);
    } catch {
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCityChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAreas([]);
    onChange({
      target: { name: "area", value: "" },
    } as React.ChangeEvent<HTMLSelectElement>);
    const cityName = e.target.value;
    onChange(e);

    if (!cityName) return;
    const city = cities.find((c) => c.displayName === cityName);
    if (!city) return;
    setLoadingAreas(true);
    try {
      const opts = await fetchOptions(city.id);
      setAreas(opts);
    } catch {
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  return (
    <div className="mt-9">
      <h2 className="font-medium text-white text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>

      <div className="bg-brand-card border border-brand-border rounded-[10px] p-4 sm:p-8.5">
        <div className="mb-5">
          <label htmlFor="fullName" className="block mb-2.5">
            Full Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={onChange}
            placeholder="Jhon Deo"
            className={inputClass}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            Phone <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={onChange}
            className={inputClass}
          />
        </div>

        <div className="mb-5.5">
          <label htmlFor="email" className="block mb-2.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={onChange}
            className={inputClass}
          />
        </div>

        <div className="grid gap-x-5 gap-y-5 mb-5 sm:grid-cols-3 sm:gap-y-6">
        <LocationSelect
          name="division"
          id="division"
          label="Division"
          required
          value={formData.division}
          options={divisions}
          loading={loadingDivisions}
          placeholder="Select Division"
          wrapperClassName="mb-0"
          onChange={handleDivisionChange}
        />

        <LocationSelect
          name="city"
          id="city"
          label="City"
          required
          value={formData.city}
          options={cities}
          disabled={!formData.division}
          loading={loadingCities}
          placeholder={formData.division ? "Select City" : "Select Division first"}
          wrapperClassName="mb-0"
          onChange={handleCityChange}
        />

        <LocationSelect
          name="area"
          id="area"
          label="Area"
          required
          value={formData.area}
          options={areas}
          disabled={!formData.city}
          loading={loadingAreas}
          placeholder={formData.city ? "Select Area" : "Select City first"}
          wrapperClassName="mb-0"
          onChange={onChange}
        />
      </div>

        <div className="mb-5.5">
          <label htmlFor="address" className="block mb-2.5">
            Address <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={onChange}
            placeholder="House number and street name"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
};

export default Billing;