"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import WishlistButton from "@/components/Common/WishlistButton";
import { useCart, resolveAddableItem } from "@/lib/useCart";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { mapProductDetailForDisplay } from "@/lib/mappers";
import type { ProductDetail } from "@/lib/types";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();

  const dispatch = useDispatch<AppDispatch>();
  const { addItem } = useCart();

  // update the QuickView state with full product detail
  const handleQuickViewUpdate = async () => {
    try {
      const detail = await api.get<ProductDetail>(`/api/products/${item.slug}/`);
      dispatch(updateQuickView(mapProductDetailForDisplay(detail)));
    } catch (err) {
      console.error("Failed to fetch product detail:", err);
      dispatch(updateQuickView({ ...item }));
    }
  };

  // add to cart
  const handleAddToCart = async () => {
    const payload = await resolveAddableItem(item);
    if (payload) addItem(payload);
  };

  return (
    <div className="group bg-brand-card border border-brand-border rounded-lg overflow-hidden">
      <div className="relative overflow-hidden aspect-[1/1]">
        <div className="absolute inset-4 bg-white/[0.04] blur-2xl rounded-full pointer-events-none" />
        <Link href={item.slug ? `/shop/${item.slug}` : "/shop-details"} className="relative block w-full h-full">
          {typeof item.imgs?.previews[0] === 'string' && item.imgs.previews[0].trim() ? (
            <Image src={item.imgs.previews[0]} alt="" fill className="object-cover transition-transform duration-300 hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-muted text-sm">
              No Image
            </div>
          )}
        </Link>

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            id="newOne"
            aria-label="button for quick view"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] border border-brand-border ease-out duration-200 text-white bg-brand-card hover:text-brand-accent"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z"
                fill=""
              />
            </svg>
          </button>

          <button
            onClick={() => handleAddToCart()}
            className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-brand-accent text-white ease-out duration-200 hover:bg-brand-hover"
          >
            Add to cart
          </button>

          <WishlistButton item={item} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center gap-1">
            <Image
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={15}
              height={15}
            />
            <Image
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={15}
              height={15}
            />
            <Image
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={15}
              height={15}
            />
            <Image
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={15}
              height={15}
            />
            <Image
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={15}
              height={15}
            />
          </div>

          <p className="text-custom-sm">({item.reviews})</p>
        </div>

        <h3 className="font-medium text-white ease-out duration-200 hover:text-brand-accent mb-1.5 line-clamp-1" title={item.title}>
          <Link href={item.slug ? `/shop/${item.slug}` : "/shop-details"}>
            {" "}
            {item.title}{" "}
          </Link>
        </h3>

        <span className="flex items-center gap-2 font-medium text-lg">
          <span className="text-white">৳{item.discountedPrice}</span>
          {item.price !== item.discountedPrice && (
            <span className="text-brand-muted line-through">৳{item.price}</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default SingleGridItem;
