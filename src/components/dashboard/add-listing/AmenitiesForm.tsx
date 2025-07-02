import React, { useEffect } from 'react';
import type { ListingAction, ListingState } from "../../../types";
import Checkbox from "../../ui/Checkbox";

const allAmenities = ["Balcony", "Barbecue Area", "Built in Wardrobes", "Central A/C", "Covered Parking", "Private Gym", "Private Jacuzzi", "Kitchen Appliances", "Maids Room", "Pets Allowed", "Private Garden", "Private Pool", "Shared Pool", "Study", "View of Water", "Security", "Concierge", "Shared Spa", "Shared Gym", "Maid Service", "Walk-in Closet", "View of Landmark", "Children's Play Area", "Lobby in Building", "Children's Pool", "Vastu-compliant"];

interface FormProps { 
    state: ListingState; 
    dispatch: React.Dispatch<ListingAction>;
    onComplete: () => void;
}

const AmenitiesForm = ({ state, dispatch, onComplete }: FormProps) => {

    useEffect(() => {
        if (state.amenities.length > 0) {
            onComplete();
        }
    }, [state.amenities, onComplete]);

    const handleToggle = (amenity: string) => {
        const newAmenities = state.amenities.includes(amenity) 
            ? state.amenities.filter(a => a !== amenity) 
            : [...state.amenities, amenity];
        dispatch({ type: 'UPDATE_FIELD', field: 'amenities', value: newAmenities });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAmenities.map(amenity => (
                <Checkbox key={amenity} label={amenity} checked={state.amenities.includes(amenity)} onChange={() => handleToggle(amenity)} />
            ))}
        </div>
    );
};

export default AmenitiesForm;