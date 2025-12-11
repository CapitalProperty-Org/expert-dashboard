import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { ListingAction, ListingState, SelectOption } from '../types';
import AddListingHeader from '../components/dashboard/add-listing/AddListingHeader';
import CoreDetailsForm from '../components/dashboard/add-listing/CoreDetailsForm';
import ListingPreview from '../components/dashboard/add-listing/ListingPreview';
import SpecificationsForm from '../components/dashboard/add-listing/SpecificationsForm';
import MediaForm from '../components/dashboard/add-listing/MediaForm';
import PriceForm from '../components/dashboard/add-listing/PriceForm';
import AmenitiesForm from '../components/dashboard/add-listing/AmenitiesForm';
import DescriptionForm from '../components/dashboard/add-listing/DescriptionForm';
import AccordionSection from '../components/dashboard/add-listing/AccordionSection';
import { useDebounce } from '../hooks/useDebounce';
import SuccessToast from '../components/ui/SuccessToast';
import ErrorToast from '../components/ui/ErrorToast';
import { useAuth } from '../context/AuthContext';

const initialState: ListingState = {
  uae_emirate: '', permitType: null, reraPermitNumber: '', dtcmPermitNumber: '',
  category: null, offeringType: null, rentalPeriod: null, propertyType: '', 
  propertyLocation: null, assignedAgent: null, reference: '', 
  available: 'immediately', availableDate: null, size: '', bedrooms: '', 
  bathrooms: '', developer: '', unitNumber: '', parkingSlots: '', 
  furnishingType: null, age: '', numberOfFloors: '', projectStatus: '', ownerName: '',
  price: '', downPayment: '', numberOfCheques: '', amenities: [], title: '', description: '',
  images: []
};

function listingReducer(state: ListingState, action: ListingAction): ListingState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_IMAGES':
      return { ...state, images: action.value };
    case 'RESET_PERMIT':
      return {
        ...state, 
        permitType: null, 
        reraPermitNumber: '', 
        dtcmPermitNumber: '',
        category: null,
        offeringType: null,
        rentalPeriod: null,
        propertyType: '',
        propertyLocation: null,
        assignedAgent: null,
        reference: '',
        // Reset other fields that might be affected
        size: '',
        bedrooms: '',
        bathrooms: '',
        developer: '',
        unitNumber: '',
        parkingSlots: '',
        furnishingType: null,
        age: '',
        numberOfFloors: '',
        projectStatus: '',
        ownerName: '',
        price: '',
        downPayment: '',
        numberOfCheques: '',
        amenities: [],
        title: '',
        description: '',
        // Keep emirate and available fields
        uae_emirate: state.uae_emirate,
        available: state.available,
        availableDate: state.availableDate
      };
    case 'RESET_REQUIREMENTS': {
        const { uae_emirate, permitType, reraPermitNumber, dtcmPermitNumber } = state;
        return { ...initialState, uae_emirate, permitType, reraPermitNumber, dtcmPermitNumber };
    }
    default:
      return state;
  }
}

const AddListingPage = () => {
  const { isLoading: isAuthLoading, token } = useAuth();
  const navigate = useNavigate();
  const [formData, dispatch] = useReducer(listingReducer, initialState);
  const [activeSection, setActiveSection] = useState('core');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [qualityScore, setQualityScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [agents, setAgents] = useState<SelectOption[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    if (isAuthLoading || !token) return;
    const fetchLookups = async () => {
        setLoadingLookups(true);
        try {
            const agentsRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users?role=3`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAgents(agentsRes.data.map((u: { id: number; first_name: string; last_name: string }) => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })));
        } catch (error) { console.error("Failed to fetch lookups", error); } 
        finally { setLoadingLookups(false); }
    };
    fetchLookups();
  }, [isAuthLoading, token]);


  useEffect(() => {
    if (!token) return;
    const calculateScore = async () => {
        const payload = {
            title: { en: debouncedFormData.title },
            description: { en: debouncedFormData.description },
            location: debouncedFormData.propertyLocation ? { id: (debouncedFormData.propertyLocation as SelectOption).value } : undefined,
            assigned_to: debouncedFormData.assignedAgent ? { id: (debouncedFormData.assignedAgent as SelectOption).value } : undefined,
            price: { type: debouncedFormData.offeringType, amounts: { [debouncedFormData.offeringType!]: Number(debouncedFormData.price) } },
            category: debouncedFormData.category,
            type: debouncedFormData.propertyType,
            bedrooms: debouncedFormData.bedrooms,
            bathrooms: debouncedFormData.bathrooms,
            size: Number(debouncedFormData.size),
            amenities: debouncedFormData.amenities,
            media: { images: debouncedFormData.images.map(() => ({})) }
        };
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/quality-score`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setQualityScore(response.data.value || 0);
        } catch (error) {
            console.error("Failed to calculate quality score", error);
            setQualityScore(0);
        }
    };
    calculateScore();
  }, [debouncedFormData, token]);

  const handlePublish = async () => {
    if (!completedSteps.includes('core')) {
        setError("Please complete the 'Core details' section first.");
        return;
    }

    if (!token) {
        setError("Authentication required. Please log in again.");
        return;
    }
      
    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    console.log('Developer value:', formData.developer, 'Type:', typeof formData.developer);
    
    const listingData = {
      assigned_to: { id: (formData.assignedAgent as SelectOption).value },
      available_from: formData.available === 'immediately' ? new Date().toISOString() : formData.availableDate?.toISOString(),
      price: {
          type: formData.offeringType,
          amounts: { [formData.offeringType!]: Number(formData.price) },
          downpayment: formData.offeringType === 'sale' && formData.downPayment ? Number(formData.downPayment) : undefined,
          number_of_cheques: formData.offeringType === 'rent' && formData.numberOfCheques ? Number(formData.numberOfCheques) : undefined
      },
      uae_emirate: formData.uae_emirate,
      title: { en: formData.title },
      description: { en: formData.description },
      location: { id: (formData.propertyLocation as SelectOption).value },
      compliance: { user_confirmed_data_is_correct: true },
      category: formData.category,
      amenities: formData.amenities,
      type: formData.propertyType,
      reference: formData.reference,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      size: Number(formData.size),
      developer_id: formData.developer ? Number(formData.developer) : null,
      unit_number: formData.unitNumber,
      parking_slots: Number(formData.parkingSlots),
      furnishing_type: formData.furnishingType,
      age: Number(formData.age),
      number_of_floors: formData.numberOfFloors ? Number(formData.numberOfFloors) : null,
      owner_name: formData.ownerName,
    };

    console.log('Final listingData:', listingData);

    const apiPayload = new FormData();
    apiPayload.append('data', JSON.stringify(listingData));
    formData.images.forEach(file => {
      apiPayload.append('images', file);
    });

    try {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings`, apiPayload, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        setShowSuccess(true);
        setTimeout(() => navigate('/listings-management'), 3000);
         } catch (err: unknown) {
         const errorMsg = err instanceof Error ? err.message : "Error: Could not publish listing.";
         setError(errorMsg);
     } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleStepComplete = (stepId: string) => {
      if (!completedSteps.includes(stepId)) {
          setCompletedSteps(prev => [...prev, stepId]);
      }
  };
  
  const handleSetImages = (files: File[]) => {
      dispatch({ type: 'SET_IMAGES', value: files });
  };

  const sections = [
    { id: 'core', title: 'Core details', component: <CoreDetailsForm state={formData} dispatch={dispatch} onComplete={() => handleStepComplete('core')} agents={agents} isLoadingAgents={loadingLookups} /> },
    { id: 'specs', title: 'Specifications', component: <SpecificationsForm state={formData} dispatch={dispatch} onComplete={() => handleStepComplete('specs')} /> },
    { id: 'media', title: 'Media', component: <MediaForm images={formData.images} onSetImages={handleSetImages} /> },
    { id: 'price', title: 'Price', component: <PriceForm state={formData} dispatch={dispatch} onComplete={() => handleStepComplete('price')} /> },
    { id: 'amenities', title: 'Amenities', component: <AmenitiesForm state={formData} dispatch={dispatch} onComplete={() => handleStepComplete('amenities')} /> },
    { id: 'description', title: 'Description', component: <DescriptionForm state={formData} dispatch={dispatch} onComplete={() => handleStepComplete('description')} /> },
  ];

  const handleToggle = (id: string) => {
    if (completedSteps.includes('core') || id === 'core') {
      setActiveSection(id === activeSection ? '' : id);
    }
  };

  return (
    <>
      <SuccessToast message="Listing created successfully!" show={showSuccess} onClose={() => setShowSuccess(false)} />
      <ErrorToast message={error || ''} show={!!error} onClose={() => setError(null)} />
      <div className="bg-white bg-gray-50 min-h-screen flex flex-col">
        <AddListingHeader qualityScore={qualityScore} onPublish={handlePublish} isSubmitting={isSubmitting} />
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Add a listing</h1>
            {sections.map(section => (
              <AccordionSection 
                key={section.id}
                title={section.title}
                isCompleted={completedSteps.includes(section.id)}
                isLocked={section.id !== 'core' && !completedSteps.includes('core')}
                isOpen={activeSection === section.id} 
                onToggle={() => handleToggle(section.id)}
              >
                {section.component}
              </AccordionSection>
            ))}
          </div>
          <div className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin">
                   <ListingPreview state={formData} images={formData.images} />
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddListingPage;