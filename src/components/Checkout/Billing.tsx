"use client";
import React, { useMemo } from "react";

import SearchableSelect from "./SearchableSelect";
import { getDivisions, getCities, getAreas } from "@/lib/location-data";

const inputClass =
  "rounded-md bg-brand-surface placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-60";

const fieldClass = (error?: string) =>
  `${inputClass} border ${
    error ? "border-red" : "border-brand-border"
  }`;

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-red text-custom-sm mt-1">{message}</p>
  ) : null;

const Billing = ({ formData, onChange, errors = {} }: any) => {
  const divisions = getDivisions();

  const cities = useMemo(() => {
    if (!formData.division) return [];
    const division = divisions.find((d) => d.displayName === formData.division);
    return division ? getCities(division.id) : [];
  }, [formData.division, divisions]);

  const areas = useMemo(() => {
    if (!formData.city) return [];
    const city = cities.find((c) => c.displayName === formData.city);
    return city ? getAreas(city.id) : [];
  }, [formData.city, cities]);

  const handleDivisionChange = (
    e: { target: { name: string; value: string } }
  ) => {
    onChange({
      target: { name: "city", value: "" },
    });
    onChange({
      target: { name: "area", value: "" },
    });
    onChange(e);
  };

  const handleCityChange = (
    e: { target: { name: string; value: string } }
  ) => {
    onChange({
      target: { name: "area", value: "" },
    });
    onChange(e);
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
            className={fieldClass(errors.fullName)}
          />
          <FieldError message={errors.fullName} />
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
            className={fieldClass(errors.phone)}
          />
          <FieldError message={errors.phone} />
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
            className={fieldClass(undefined)}
          />
        </div>

        <div className="grid gap-x-5 gap-y-5 mb-5 sm:grid-cols-3 sm:gap-y-6">
        <SearchableSelect
          name="division"
          id="division"
          label="Division"
          required
          value={formData.division}
          options={divisions}
          placeholder="Select Division"
          error={errors.division}
          wrapperClassName="mb-0"
          onChange={handleDivisionChange}
        />

        <SearchableSelect
          name="city"
          id="city"
          label="City"
          required
          value={formData.city}
          options={cities}
          disabled={!formData.division}
          placeholder={formData.division ? "Select City" : "Select Division first"}
          error={errors.city}
          wrapperClassName="mb-0"
          onChange={handleCityChange}
        />

        <SearchableSelect
          name="area"
          id="area"
          label="Area"
          required
          value={formData.area}
          options={areas}
          disabled={!formData.city}
          placeholder={formData.city ? "Select Area" : "Select City first"}
          error={errors.area}
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
            className={fieldClass(errors.address)}
          />
          <FieldError message={errors.address} />
        </div>
      </div>
    </div>
  );
};

export default Billing;