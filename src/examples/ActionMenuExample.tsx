import React from 'react';
import ActionMenu from '../components/ui/ActionMenu';

// Example component showing how to use ActionMenu with listingData
const ActionMenuExample = () => {
    // Example listing data
    const exampleListingData = {
        reference: "01K2V72V33ZR4BE19AEER4PH6W",
        bedrooms: "1",
        type: "Apartment",
        price: {
            type: "rent",
            amounts: {
                yearly: 65000
            }
        },
        location: {
            name: "Marina Bay by DAMAC, Najmat Abu Dhabi Island, Abu Dhabi"
        },
        state: {
            stage: "draft"
        },
        bathrooms: "2",
        size: 800,
        category: "Residential",
        amenities: [
            "Balcony",
            "Central A/C",
            "Covered Parking",
            "Pets Allowed",
            "Shared Pool",
            "View of Water",
            "Security",
            "Shared Gym"
        ],
        description: {
            en: "Fantastic yearly rental opportunity in the vibrant Al Reem Island. This spacious 1-bedroom, 2-bathroom apartment spanning 800 sqft at Marina Bay by DAMAC offers stunning waterfront views and modern amenities. The unfurnished apartment on the 10th floor features a balcony, central AC, covered parking, shared pool, and gym. Pet-friendly policy available. Located in Al Reem Island, a bustling community popular among affluent professionals and young families. Residents benefit from proximity to top-notch facilities like Repton School, Rozana Al Reem restaurants, and Prime Mart grocery stores. The area boasts excellent connectivity, with easy access to Al Maryah and Saadiyat Islands. Nearby mosques and parks add to the community's appeal, making this apartment an ideal home for those seeking a dynamic and convenient lifestyle in Abu Dhabi's most desirable location."
        }
    };

    const handleActionComplete = () => {
        console.log('Action completed, refreshing data...');
        // Refresh your listings data here
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">ActionMenu Example with PDF Generation</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {exampleListingData.bedrooms} BR {exampleListingData.type} for {exampleListingData.price.type}
                        </h2>
                        <p className="text-gray-600">{exampleListingData.location.name}</p>
                        <p className="text-sm text-gray-500">Reference: {exampleListingData.reference}</p>
                    </div>
                    
                    <ActionMenu 
                        listingId={exampleListingData.reference}
                        onActionComplete={handleActionComplete}
                        listingData={exampleListingData}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                        <h3 className="font-medium text-gray-700">Specifications</h3>
                        <p className="text-sm text-gray-600">Status: {exampleListingData.state.stage}</p>
                        <p className="text-sm text-gray-600">Rooms: {exampleListingData.bedrooms}</p>
                        <p className="text-sm text-gray-600">Bathrooms: {exampleListingData.bathrooms}</p>
                        <p className="text-sm text-gray-600">Size: {exampleListingData.size} sqft</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                        <h3 className="font-medium text-gray-700">Price</h3>
                        <p className="text-lg font-bold text-green-600">
                            {exampleListingData.price.amounts.yearly?.toLocaleString()} AED / Yearly
                        </p>
                    </div>
                </div>
                
                <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                        {exampleListingData.amenities.map((amenity, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                        {exampleListingData.description.en}
                    </p>
                </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">How to Use:</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Click the three-dot menu (⋮) on the right</li>
                    <li>2. Select "Create PDF" to generate a detailed PDF</li>
                    <li>3. The PDF will include all property details, specifications, and amenities</li>
                    <li>4. Use "Archive" to move the listing to archive</li>
                    <li>5. Use "Delete" to permanently remove the listing</li>
                </ol>
            </div>
        </div>
    );
};

export default ActionMenuExample;
