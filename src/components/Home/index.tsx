import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import Newsletter from "../Common/Newsletter";
import { getCategoryTree, getProducts } from "@/lib/server-api";
import { mapCategoryForDisplay, mapProductForDisplay } from "@/lib/mappers";

const Home = async () => {
  const [categories, newArrivals, featured] = await Promise.all([
    getCategoryTree(),
    getProducts("ordering=-created_at&page_size=8"),
    getProducts("is_featured=true&page_size=6"),
  ]);

  return (
    <main>
      <Hero />
      {categories.length > 0 && (
        <Categories categories={categories.map(mapCategoryForDisplay)} />
      )}
      <NewArrival items={(newArrivals?.results || []).map(mapProductForDisplay)} />
      <PromoBanner />
      <BestSeller items={(featured?.results || []).map(mapProductForDisplay)} />
      <Newsletter />
    </main>
  );
};

export default Home;
