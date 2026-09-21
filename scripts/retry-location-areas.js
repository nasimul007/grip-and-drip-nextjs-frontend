const fs = require("fs");
const path = require("path");

const API_BASE =
  "https://member.daraz.com.bd/locationtree/api/getSubAddressList";

const DATA_DIR = path.join(__dirname, "..", "src", "data");

async function fetchSubAddresses(addressId) {
  const url = `${API_BASE}?countryCode=BD&addressId=${addressId}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://member.daraz.com.bd/",
    },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(`API error: ${data.errorCode}`);
  return (data.module ?? []).map((item) => ({
    id: item.id,
    displayName: item.displayName,
  }));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const cities = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "cities.json")));
  const areas = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "areas.json")));

  // Build a set of cityIds that have at least one valid area
  const cityIdsWithAreas = new Set(
    areas
      .filter((a) => !a.__error)
      .map((a) => a.cityId)
  );

  // Find cities that are missing areas
  const missingCities = cities.filter((c) => !cityIdsWithAreas.has(c.id));
  console.log(`Found ${missingCities.length} cities missing areas.`);

  if (missingCities.length === 0) {
    console.log("All cities have areas. Nothing to do.");
    return;
  }

  // Also handle cities that have only error entries
  const errorCities = new Set(
    areas
      .filter((a) => a.__error)
      .map((a) => a.cityId)
  );
  for (const city of cities) {
    if (errorCities.has(city.id) && !missingCities.find((c) => c.id === city.id)) {
      missingCities.push(city);
    }
  }
  console.log(`Total cities to retry: ${missingCities.length}`);

  const newAreas = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < missingCities.length; i++) {
    const city = missingCities[i];
    console.log(`[${i + 1}/${missingCities.length}] Fetching areas for ${city.displayName} (${city.id})...`);

    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const children = await fetchSubAddresses(city.id);
        newAreas.push(...children.map((a) => ({ ...a, cityId: city.id })));
        console.log(`  -> Found ${children.length} areas.`);
        ok = true;
        successCount++;
      } catch (err) {
        if (attempt === 2) {
          console.error(`  -> FAILED: ${err.message}`);
          failCount++;
        } else {
          await sleep(5000 * (attempt + 1));
        }
      }
    }

    // Long delay between cities to avoid WAF
    if (i < missingCities.length - 1) {
      console.log("  Waiting 10s before next request...");
      await sleep(10000);
    }
  }

  if (newAreas.length > 0) {
    // Remove error entries for these cities
    const retryCityIds = new Set(missingCities.map((c) => c.id));
    const cleanedAreas = areas.filter(
      (a) => !retryCityIds.has(a.cityId) || !a.__error
    );

    // Combine and write
    const finalAreas = [...cleanedAreas, ...newAreas];
    fs.writeFileSync(path.join(DATA_DIR, "areas.json"), JSON.stringify(finalAreas, null, 2));
    console.log(`\nUpdated areas.json: ${finalAreas.length} total areas (added ${newAreas.length}).`);
  }

  console.log(`\nDone. Success: ${successCount}, Failed: ${failCount}`);
})();