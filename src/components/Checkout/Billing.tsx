"use client";
import React, { useMemo } from "react";

import SearchableSelect from "./SearchableSelect";
import { getDivisions, getCities, getAreas } from "@/lib/location-data";

const inputClass =
  "rounded-md bg-brand-surface placeholder:text-brand-muted text-white w-full h-10 px-3.5 text-sm outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-60";

const fieldClass = (error?: string) =>
  `${inputClass} border ${
    error ? "border-red" : "border-brand-border"
  }`;

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-red text-custom-xs mt-1" role="alert">{message}</p>
  ) : null;

const Billing = ({ formData, onChange, errors = {} }: any) => {
  const divisions = getDivisions();

  const cities = useMemo(
    () => getCities(formData.division_id),
    [formData.division_id]
  );

  const areas = useMemo(
    () => getAreas(formData.city_id),
    [formData.city_id]
  );

  const handleDivisionChange = (
    e: { target: { name: string; value: string } }
  ) => {
    const divisionId = e.target.value;
    const division = divisions.find((d) => d.id === divisionId);
    if (division) {
      onChange({ target: { name: "division_id", value: division.id } }, division.displayName);
    } else {
      onChange({ target: { name: "division_id", value: "" } }, "");
    }
    onChange({ target: { name: "city_id", value: "" } }, "");
    onChange({ target: { name: "area_id", value: "" } }, "");
  };

  const handleCityChange = (
    e: { target: { name: string; value: string } }
  ) => {
    const cityId = e.target.value;
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      onChange({ target: { name: "city_id", value: city.id } }, city.displayName);
    } else {
      onChange({ target: { name: "city_id", value: "" } }, "");
    }
    onChange({ target: { name: "area_id", value: "" } }, "");
  };

  const handleAreaChange = (
    e: { target: { name: string; value: string } }
  ) => {
    const areaId = e.target.value;
    const area = areas.find((a) => a.id === areaId);
    if (area) {
      onChange({ target: { name: "area_id", value: area.id } }, area.displayName);
    } else {
      onChange({ target: { name: "area_id", value: "" } }, "");
    }
  };

  const field = (name: string, label: string, opts: { required?: boolean; type?: string; placeholder?: string; autoComplete?: string; span?: string; error?: string; hint?: string } = {}) => (
    <div className={opts.span}>
      <label htmlFor={name} className="block mb-1.5 text-custom-sm text-white">
        {label} {opts.required && <span className="text-red">*</span>}
      </label>
      <input
        type={opts.type || "text"}
        name={name}
        id={name}
        value={formData[name]}
        onChange={onChange}
        placeholder={opts.placeholder}
        autoComplete={opts.autoComplete}
        inputMode={name === "phone" ? "tel" : undefined}
        aria-invalid={opts.error ? true : undefined}
        className={fieldClass(opts.error)}
      />
      <FieldError message={opts.error} />
    </div>
  );

  return (
    <section className="rounded-lg border border-brand-border bg-brand-card">
      <h2 className="border-b border-brand-border px-4 py-3 text-base font-semibold text-white">Delivery details</h2>
      <div className="grid gap-x-3 gap-y-3 p-4 sm:grid-cols-6">
        {field("fullName", "Full name", { required: true, placeholder: "Your name", autoComplete: "name", span: "sm:col-span-3", error: errors.fullName })}
        {field("phone", "Phone", { required: true, placeholder: "01XXXXXXXXX", autoComplete: "tel", span: "sm:col-span-3", error: errors.phone })}
        {field("email", "Email (optional)", { type: "email", placeholder: "you@example.com", autoComplete: "email", span: "sm:col-span-6" })}

        <div className="sm:col-span-2">
          <SearchableSelect
            name="division_id"
            id="division"
            label="Division"
            required
            value={formData.division_id}
            options={divisions}
            placeholder="Select division"
            error={errors.division}
            wrapperClassName="mb-0"
            valueKey="id"
            labelKey="displayName"
            onChange={handleDivisionChange}
          />
        </div>
        <div className="sm:col-span-2">
          <SearchableSelect
            name="city_id"
            id="city"
            label="City"
            required
            value={formData.city_id}
            options={cities}
            disabled={!formData.division_id}
            placeholder={formData.division_id ? "Select city" : "Select division first"}
            error={errors.city}
            wrapperClassName="mb-0"
            valueKey="id"
            labelKey="displayName"
            onChange={handleCityChange}
          />
        </div>
        <div className="sm:col-span-2">
          <SearchableSelect
            name="area_id"
            id="area"
            label="Area"
            required
            value={formData.area_id}
            options={areas}
            disabled={!formData.city_id}
            placeholder={formData.city_id ? "Select area" : "Select city first"}
            error={errors.area}
            wrapperClassName="mb-0"
            valueKey="id"
            labelKey="displayName"
            onChange={handleAreaChange}
          />
        </div>

        {field("address", "Full address", { required: true, placeholder: "House, road, landmark", autoComplete: "street-address", span: "sm:col-span-6", error: errors.address })}

        <div className="sm:col-span-6">
          <label htmlFor="notes" className="block mb-1.5 text-custom-sm text-white">Order note (optional)</label>
          <textarea
            name="notes"
            id="notes"
            rows={2}
            value={formData.notes}
            onChange={onChange}
            placeholder="Delivery instructions, preferred time…"
            className={`${fieldClass(undefined)} h-auto py-2 resize-none`}
          />
        </div>
      </div>
    </section>
  );
};

export default Billing;
