import divisionsJson from "@/data/divisions.json";
import citiesJson from "@/data/cities.json";
import areasJson from "@/data/areas.json";

export type Option = { id: string; displayName: string };
export type CityWithDivision = Option & { divisionId: string };
export type AreaWithCity = Option & { cityId: string };

const divisions = divisionsJson as Option[];
const cities = citiesJson as CityWithDivision[];
const areas = areasJson as AreaWithCity[];

const citiesByDivision = new Map<string, Option[]>();
for (const city of cities) {
  const list = citiesByDivision.get(city.divisionId);
  if (list) list.push(city);
  else citiesByDivision.set(city.divisionId, [city]);
}

const areasByCity = new Map<string, Option[]>();
for (const area of areas) {
  const list = areasByCity.get(area.cityId);
  if (list) list.push(area);
  else areasByCity.set(area.cityId, [area]);
}

export const getDivisions = (): Option[] => divisions;

export const getCities = (divisionId?: string): Option[] => {
  if (!divisionId) return [];
  return citiesByDivision.get(divisionId) ?? [];
};

export const getAreas = (cityId?: string): Option[] => {
  if (!cityId) return [];
  return areasByCity.get(cityId) ?? [];
};
