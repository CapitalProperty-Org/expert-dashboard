import React, { useEffect } from 'react';
import type { ListingAction, ListingState } from "../../../types";
import FormLabel from "../../ui/FormLabel";
import SegmentedControl from "../../ui/SegmentedControl";

interface FormProps { 
    state: ListingState; 
    dispatch: React.Dispatch<ListingAction>;
    onComplete: () => void;
}

const DescriptionForm = ({ state, dispatch, onComplete }: FormProps) => {
    
    useEffect(() => {
        // يكتمل القسم عند إدخال العنوان والوصف
        if (state.title && state.description) {
            onComplete();
        }
    }, [state.title, state.description, onComplete]);

    return (
        <div className="space-y-6">
            <SegmentedControl options={[{label: 'English', value: 'en'}, {label: 'Arabic', value: 'ar'}]} value="en" onChange={() => {}} />
            <FormLabel text="Title"><input type="text" className="w-full p-2.5 border rounded-lg" value={state.title} onChange={e => dispatch({type: 'UPDATE_FIELD', field: 'title', value: e.target.value})} /></FormLabel>
            <FormLabel text="Description"><textarea rows={5} className="w-full p-2.5 border rounded-lg" value={state.description} onChange={e => dispatch({type: 'UPDATE_FIELD', field: 'description', value: e.target.value})} /></FormLabel>
            <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm">Generate with AI</button>
        </div>
    );
};
export default DescriptionForm;