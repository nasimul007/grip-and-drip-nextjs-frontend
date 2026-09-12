"use client";
import React, { useEffect, useState } from "react";
import SearchableSelect from "@/components/Checkout/SearchableSelect";

type Option = { id: string; displayName: string };

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

export const LocationSelectors = ({
  formData,
  onChange,
  errors = {},
  disabled = false,
}: LocationSelectorsProps) => {
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

  useEffect(() => {
    if (!formData.division_id) return;
    let active = true;
    setLoadingCities(true);
    fetchOptions(formData.division_id)
      .then((opts) => {
        if (active) setCities(opts);
      })
      .catch(() => {
        if (active) {
          setCities([]);
          onChange("city_id", "");
          onChange("city_name", "");
          onChange("area_id", "");
          onChange("area_name", "");
        }
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [formData.division_id]);

  useEffect(() => {
    if (!formData.city_id) return;
    let active = true;
    setLoadingAreas(true);
    fetchOptions(formData.city_id)
      .then((opts) => {
        if (active) setAreas(opts);
      })
      .catch(() => {
        if (active) {
          setAreas([]);
          onChange("area_id", "");
          onChange("area_name", "");
        }
      })
      .finally(() => {
        if (active) setLoadingAreas(false);
      });
    return () => {
      active = false;
    };
  }, [formData.city_id]);

  const handleDivisionChange = async (e: { target: { name: string; value: string } }) => {
    setCities([]);
    setAreas([]);
    onChange("city_id", "");
    onChange("city_name", "");
    onChange("area_id", "");
    onChange("area_name", "");
    const divisionName = e.target.value;
    const division = divisions.find((d) => d.displayName === divisionName);
    if (division) {
      onChange("division_id", division.id);
      onChange("division_name", division.displayName);
    } else {
      onChange("division_id", "");
      onChange("division_name", "");
    }

    if (!divisionName) return;
    setLoadingCities(true);
    try {
      const opts = await fetchOptions(division?.id);
      setCities(opts);
    } catch {
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCityChange = async (e: { target: { name: string; value: string } }) => {
    setAreas([]);
    onChange("area_id", "");
    onChange("area_name", "");
    const cityName = e.target.value;
    const city = cities.find((c) => c.displayName === cityName);
    if (city) {
      onChange("city_id", city.id);
      onChange("city_name", city.displayName);
    } else {
      onChange("city_id", "");
      onChange("city_name", "");
    }

    if (!cityName) return;
    setLoadingAreas(true);
    try {
      const opts = await fetchOptions(city?.id);
      setAreas(opts);
    } catch {
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleAreaChange = (e: { target: { name: string; value: string } }) => {
    const areaName = e.target.value;
    const area = areas.find((a) => a.displayName === areaName);
    if (area) {
      onChange("area_id", area.id);
      onChange("area_name", area.displayName);
    } else {
      onChange("area_id", "");
      onChange("area_name", "");
    }
  };

  return (
    <div className="grid gap-x-5 gap-y-5 mb-5 sm:grid-cols-3 sm:gap-y-6">
      <SearchableSelect
        name="division_name"
        id="division_name"
        label="Division"
        required
        value={formData.division_name}
        options={divisions}
        loading={loadingDivisions}
        disabled={disabled}
        placeholder="Select Division"
        error={errors.division_id}
        wrapperClassName="mb-0"
        onChange={handleDivisionChange}
      />

      <SearchableSelect
        name="city_name"
        id="city_name"
        label="City"
        required
        value={formData.city_name}
        options={cities}
        loading={loadingCities}
        disabled={disabled || !formData.division_id}
        placeholder={formData.division_id ? "Select City" : "Select Division first"}
        error={errors.city_id}
        wrapperClassName="mb-0"
        onChange={handleCityChange}
      />

      <SearchableSelect
        name="area_name"
        id="area_name"
        label="Area"
        required
        value={formData.area_name}
        options={areas}
        loading={loadingAreas}
        disabled={disabled || !formData.city_id}
        placeholder={formData.city_id ? "Select Area" : "Select City first"}
        error={errors.area_id}
        wrapperClassName="mb-0"
        onChange={handleAreaChange}
      />
    </div>
  );
};