import React, { useEffect } from 'react';
import type { ListingAction, ListingState, SelectOption } from "../../../types";
import CustomSelect from "../../ui/CustomSelect";
import FormLabel from "../../ui/FormLabel";
import SegmentedControl from "../../ui/SegmentedControl";
import DeveloperAutocomplete from "../../ui/DeveloperAutocomplete";

interface FormProps {
  state: ListingState;
  dispatch: React.Dispatch<ListingAction>;
  onComplete: () => void; // <-- إضافة onComplete
}

const SpecificationsForm = ({ state, dispatch, onComplete }: FormProps) => {
  const updateField = (field: keyof ListingState, value: string | SelectOption | null) => dispatch({ type: 'UPDATE_FIELD', field, value });

  // ## هذا هو التصحيح: التحقق من اكتمال الخطوة ##
  useEffect(() => {
    const { bedrooms, bathrooms, size, furnishingType } = state;
    if (bedrooms && bathrooms && size && Number(size) > 0 && furnishingType) {
      onComplete();
    }
  }, [state, onComplete]);

  return (
    <div className="space-y-6">
      <FormLabel text="Size (sqft)" required><div className="relative"><input type="number" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500" value={state.size} onChange={e => updateField('size', e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">sqft</span></div></FormLabel>
      <FormLabel text="Bedrooms" required><CustomSelect placeholder="Select an option" options={[
        { value: 'studio', label: 'Studio' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
      ]} value={state.bedrooms ? { value: state.bedrooms, label: state.bedrooms } : null} onChange={(val) => updateField('bedrooms', val ? val.value as string : '')} /></FormLabel>
      <FormLabel text="Bathrooms" required><CustomSelect placeholder="Select an option" options={[
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },

      ]} value={state.bathrooms ? { value: state.bathrooms, label: state.bathrooms } : null} onChange={(val) => updateField('bathrooms', val ? val.value as string : '')} /></FormLabel>
      <FormLabel text="Developer">
        <DeveloperAutocomplete
          value={state.developer}
          onChange={(value) => {
            console.log('Developer onChange:', value);
            updateField('developer', value);
          }}
          placeholder="Search developers..."
        />
      </FormLabel>
      <FormLabel text="Unit number"><input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500" value={state.unitNumber} onChange={e => updateField('unitNumber', e.target.value)} /><p className="text-xs text-gray-500 mt-1">This data is for internal use only. We won't display it to consumers.</p></FormLabel>
      <FormLabel text="No of parking spaces"><input type="number" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500" value={state.parkingSlots} onChange={e => updateField('parkingSlots', e.target.value)} /></FormLabel>
      <FormLabel text="Furnishing type" required><SegmentedControl options={[
        { label: 'Unfurnished', value: 'unfurnished' },
        { label: 'Semi furnished', value: 'semi-furnished' },
        { label: 'Furnished', value: 'furnished' }
      ]} value={state.furnishingType} onChange={(val) => updateField('furnishingType', val)} /></FormLabel>
      <FormLabel text="Property age">
        <input
          type="number"
          className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          value={state.age}
          onChange={e => updateField('age', e.target.value)}
        />
      </FormLabel>
      <FormLabel text="Number of floors">
        <input
          type="number"
          className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          value={state.numberOfFloors || ''}
          onChange={e => updateField('numberOfFloors', e.target.value)}
        />
      </FormLabel>
      <FormLabel text="Project status" required><CustomSelect placeholder="Select an option" options={[
        { value: 'resale-ready', label: 'Resale - Ready to move' },
        { value: 'resale-off-plan', label: 'Resale - Off-plan' }
      ]} value={state.projectStatus ? { value: state.projectStatus, label: state.projectStatus === 'resale-ready' ? 'Resale - Ready to move' : 'Resale - Off-plan' } : null} onChange={(val) => updateField('projectStatus', val ? val.value as string : '')} /></FormLabel>
      <FormLabel text="Owner Name"><input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500" value={state.ownerName} onChange={e => updateField('ownerName', e.target.value)} /></FormLabel>
    </div>
  );
};
export default SpecificationsForm;