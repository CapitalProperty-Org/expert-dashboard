import React, { useState } from "react";
import { X, Search } from "lucide-react";
import CustomSelect from "../ui/CustomSelect";
import { cn } from "../../lib/utils";
import DatePicker from "react-datepicker";

interface MoreFiltersModalProps {
  onClose: () => void;
  initialFilters: { [key: string]: string | number | boolean };
  onApply: (newFilters: { [key: string]: string | number | boolean }) => void;
}

const getTypeOptions = (category: string) => {
  if (category === "residential")
    return [
      { value: "apartment", label: "Apartment" },
      { value: "bulk units", label: "Bulk Units" },
      { value: "bungalow", label: "Bungalow" },
      { value: "compound", label: "Compound" },
      { value: "duplex", label: "Duplex" },
      { value: "full floor", label: "Full Floor" },
      { value: "half floor", label: "Half Floor" },
      { value: "hotel apartment", label: "Hotel Apartment" },
      { value: "penthouse", label: "Penthouse" },
      { value: "townhouse", label: "Townhouse" },
      { value: "villa", label: "Villa" },
      { value: "whole building", label: "Whole Building" },
    ];
  if (category === "commercial")
    return [
      { value: "bulk units", label: "Bulk Units" },
      { value: "business center", label: "Business Center" },
      { value: "coworking spaces", label: "Coworking spaces" },
      { value: "factory", label: "Factory" },
      { value: "farm", label: "Farm" },
      { value: "full floor", label: "Full Floor" },
      { value: "half floor", label: "Half Floor" },
      { value: "labor camp", label: "Labor Camp" },
      { value: "land", label: "Land" },
      { value: "office space", label: "Office Space" },
      { value: "retail", label: "Retail" },
      { value: "showroom", label: "Showroom" },
      { value: "staff recommended", label: "Staff Recommended" },
      { value: "villa", label: "Villa" },
      { value: "warehouse", label: "Warehouse" },
      { value: "whole building", label: "Whole Building" },
    ];
  return [];
};

const MoreFiltersModal = ({
  onClose,
  initialFilters,
  onApply,
}: MoreFiltersModalProps) => {
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [expiryDateRange, setExpiryDateRange] = useState<
    [Date | null, Date | null]
  >([null, null]);

  const handleFilterChange = (key: string, value: string | number) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setExpiryDateRange(dates);
    setTempFilters((prev) => ({
      ...prev,
      expiry_date_from: start ? start.toISOString().split("T")[0] : "",
      expiry_date_to: end ? end.toISOString().split("T")[0] : "",
    }));
  };

  const handleBedroomClick = (opt: string) => {
    if (opt === "5+") {
      setTempFilters((prev) => ({ ...prev, bedrooms: "", bedrooms_gte: "5" }));
    } else {
      setTempFilters((prev) => ({ ...prev, bedrooms: opt, bedrooms_gte: "" }));
    }
  };

  const handleApplyClick = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleResetClick = () => {
    const resetState: { [key: string]: string | number | boolean } = {};
    Object.keys(initialFilters).forEach((key) => {
      resetState[key] = "";
    });
    // الحفاظ على الفلاتر الأساسية للصفحة
    if (initialFilters.draft) resetState.draft = true;
    if (initialFilters.live) resetState.live = true;
    if (initialFilters.archived) resetState.archived = true;
    setTempFilters(resetState);
    setExpiryDateRange([null, null]);
  };

  // options for selects
  const bedroomOptions = ["studio", "1", "2", "3", "4", "5+"];
  const categoryOptions = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
  ];
  const offeringOptions = [
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ];
  const furnishingOptions = [
    { value: "furnished", label: "Furnished" },
    { value: "unfurnished", label: "Unfurnished" },
    { value: "semi-furnished", label: "Semi furnished" },
  ];
  const typeOptions = getTypeOptions(tempFilters.category || "");
  // Temporarily hidden options
  /*
  const exposureOptions = [
    { value: "featured", label: "Featured" },
    { value: "standard", label: "Standard" },
    { value: "premium", label: "Premium" },
  ];
  const spotlightStatusOptions = [
    { value: "outcompeted", label: "Outcompeted" },
    { value: "eligible", label: "Eligible" },
    { value: "winning offer", label: "Winning Offer" },
    { value: "spotlight", label: "Spotlight" },
    { value: "expired", label: "Expired" },
    { value: "not eligible", label: "Not eligible" },
  ];
  const verificationStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
  ];
  const stateOptions = [
    { value: "draft", label: "Draft" },
    { value: "live", label: "Published" },
    { value: "takendown", label: "Takendown" },
    { value: "archived", label: "Archived" },
    { value: "approved", label: "Approved" },
    { value: "failed", label: "Failed" },
  ];
  */
  const completionStatusOptions = [
    { value: "resale - Ready to move", label: "Resale - Ready to move" },
    { value: "Primary - Ready to move", label: "Primary - Ready to move" },
    { value: "Resale - Off plan", label: "Resale - Off plan" },
    { value: "Primary - Off plan", label: "Primary - Off plan" },
  ];

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
      {children}
    </label>
  );

  const baseInputStyles =
    "w-full p-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-shadow";

    console.log(     tempFilters    )
  return (
    <>

      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">More Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow p-8 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <Label>Reference Number</Label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Enter Reference Number"
                  value={String(tempFilters.reference || "")}
                  onChange={(e) =>
                    handleFilterChange("reference", e.target.value)
                  }
                  className={`${baseInputStyles} pl-9`}
                />
              </div>
            </div>

            <div>
              <Label>Agents</Label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Enter Agent ID"
                  value={String(tempFilters.assigned_to_id || "")}
                  onChange={(e) =>
                    handleFilterChange("assigned_to_id", e.target.value)
                  }
                  className={`${baseInputStyles} pl-9`}
                />
              </div>
            </div>

            {/* Temporarily hidden fields
            <div>
              <Label>Exposure Type</Label>
              <CustomSelect
                options={exposureOptions}
                placeholder="Select exposure type"
                value={exposureOptions.find(opt => opt.value === tempFilters.exposureType) || null}
                onChange={v => handleFilterChange("exposureType", v?.value ?? "")}
              />
            </div>

            <div>
              <Label>Spotlight Status</Label>
              <CustomSelect
                options={spotlightStatusOptions}
                placeholder="Select Status"
                value={spotlightStatusOptions.find(opt => opt.value === tempFilters.spotlightStatus) || null}
                onChange={v => handleFilterChange("spotlightStatus", v?.value ?? "")}
              />
            </div>

            <div>
              <Label>Verification Status</Label>
              <CustomSelect
                options={verificationStatusOptions}
                placeholder="Select Status"
                value={verificationStatusOptions.find(opt => opt.value === tempFilters.verificationStatus) || null}
                onChange={v => handleFilterChange("verificationStatus", v?.value ?? "")}
              />
            </div>

            <div>
              <Label>State</Label>
              <CustomSelect
                options={stateOptions}
                placeholder="Select State"
                value={stateOptions.find(opt => opt.value === tempFilters.state) || null}
                onChange={v => handleFilterChange("state", v?.value ?? "")}
              />
            </div>
            */}

            <div>
              <Label>Completion Status</Label>
              <CustomSelect
                options={completionStatusOptions}
                placeholder="Select completion status"
                value={completionStatusOptions.find(opt => opt.value === tempFilters.completionStatus) || null}
                onChange={v => handleFilterChange("completionStatus", v?.value ?? "")}
              />
            </div>

            <div>
              <Label>Property category</Label>
              <CustomSelect
                options={categoryOptions}
                placeholder="Select property category"
                value={categoryOptions.find(opt => opt.value === tempFilters.category) || null}
                onChange={val => setTempFilters((prev) => ({
                  ...prev,
                  category: val?.value ?? "",
                  type: "",
                }))}
              />
            </div>

            <div>
              <Label>Offering type</Label>
              <CustomSelect
                options={offeringOptions}
                placeholder="Select offering type"
                value={offeringOptions.find(opt => opt.value === tempFilters.offering_type) || null}
                onChange={v => handleFilterChange("offering_type", v?.value ?? "")}
              />
            </div>

            <div>
              <Label>Property Type</Label>
              <CustomSelect
                options={typeOptions}
                placeholder="Select property type"
                value={typeOptions.find(opt => opt.value === String(tempFilters.type)) || null}
                onChange={v => handleFilterChange("type", v?.value ?? "")}
                disabled={!tempFilters.category || tempFilters.category === "" || tempFilters.category === true}
              />
            </div>

            <div>
              <Label>Property price (AED)</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Price"
                  value={String(tempFilters.price_min || "")}
                  onChange={(e) =>
                    handleFilterChange("price_min", e.target.value)
                  }
                  className={baseInputStyles}
                />
                <input
                  type="number"
                  placeholder="Max. Price"
                  value={String(tempFilters.price_max || "")}
                  onChange={(e) =>
                    handleFilterChange("price_max", e.target.value)
                  }
                  className={baseInputStyles}
                />
              </div>
            </div>

            <div>
              <Label>Furnishing</Label>
              <CustomSelect
                options={furnishingOptions}
                placeholder="Select furnishing"
                value={furnishingOptions.find(opt => opt.value === tempFilters.furnishing_type) || null}
                onChange={v => handleFilterChange("furnishing_type", v?.value ?? "")}
              />
            </div>

            <div>
              <Label>Property size (sqft)</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Area"
                  value={String(tempFilters.size_min || "")}
                  onChange={(e) =>
                    handleFilterChange("size_min", e.target.value)
                  }
                  className={baseInputStyles}
                />
                <input
                  type="number"
                  placeholder="Max. Area"
                  value={String(tempFilters.size_max || "")}
                  onChange={(e) =>
                    handleFilterChange("size_max", e.target.value)
                  }
                  className={baseInputStyles}
                />
              </div>
            </div>

            <div>
              <Label>Apt/Villa/Unit number</Label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Enter unit number"
                  value={String(tempFilters.unit_number || "")}
                  onChange={(e) =>
                    handleFilterChange("unit_number", e.target.value)
                  }
                  className={`${baseInputStyles} pl-9`}
                />
              </div>
            </div>

            <div>
              <Label>Expiry date</Label>
              <DatePicker
                selectsRange={true}
                startDate={expiryDateRange[0]}
                endDate={expiryDateRange[1]}
                onChange={handleDateChange}
                className={baseInputStyles}
                placeholderText="Select date range"
                isClearable={true}
              />
            </div>
            <div>
              <Label>Owner</Label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Select owner"
                  value={String(tempFilters.owner_name || "")}
                  onChange={(e) =>
                    handleFilterChange("owner_name", e.target.value)
                  }
                  className={`${baseInputStyles} pl-9`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>DTCM/RERA Number</Label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Enter DTCM/RERA Number"
                  value={String(tempFilters.dtcmReraNumber || "")}
                  onChange={(e) =>
                    handleFilterChange("dtcmReraNumber", e.target.value)
                  }
                  className={`${baseInputStyles} pl-9`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Bedrooms</Label>
              <div className="flex flex-wrap gap-2">
                {bedroomOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleBedroomClick(opt)}
                    className={cn(
                      "px-5 py-2 border rounded-lg text-sm font-medium transition-colors",
                      tempFilters.bedrooms === opt ||
                        (opt === "5+" && tempFilters.bedrooms_gte)
                        ? "bg-violet-600 text-white border-violet-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50/70">
          <button
            onClick={handleResetClick}
            className="text-sm font-semibold text-gray-700 py-2.5 px-5 rounded-lg hover:bg-gray-200/70"
          >
            Reset
          </button>
          <button
            onClick={handleApplyClick}
            className="text-sm font-semibold text-white bg-red-600 py-2.5 px-5 rounded-lg ml-3"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default MoreFiltersModal;
