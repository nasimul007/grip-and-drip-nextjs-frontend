const fs = require("fs");
const path = require("path");

const API_BASE =
  "https://member.daraz.com.bd/locationtree/api/getSubAddressList";

const OUT_DIR = path.join(__dirname, "..", "src", "data");

async function fetchSubAddresses(addressId) {
  const url = addressId
    ? `${API_BASE}?countryCode=BD&addressId=${addressId}`
    : `${API_BASE}?countryCode=BD`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
  const data = await res.json();
  if (!data.success) throw new Error(`API error: ${url}`);
  return (data.module ?? []).map((item) => ({
    id: item.id,
    displayName: item.displayName,
  }));
}

async function fetchAll(items, parentKey, concurrency = 8) {
  const results = [];
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        try {
          const children = await fetchSubAddresses(item.id);
          results.push(...children.map((c) => ({ ...c, [parentKey]: item.id })));
          ok = true;
        } catch (err) {
          if (attempt === 2) {
            console.error(`FAILED ${item.displayName} (${item.id}):`, err.message);
            results.push({
              id: item.id,
              displayName: item.displayName,
              [parentKey]: item.id,
              __error: true,
            });
          } else {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
    }
  });
  await Promise.all(workers);
  return results;
}

(async () => {
  console.log("Fetching divisions...");
  const divisions = await fetchSubAddresses();
  console.log(`Found ${divisions.length} divisions.`);

  console.log("Fetching cities...");
  const cities = await fetchAll(divisions, "divisionId");
  console.log(`Found ${cities.length} cities.`);

  console.log("Fetching areas...");
  const areas = await fetchAll(cities, "cityId");
  console.log(`Found ${areas.length} areas.`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "divisions.json"), JSON.stringify(divisions, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "cities.json"), JSON.stringify(cities, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "areas.json"), JSON.stringify(areas, null, 2));

  const failed = [
    ...cities.filter((c) => c.__error),
    ...areas.filter((a) => a.__error),
  ];
  if (failed.length > 0) {
    console.warn(`\nWARNING: ${failed.length} entries failed to fetch children:`, failed.map((f) => f.displayName));
  }
  console.log("\nDone. Wrote src/data/divisions.json, cities.json, areas.json");
})();
