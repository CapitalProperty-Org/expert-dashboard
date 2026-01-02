import React, { useEffect } from 'react';
import type { ListingAction, ListingState } from "../../../types";
import FormLabel from "../../ui/FormLabel";
import SegmentedControl from "../../ui/SegmentedControl";
import AiChatAssistant from "./AiChatAssistant";

interface FormProps {
    state: ListingState;
    dispatch: React.Dispatch<ListingAction>;
    onComplete: () => void;
}

const DescriptionForm = ({ state, dispatch, onComplete }: FormProps) => {

    useEffect(() => {
        // يكتمل القسم عند إدخال العنوان والوصف
        if (state.title && state.title.trim().length > 0 &&
            state.description && state.description.trim().length > 0) {
            onComplete();
        }
    }, [state.title, state.description, onComplete]);

    const [showAi, setShowAi] = React.useState(false);

    return (
        <div className="space-y-6">
            <SegmentedControl options={[{ label: 'English', value: 'en' }, { label: 'Arabic', value: 'ar' }]} value="en" onChange={() => { }} />
            <FormLabel text="Title"><input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500" value={state.title} onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value })} /></FormLabel>
            <FormLabel text="Description"><textarea rows={5} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none" value={state.description} onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value })} /></FormLabel>
            <button
                onClick={() => setShowAi(true)}
                className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition"
            >
                Generate with AI
            </button>
            <AiChatAssistant
                isOpen={showAi}
                onClose={() => setShowAi(false)}
                currentDescription={state.description}
                onAcceptDescription={(desc) => {
                    dispatch({ type: 'UPDATE_FIELD', field: 'description', value: desc });
                    setShowAi(false);
                }}
                listingState={state}
            />
        </div>
    );
};
export default DescriptionForm;