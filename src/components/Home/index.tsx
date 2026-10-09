import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import Brands from "./Brands";
import NewArrival from "./NewArrivals";
import HotDeals from "./HotDeals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import Newsletter from "../Common/Newsletter";
import { getCategoryTree, getProducts, promoHref } from "@/lib/server-api";
import { mapCategoryForDisplay, mapProductForDisplay } from "@/lib/mappers";

const Home = async () => {
  const [categories, newArrivals, featured] = await Promise.all([
    getCategoryTree(),
    getProducts("ordering=-created_at&page_size=8"),
    getProducts("is_featured=true&page_size=8"),
  ]);

  // Banner buttons go to the matching category when one exists, else a search.
  const links = {
    audio: promoHref(categories, /audio|speaker|ear(phone|bud)|headphone|sound/i, "audio"),
    charger: promoHref(categories, /charg|cable|adapter|power/i, "charger"),
    watch: promoHref(categories, /watch|wearable/i, "smartwatch"),
  };

  return (
    <main>
      <Hero links={links} />
      {categories.length > 0 && (
        <Categories categories={categories.map(mapCategoryForDisplay)} />
      )}
      <Brands />
      <NewArrival items={(newArrivals?.results || []).map(mapProductForDisplay)} />
      <HotDeals />
      <PromoBanner links={links} />
      <BestSeller items={(featured?.results || []).map(mapProductForDisplay)} />
      <Newsletter />
    </main>
  );
};

export default Home;
