import axios from 'axios';
import AsyncSelect from 'react-select/async';
import type { SelectOption } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LocationAutocompleteProps {
    value: SelectOption | null;
    onChange: (value: SelectOption | null) => void;
}


const LocationAutocomplete = ({ value, onChange }: LocationAutocompleteProps) => {
    const { token } = useAuth();

    const loadOptions = (
        inputValue: string,
        callback: (options: SelectOption[]) => void
    ) => {
        if (!inputValue || inputValue.length < 2) {
            callback([]);
            return;
        }

        // استخدام setTimeout لتأخير الطلب (debounce)
        setTimeout(async () => {
            try {
                console.log('Searching for location:', inputValue);
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/location-tree/search/autocomplete?keyword=${inputValue}&limit_by_city=50`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log('Location API Response:', response.data);
                const options = response.data.data.map((loc: { id: number; title: string }) => ({
                    value: loc.id,
                    label: loc.title,
                }));
                console.log('Mapped Options:', options);
                callback(options);
            } catch (error) {
                console.error("Failed to fetch locations", error);
                callback([]);
            }
        }, 500); // تأخير 500ms
    };

    const handleChange = (selectedOptions: SelectOption | null) => {
        onChange(selectedOptions || null);
    };

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderColor: state.isFocused ? '#8b5cf6' : '#d1d5db', // violet-500 : gray-300
            boxShadow: state.isFocused ? '0 0 0 2px rgba(139, 92, 246, 0.2)' : 'none',
            borderRadius: '0.5rem',
            padding: '2px',
            '&:hover': {
                borderColor: '#8b5cf6',
            }
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#ede9fe' // violet-100
                : state.isFocused
                    ? '#f3f4f6' // gray-100
                    : 'white',
            color: state.isSelected
                ? '#5b21b6' // violet-800
                : '#1f2937', // gray-800
            cursor: 'pointer',
            padding: '10px 12px',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: '#1f2937', // gray-800
        }),
        input: (provided: any) => ({
            ...provided,
            color: '#1f2937', // gray-800
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 9999,
        })
    };

    return (
        <AsyncSelect
            isMulti={false}
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions={false}
            value={value}
            onChange={handleChange}
            placeholder="Search location (e.g. Dubai Marina)..."
            className="react-select-container shadow-sm"
            classNamePrefix="react-select"
            styles={customStyles}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            noOptionsMessage={({ inputValue }) =>
                !inputValue || inputValue.length < 2 ? "Type at least 2 characters..." : "No locations found"
            }
        />
    );
};

export default LocationAutocomplete;