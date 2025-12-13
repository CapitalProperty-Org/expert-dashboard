import React, { useEffect } from "react";
import type { ListingAction, ListingState, SelectOption } from "../../../types";
import CustomSelect from "../../ui/CustomSelect";
import SegmentedControl from "../../ui/SegmentedControl";
import FormLabel from "../../ui/FormLabel";
import LocationAutocomplete from "../../ui/LocationAutocomplete";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Home, Building, BadgeDollarSign, BadgePercent } from "lucide-react";

interface FormProps {
  state: ListingState;
  dispatch: React.Dispatch<ListingAction>;
  onComplete: () => void;
  agents: SelectOption[];
  isLoadingAgents: boolean;
}

const CoreDetailsForm = ({
  state,
  dispatch,
  onComplete,
  agents,
}: FormProps) => {
  const updateField = (
    field: keyof ListingState,
    value: string | SelectOption | null | Date | number | unknown
  ) => {
    if (field === "uae_emirate") {
      const newEmirate = typeof value === 'string' ? value : '';
      if (newEmirate !== state.uae_emirate) {
        dispatch({ type: "RESET_PERMIT" });
      }
    }

    if (field === "permitType") {
      dispatch({ type: "RESET_PERMIT" });
    }

    if (
      field === "uae_emirate" ||
      field === "category" ||
      field === "offeringType"
    ) {
      dispatch({ type: "UPDATE_FIELD", field: "propertyType", value: "" });
    }
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  useEffect(() => {
    const {
      uae_emirate,
      category,
      offeringType,
      propertyType,
      propertyLocation,
      assignedAgent,
      reference,
      permitType,
      reraPermitNumber,
      dtcmPermitNumber,
    } = state;
    const baseConditionsMet =
      uae_emirate &&
      category &&
      offeringType &&
      propertyType &&
      propertyLocation &&
      assignedAgent &&
      reference;
    const dubaiPermitConditionsMet =
      uae_emirate === "dubai"
        ? permitType &&
        (permitType === "none" ||
          (reraPermitNumber && reraPermitNumber.length > 5) ||
          (dtcmPermitNumber && dtcmPermitNumber.length > 5))
        : true;

    const abuDhabiPermitConditionsMet =
      uae_emirate === "abu_dhabi"
        ? permitType &&
        (permitType === "adrec" || permitType === "non-adrec") &&
        (permitType === "non-adrec" ||
          (permitType === "adrec" && dtcmPermitNumber && dtcmPermitNumber.length > 5 && reraPermitNumber && reraPermitNumber.length > 5))
        : true;

    const northernEmiratesPermitConditionsMet =
      uae_emirate === "northern_emirates" ? true : true;
    if (baseConditionsMet && dubaiPermitConditionsMet && abuDhabiPermitConditionsMet && northernEmiratesPermitConditionsMet) {
      onComplete();
    }
  }, [state, onComplete]);

  const getPropertyTypeOptions = () => {
    if (state.category === "residential")
      return [
        { value: 'apartment', label: "Apartment" },
        { value: 'bulk units', label: "Bulk Units" },
        { value: 'bungalow', label: "Bungalow" },
        { value: 'compound', label: "Compound" },
        { value: 'duplex', label: "Duplex" },
        { value: 'full floor', label: "Full Floor" },
        { value: 'half floor', label: "Half Floor" },
        { value: 'hotel apartment', label: "Hotel Apartment" },
        { value: 'penthouse', label: "Penthouse" },
        { value: 'townhouse', label: "Townhouse" },
        { value: 'villa', label: "Villa" },
        { value: 'whole building', label: "Whole Building" },
      ];
    if (state.category === "commercial")
      return [
        { value: 'bulk units', label: "Bulk Units" },
        { value: 'business center', label: "Business Center" },
        { value: 'coworking spaces', label: "Coworking spaces" },
        { value: 'factory', label: "Factory" },
        { value: 'farm', label: "Farm" },
        { value: 'full floor', label: "Full Floor" },
        { value: 'half floor', label: "Half Floor" },
        { value: 'labor camp', label: "Labor Camp" },
        { value: 'land', label: "Land" },
        { value: 'office space', label: "Office Space" },
        { value: 'retail', label: "Retail" },
        { value: 'showroom', label: "Showroom" },
        { value: 'staff recommended', label: "Staff Recommended" },
        { value: 'villa', label: "Villa" },
        { value: 'warehouse', label: "Warehouse" },
        { value: 'whole building', label: "Whole Building" },
      ];
    return [];
  };

  return (
    <div className="space-y-6">
      <FormLabel text="Emirate" required>
        <CustomSelect
          placeholder="Select an option"
          options={[
            { value: "dubai", label: "Dubai" },
            { value: "abu_dhabi", label: "Abu Dhabi" },
            { value: "northern_emirates", label: "Northern Emirates" },
          ]}
          value={
            state.uae_emirate
              ? {
                value: state.uae_emirate,
                label:
                  state.uae_emirate === "dubai"
                    ? "Dubai"
                    : state.uae_emirate === "abu_dhabi"
                      ? "Abu Dhabi"
                      : "Northern Emirates",
              }
              : null
          }
          onChange={(val) =>
            updateField("uae_emirate", val ? (val.value as string) : "")
          }
        />
      </FormLabel>

      {state.uae_emirate && state.uae_emirate === "dubai" && (
        <>
          <FormLabel text="Permit type" required>
            <SegmentedControl
              options={[
                { label: "RERA", value: "rera" },
                { label: "DTCM", value: "dtcm" },
                { label: "None (DIFC only)", value: "none" },
              ]}
              value={state.permitType}
              onChange={(val) => updateField("permitType", val)}
            />
          </FormLabel>
          {state.permitType === "rera" && (
            <FormLabel text="RERA permit number" required>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full p-2.5 border rounded-lg bg-white text-gray-900"
                  value={state.reraPermitNumber}
                  onChange={(e) =>
                    updateField("reraPermitNumber", e.target.value)
                  }
                />
                <button className="bg-white border border-violet-600 text-violet-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-violet-50 transition">
                  Validate
                </button>
              </div>
            </FormLabel>
          )}
          {state.permitType === "dtcm" && (
            <FormLabel text="DTCM permit number" required>
              <input
                type="text"
                className="w-full p-2.5 border rounded-lg bg-white text-gray-900"
                value={state.dtcmPermitNumber}
                onChange={(e) =>
                  updateField("dtcmPermitNumber", e.target.value)
                }
              />
            </FormLabel>
          )}
        </>
      )}

      {state.uae_emirate && state.uae_emirate === "abu_dhabi" && (
        <>
          <FormLabel text="Permit type" required>
            <SegmentedControl
              options={[
                { label: "ADREC", value: "adrec" },
                { label: "Non-ADREC", value: "non-adrec" },
              ]}
              value={state.permitType}
              onChange={(val) => updateField("permitType", val)}
            />
          </FormLabel>
          {state.permitType === "adrec" && (
            <>
              <FormLabel text="Broker license" required>
                <CustomSelect
                  placeholder="Select an option*"
                  options={[
                    { value: "adrec_license_1", label: "ADREC License 1" },
                    { value: "adrec_license_2", label: "ADREC License 2" },
                    { value: "adrec_license_3", label: "ADREC License 3" },
                  ]}
                  value={state.reraPermitNumber ? { value: state.reraPermitNumber, label: state.reraPermitNumber } : null}
                  onChange={(val) => updateField("reraPermitNumber", val ? val.value as string : "")}
                />
              </FormLabel>
              <FormLabel text="Permit number" required>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full p-2.5 border rounded-lg bg-white text-gray-900"
                    value={state.dtcmPermitNumber}
                    onChange={(e) => updateField("dtcmPermitNumber", e.target.value)}
                    placeholder="Enter permit number"
                  />
                  <button className="bg-white border border-violet-600 text-violet-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-violet-50 transition">
                    Validate
                  </button>
                </div>
              </FormLabel>
            </>
          )}
        </>
      )}

      {state.uae_emirate &&
        (state.uae_emirate === "northern_emirates" ||
          (state.uae_emirate === "dubai" &&
            state.permitType &&
            (state.permitType === "none" ||
              (state.reraPermitNumber && state.reraPermitNumber.length > 5) ||
              (state.dtcmPermitNumber && state.dtcmPermitNumber.length > 5))) ||
          (state.uae_emirate === "abu_dhabi" &&
            state.permitType &&
            ((state.permitType === "non-adrec") ||
              (state.permitType === "adrec" &&
                state.dtcmPermitNumber &&
                state.dtcmPermitNumber.length > 5 &&
                state.reraPermitNumber &&
                state.reraPermitNumber.length > 5)))) && (
          <FormLabel text="Category" required>
            <SegmentedControl
              options={[
                {
                  label: "Residential",
                  value: "residential",
                  icon: <Home size={20} />,
                },
                {
                  label: "Commercial",
                  value: "commercial",
                  icon: <Building size={20} />,
                },
              ]}
              value={state.category}
              onChange={(val) => updateField("category", val)}
            />
          </FormLabel>
        )}

      {state.category && (
        <FormLabel text="Offering type" required>
          <SegmentedControl
            options={[
              {
                label: "Rent",
                value: "rent",
                icon: <BadgePercent size={20} />,
              },
              {
                label: "Sale",
                value: "sale",
                icon: <BadgeDollarSign size={20} />,
              },
            ]}
            value={state.offeringType}
            onChange={(val) => updateField("offeringType", val)}
          />
        </FormLabel>
      )}

      {state.offeringType === "rent" && (
        <FormLabel text="Rental period" required>
          <CustomSelect
            options={[
              { value: "yearly", label: "Per year" },
              { value: "monthly", label: "Per month" },
              { value: "weekly", label: "Per week" },
              { value: "daily", label: "Per day" },
            ]}
            value={
              state.rentalPeriod
                ? {
                  value: state.rentalPeriod,
                  label:
                    state.rentalPeriod === "yearly"
                      ? "Per year"
                      : "Per month",
                }
                : null
            }
            onChange={(val) =>
              updateField("rentalPeriod", val ? (val.value as string) : null)
            }
            placeholder="Select rental period"
          />
        </FormLabel>
      )}

      {state.offeringType &&
        (state.offeringType === "sale" ||
          (state.offeringType === "rent" && state.rentalPeriod)) && (
          <FormLabel text="Property type" required>
            <CustomSelect
              placeholder="Select property type"
              options={getPropertyTypeOptions()}
              value={
                state.propertyType
                  ? { value: state.propertyType, label: state.propertyType }
                  : null
              }
              onChange={(val) =>
                updateField("propertyType", val ? (val.value as string) : "")
              }
            />
          </FormLabel>
        )}

      {state.propertyType && (
        <>
          <FormLabel text="Property location" required>
            <LocationAutocomplete
              value={state.propertyLocation}
              onChange={(val) => updateField("propertyLocation", val)}
            />
          </FormLabel>
          <FormLabel text="Assigned agent" required>
            <CustomSelect
              options={agents}
              value={state.assignedAgent}
              onChange={(val) => updateField("assignedAgent", val)}
              placeholder="Select an agent"
            />
          </FormLabel>
          <FormLabel text="Reference" required>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2.5 border rounded-lg pr-12 bg-white text-gray-900"
                value={state.reference}
                onChange={(e) => updateField("reference", e.target.value)}
                maxLength={50}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {state.reference.length}/50
              </span>
            </div>
          </FormLabel>
          <FormLabel text="Available">
            <SegmentedControl
              options={[
                { label: "Immediately", value: "immediately" },
                { label: "From date", value: "fromDate" },
              ]}
              value={state.available}
              onChange={(val) => updateField("available", val)}
            />
            {state.available === "fromDate" && (
              <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                <DayPicker
                  mode="single"
                  selected={state.availableDate || undefined}
                  onSelect={(date) => updateField("availableDate", date || null)}
                  disabled={{ before: new Date() }}
                  className="mx-auto"
                />
              </div>
            )}
          </FormLabel>
        </>
      )}
    </div>
  );
};

export default CoreDetailsForm;
