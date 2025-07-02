import React, { useEffect } from 'react';
import type { ListingAction, ListingState, SelectOption } from "../../../types";
import FormLabel from "../../ui/FormLabel";
import CustomSelect from '../../ui/CustomSelect';

interface FormProps { 
    state: ListingState; 
    dispatch: React.Dispatch<ListingAction>; 
    onComplete: () => void;
}

const PriceForm = ({ state, dispatch, onComplete }: FormProps) => {
  const updateField = (field: keyof ListingState, value: string | SelectOption | null) => dispatch({ type: 'UPDATE_FIELD', field, value });

  useEffect(() => {
      if (state.price) {
          onComplete();
      }
  }, [state.price, onComplete]);

  const chequeOptions = [
    {value: '1', label: '1'}, 
    {value: '2', label: '2'}, 
    {value: '3', label: '3'}, 
    {value: '4', label: '4'}
  ];

  return (
    <div className="space-y-6">
      <FormLabel text="Property price" required>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium">AED</span>
            <input 
              type="number" 
              placeholder="Enter amount" 
              className="w-full p-2.5 pl-12 border rounded-lg" 
              value={state.price} 
              onChange={e => updateField('price', e.target.value)} 
            />
        </div>
      </FormLabel>

      {state.offeringType === 'sale' && (
        <FormLabel text="Down payment">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium">AED</span>
                <input 
                  type="number" 
                  placeholder="Enter amount" 
                  className="w-full p-2.5 pl-12 border rounded-lg" 
                  value={state.downPayment} 
                  onChange={e => updateField('downPayment', e.target.value)} 
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">If there is no down payment required, then keep value as 0.</p>
        </FormLabel>
      )}

      {state.offeringType === 'rent' && state.rentalPeriod && (
        <FormLabel text="Number of cheques">
            <CustomSelect 
              options={chequeOptions} 
              placeholder="Select number of cheques" 
              value={state.numberOfCheques ? { value: state.numberOfCheques, label: state.numberOfCheques } : null} 
              onChange={(val) => updateField('numberOfCheques', val ? val.value as string : '')} 
            />
        </FormLabel>
      )}
    </div>
  );
};

export default PriceForm;