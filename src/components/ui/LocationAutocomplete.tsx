import axios from 'axios';
import AsyncSelect from 'react-select/async';
import type { SelectOption } from '../../types';

interface LocationAutocompleteProps {
    value: SelectOption | null;
    onChange: (value: SelectOption | null) => void;
}

const LocationAutocomplete = ({ value, onChange }: LocationAutocompleteProps) => {

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
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/location-tree/search/autocomplete?keyword=${inputValue}&limit_by_city=50`
                );
                const options = response.data.data.map((loc: { id: number; title: string }) => ({
                    value: loc.id,
                    label: loc.title,
                }));
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

    return (
        <AsyncSelect
      isMulti={false}
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions
            value={value}
            onChange={handleChange}
            placeholder="Search and select locations..."
            className="react-select-container"
            classNamePrefix="react-select"
        />
    );
};

export default LocationAutocomplete;