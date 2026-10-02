"use client";
import React, { useMemo, useEffect } from "react";
import SearchableSelect from "@/components/Checkout/SearchableSelect";
import {
  getDivisions,
  getCities,
  getAreas,
} from "@/lib/location-data";

interface LocationSelectorsProps {
  formData: {
    division_id: string;
    division_name: string;
    city_id: string;
    city_name: string;
    area_id: string;
    area_name: string;
  };
  onChange: (field: string, value: string, displayName?: string) => void;
  errors?: {
    division_id?: string;
    city_id?: string;
    area_id?: string;
  };
  disabled?: boolean;
}

export const LocationSelectors = ({
  formData,
  onChange,
  errors = {},
  disabled = false,
}: LocationSelectorsProps) => {
  const divisions = getDivisions();

  const cities = useMemo(
    () => getCities(formData.division_id),
    [formData.division_id]
  );

  const areas = useMemo(
    () => getAreas(formData.city_id),
    [formData.city_id]
  );

  const handleDivisionChange = (e: { target: { name: string; value: string } }) => {
    const divisionId = e.target.value;
    const division = divisions.find((d) => d.id === divisionId);
    if (division) {
      onChange("division_id", division.id, division.displayName);
    } else {
      onChange("division_id", "", "");
    }
    onChange("city_id", "", "");
    onChange("area_id", "", "");
  };

  const handleCityChange = (e: { target: { name: string; value: string } }) => {
    const cityId = e.target.value;
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      onChange("city_id", city.id, city.displayName);
    } else {
      onChange("city_id", "", "");
    }
    onChange("area_id", "", "");
  };

  const handleAreaChange = (e: { target: { name: string; value: string } }) => {
    const areaId = e.target.value;
    const area = areas.find((a) => a.id === areaId);
    if (area) {
      onChange("area_id", area.id, area.displayName);
    } else {
      onChange("area_id", "", "");
    }
  };

  return (
    <div className="grid gap-x-5 gap-y-5 mb-5 sm:grid-cols-3 sm:gap-y-6">
      <SearchableSelect
        name="division_name"
        id="division_name"
        label="Division"
        required
        value={formData.division_id}
        options={divisions}
        disabled={disabled}
        placeholder="Select Division"
        error={errors.division_id}
        wrapperClassName="mb-0"
        valueKey="id"
        labelKey="displayName"
        onChange={handleDivisionChange}
      />

      <SearchableSelect
        name="city_name"
        id="city_name"
        label="City"
        required
        value={formData.city_id}
        options={cities}
        disabled={disabled || !formData.division_id}
        placeholder={formData.division_id ? "Select City" : "Select Division first"}
        error={errors.city_id}
        wrapperClassName="mb-0"
        valueKey="id"
        labelKey="displayName"
        onChange={handleCityChange}
      />

      <SearchableSelect
        name="area_name"
        id="area_name"
        label="Area"
        required
        value={formData.area_id}
        options={areas}
        disabled={disabled || !formData.city_id}
        placeholder={formData.city_id ? "Select Area" : "Select City first"}
        error={errors.area_id}
        wrapperClassName="mb-0"
        valueKey="id"
        labelKey="displayName"
        onChange={handleAreaChange}
      />
    </div>
  );
};
