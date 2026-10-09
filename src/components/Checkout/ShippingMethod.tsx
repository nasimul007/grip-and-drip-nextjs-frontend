import React from "react";

const ShippingMethod = ({ rates, selectedRate, onSelect }: any) => {
  const label = (rate: any) => {
    if (rate.area_type === "inside_dhaka") return "Inside Dhaka";
    return "Outside Dhaka";
  };

  return (
    <div className="bg-brand-card shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-brand-border py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-white">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          {(rates || []).map((rate: any) => (
            <label
              key={rate.id}
              htmlFor={`shipping_${rate.id}`}
              className="flex cursor-pointer select-none items-center gap-3.5"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  name="shipping"
                  id={`shipping_${rate.id}`}
                  className="sr-only"
                  onChange={() => onSelect(rate)}
                  checked={selectedRate?.id === rate.id}
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    selectedRate?.id === rate.id
                      ? "border-4 border-brand-accent"
                      : "border border-gray-4"
                  }`}
                ></div>
              </div>

              <div className="rounded-md border-[0.5px] py-3.5 px-5 w-full ease-out duration-200 hover:bg-brand-card hover:border-transparent hover:shadow-none">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">
                    {label(rate)}
                  </p>
                  <p className="text-white">
                    {rate.charge === 0
                      ? "Free"
                      : `৳${rate.charge.toFixed(2)}`}
                  </p>
                </div>
                {rate.free_shipping_minimum && (
                  <p className="text-custom-xs text-white">
                    Free shipping on orders over ৳{rate.free_shipping_minimum}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
