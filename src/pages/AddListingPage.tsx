import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import ConfirmModal from '../components/ui/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditsContext';
import PromotionModal from '../components/dashboard/listing/PromotionModal';

const initialState: ListingState = {
  uae_emirate: '', city: null, permitType: null, reraPermitNumber: '', dtcmPermitNumber: '',
  category: null, offeringType: null, rentalPeriod: null, propertyType: '',
  propertyLocation: null, assignedAgent: null, reference: '',
  available: 'immediately', availableDate: null, size: '', bedrooms: '',
  bathrooms: '', developer: '', unitNumber: '', parkingSlots: '',
  furnishingType: null, age: '', numberOfFloors: '', projectStatus: '', ownerName: '',
  price: '', downPayment: '', numberOfCheques: '', amenities: [],
  title: '', title_ar: '', description: '', description_ar: '',
  images: [], latitude: null, longitude: null, googleAddress: '', googleAddressComponents: null
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
        city: null,
        reraPermitNumber: '',
        dtcmPermitNumber: '',
        category: null,
        offeringType: null,
        rentalPeriod: null,
        propertyType: '',
        propertyLocation: null,
        assignedAgent: null,
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
    case 'SET_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AddListingPage = () => {
  const { isLoading: isAuthLoading, token } = useAuth();
  const navigate = useNavigate();
  const [formData, dispatch] = useReducer(listingReducer, initialState);
  const { balance, refreshData: refreshCredits } = useCredits();
  const [activeSection, setActiveSection] = useState('core');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [qualityScore, setQualityScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [agents, setAgents] = useState<SelectOption[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  const debouncedFormData = useDebounce(formData, 500);

  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    if (isAuthLoading || !token) return;

    const fetchListing = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listing = res.data;


        // Parse available_from to determine available and availableDate
        let available: 'immediately' | 'fromDate' = 'immediately';
        let availableDate: Date | null = null;

        if (listing.available_from) {
          const availableFromDate = new Date(listing.available_from);
          const now = new Date();
          const diffInDays = Math.floor((availableFromDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // If the date is more than 1 day in the future, treat it as "fromDate"
          if (diffInDays > 1) {
            available = 'fromDate';
            availableDate = availableFromDate;
          }
        }

        const payload = {
          uae_emirate: listing.uae_emirate || '',
          city: listing.city || null,
          category: listing.category || null,
          offeringType: listing.price?.type || null,
          rentalPeriod: listing.rental_period || null,
          propertyType: listing.type || '',
          bedrooms: String(listing.bedrooms || ''),
          bathrooms: String(listing.bathrooms || ''),
          size: String(listing.size || ''),
          price: String(listing.price?.amounts?.[listing.price?.type] || ''),
          title: (listing.title?.en && /^draft:\s*/i.test(listing.title.en)) ? '' : (listing.title?.en || ''),
          title_ar: listing.title?.ar || '',
          description: listing.description?.en || '',
          description_ar: listing.description?.ar || '',
          reference: listing.reference || '',
          developer: String(listing.developer_id || ''),
          unitNumber: listing.unit_number || '',
          parkingSlots: String(listing.parking_slots || ''),
          furnishingType: listing.furnishing_type || null,
          age: String(listing.age || ''),
          numberOfFloors: listing.number_of_floors ? String(listing.number_of_floors) : '',
          projectStatus: listing.project_status || '',
          ownerName: listing.owner_name || '',
          amenities: listing.amenities || [],
          images: listing.images?.map((img: any) => ({ url: img.original?.url || img.url })) || [],
          propertyLocation: listing.location?.id ? { value: listing.location.id, label: listing.location.title_en || '' } : null,
          assignedAgent: listing.assigned_to?.id ? { value: listing.assigned_to.id, label: listing.assigned_to.name || '' } : null,
          permitType: listing.permit_type || null,
          reraPermitNumber: listing.rera_permit_number || '',
          dtcmPermitNumber: listing.dtcm_permit_number || '',
          downPayment: String(listing.down_payment || ''),
          numberOfCheques: String(listing.number_of_cheques || ''),
          googleAddress: listing.location?.title_en || '',
          available,
          availableDate,
        };


        // Map backend listing to frontend state
        dispatch({
          type: 'SET_STATE',
          payload
        });
        // Remove setCompletedSteps to allow cascade validation from child components
        // setCompletedSteps(['core', 'specs', 'media', 'price', 'amenities', 'description']);
      } catch (error) {
        console.error("Failed to fetch listing for edit", error);
      }
    };

    const fetchLookups = async () => {
      setLoadingLookups(true);
      try {
        const agentsRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users?role=3`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAgents(agentsRes.data.map((u: { id: number; first_name: string; last_name: string }) => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })));
      } catch (error) {
        console.error("Failed to fetch lookups", error);
      }
      finally { setLoadingLookups(false); }
    };


    const fetchReference = async () => {
      try {

        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/reference`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data?.reference) {

          dispatch({ type: 'UPDATE_FIELD', field: 'reference', value: res.data.reference });
        } else {
          console.warn('No reference in response data');
        }
      } catch (error) {
        console.error("Failed to generate reference", error);
      }
    };

    if (!id && !formData.reference && !isAuthLoading && token) {
      fetchReference();
    }

    fetchListing();
    fetchLookups();
  }, [id, isAuthLoading, token]);


  useEffect(() => {
    const calculateScore = () => {
      let rawScore = 0;

      // User Specified Criteria (Total 78)

      // Title (10/10)
      if (formData.title && formData.title.trim().length >= 10) {
        rawScore += 10;
      }

      // Description (10/10)
      if (formData.description && formData.description.trim().length >= 50) {
        rawScore += 10;
      }

      // Location (19/19)
      if (formData.propertyLocation || formData.googleAddress) {
        rawScore += 19;
      }

      // Media Section (6 + 5 + 10 + 18 = 39)
      if (formData.images && formData.images.length > 0) {
        // Images: 6/6 (1 point per image up to 6)
        rawScore += Math.min(formData.images.length, 6);

        // Image Diversity: 5/5 (+5 if 10 or more images)
        if (formData.images.length >= 10) {
          rawScore += 5;
        } else if (formData.images.length >= 5) {
          rawScore += 3;
        }

        // Image Duplicates: 10/10
        rawScore += 10;

        // Images Dimensions: 18/18
        rawScore += 18;
      }

      // Scale to 100 (Total max rawScore is 78)
      const finalScore = Math.round((rawScore / 78) * 100);
      setQualityScore(Math.min(finalScore, 100));
    };

    calculateScore();
  }, [formData]);


  const handlePublish = () => {
    if (!completedSteps.includes('core')) {
      setError("Please complete the 'Core details' section first.");
      return;
    }
    setIsPromotionModalOpen(true);
  };

  const handleConfirmPublish = async (plan: string, duration: string, cost: number, autoRenew: boolean) => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    setIsPromotionModalOpen(false);
    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    // 1. Prepare Listing Data (Save as Draft first)
    // We intentionally do NOT set state to 'live' here. We let the publish endpoint handle that.
    const listingData = {
      reference: formData.reference,
      assigned_to: formData.assignedAgent ? { id: (formData.assignedAgent as SelectOption).value } : { id: 274026 },
      // Update: Keep as draft during save
      state: { stage: 'draft', type: 'pending_publishing' },
      available_from: formData.available === 'immediately'
        ? new Date().toISOString()
        : (formData.availableDate
          ? new Date(Date.UTC(formData.availableDate.getFullYear(), formData.availableDate.getMonth(), formData.availableDate.getDate())).toISOString()
          : undefined),
      price: {
        type: formData.offeringType,
        amounts: { [formData.offeringType!]: Number(formData.price) },
        downpayment: formData.offeringType === 'sale' && formData.downPayment ? Number(formData.downPayment) : undefined,
        number_of_cheques: formData.offeringType === 'rent' && formData.numberOfCheques ? Number(formData.numberOfCheques) : undefined
      },
      rental_period: formData.rentalPeriod,
      uae_emirate: formData.uae_emirate,
      city: formData.city,
      title: { en: formData.title },
      description: { en: formData.description },
      location: formData.propertyLocation
        ? {
          id: String((formData.propertyLocation as SelectOption).value),
          name: (formData.propertyLocation as SelectOption).label // Include name for upsert
        }
        : {
          name_en: formData.googleAddress,
          coordinates: (formData.latitude && formData.longitude) ? { lat: formData.latitude, lng: formData.longitude } : null
        },
      compliance: { user_confirmed_data_is_correct: true },
      category: formData.category,
      amenities: formData.amenities,
      type: formData.propertyType,
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
      project_status: formData.projectStatus,
      quality_score: { value: qualityScore },
      permit_type: formData.permitType,
      rera_permit_number: formData.reraPermitNumber,
      dtcm_permit_number: formData.dtcmPermitNumber
    };


    const apiPayload = new FormData();
    const existingImages = formData.images.filter((img): img is { url: string } => !('lastModified' in img) && 'url' in img);
    const newFiles = formData.images.filter((img): img is File => img instanceof File);

    const finalListingData = {
      ...listingData,
      media: {
        images: existingImages.map(img => ({ original: { url: img.url } }))
      }
    };

    apiPayload.append('data', JSON.stringify(finalListingData));
    newFiles.forEach(file => {
      apiPayload.append('images', file);
    });

    try {
      let targetId = id;

      // 2. Perform Save (Create or Update)
      if (isEditMode && id) {
        await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}`, apiPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        const createResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings`, apiPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        targetId = createResponse.data.id || createResponse.data.data?.id; // Handle response structure
      }

      if (!targetId) {
        throw new Error("Could not determine listing ID for publishing.");
      }

      console.log('Publishing listing with ID:', targetId);

      // 3. Call Publish Endpoint (Deduct Credits & Set Live)
      const publishResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/listings/listings/publish`,
        {
          listing_ids: [targetId],
          deduct_credits: true,
          promotion_plan: plan,
          duration: duration,
          auto_renew: autoRenew
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Publish response:', publishResponse.data);

      refreshCredits(); // Refresh balance context
      setShowSuccess(true);
      setTimeout(() => navigate('/listings-management'), 3000);

    } catch (err: unknown) {
      console.error("Publish error:", err);
      const errorMsg = err instanceof Error ? err.message : "Error: Could not publish listing.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    if (!token) return;
    // Removed strict reference check here as it should be auto-generated or we can generate one now
    // If no reference, we can't save? Actually we can try to generate one or let backend handle?
    // But since we fetch it on mount, it should be there.
    // If it's missing for some reason, we could error or try to continue.
    // For now, let's allow it but warn if missing?

    // Actually, fallback if reference is missing:
    let referenceToUse = formData.reference;
    if (!referenceToUse) {
      // Ideally fetch one, but for now relying on mount or user input.
      // If empty, backend might fail or we generate a temp one? 
      // We'll rely on the mount-generated reference.
    }

    setIsSavingDraft(true);

    const listingData = {
      reference: formData.reference,
      assigned_to: formData.assignedAgent ? { id: (formData.assignedAgent as SelectOption).value } : { id: 274026 },
      state: { stage: 'draft', type: 'pending_publishing' },
      uae_emirate: formData.uae_emirate || '',
      city: formData.city || null,
      title: { en: formData.title || `Draft: ${formData.reference}` },
      description: { en: formData.description || '' },
      category: formData.category || '',
      type: formData.propertyType || '',
      price: {
        type: formData.offeringType || 'rent',
        amounts: { [formData.offeringType || 'rent']: Number(formData.price) || 0 }
      },
      rental_period: formData.rentalPeriod,
      location: formData.propertyLocation ? { id: String((formData.propertyLocation as SelectOption).value) } : null,
      quality_score: { value: qualityScore },
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      size: formData.size ? Number(formData.size) : null,
      furnishing_type: formData.furnishingType,
      developer_id: formData.developer ? Number(formData.developer) : null,
      owner_name: formData.ownerName,
      project_status: formData.projectStatus,
      amenities: formData.amenities,
      permit_type: formData.permitType,
      rera_permit_number: formData.reraPermitNumber,
      dtcm_permit_number: formData.dtcmPermitNumber
    };

    const apiPayload = new FormData();

    const existingImages = formData.images.filter((img): img is { url: string } => !('lastModified' in img) && 'url' in img);
    const newFiles = formData.images.filter((img): img is File => img instanceof File);

    const finalListingData = {
      ...listingData,
      media: {
        images: existingImages.map(img => ({ original: { url: img.url } }))
      }
    };

    apiPayload.append('data', JSON.stringify(finalListingData));
    newFiles.forEach(file => {
      apiPayload.append('images', file);
    });

    try {
      if (isEditMode) {
        await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}`, apiPayload, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings`, apiPayload, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Failed to save draft on exit", err);
      throw err;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleExit = () => {
    if (formData.reference) {
      setIsExitModalOpen(true);
    } else {
      navigate('/listings-management');
    }
  };

  const confirmExitWithSave = async () => {
    try {
      await saveAsDraft();
      setIsExitModalOpen(false);
      navigate('/listings-management');
    } catch (err) {
      setError("Failed to save draft. Exit anyway?");
      // We keep the modal or give another choice
    }
  };

  const confirmExitWithoutSave = () => {
    setIsExitModalOpen(false);
    navigate('/listings-management');
  };

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const handleSetImages = (files: (File | { url: string })[]) => {
    dispatch({ type: 'SET_IMAGES', value: files });
  };

  const sections = [
    { id: 'core', title: 'Core details', component: <CoreDetailsForm state={formData} dispatch={dispatch} onComplete={() => handleStepComplete('core')} agents={agents} isLoadingAgents={loadingLookups} /> },
    { id: 'specs', title: 'Specifications', component: <SpecificationsForm state={formData} dispatch={dispatch} onComplete={() => handleStepComplete('specs')} /> },
    { id: 'media', title: 'Media', component: <MediaForm images={formData.images} onSetImages={handleSetImages} onComplete={() => handleStepComplete('media')} /> },
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
      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        onConfirm={handleConfirmPublish}
        availableCredits={balance.current}
      />
      <div className="bg-white bg-gray-50 min-h-screen flex flex-col">
        <AddListingHeader qualityScore={qualityScore} onPublish={handlePublish} onExit={handleExit} isSubmitting={isSubmitting} />
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

        <ConfirmModal
          isOpen={isExitModalOpen}
          title="Save as Draft?"
          message="You have unsaved changes. Would you like to save this listing as a draft before exiting?"
          confirmLabel={isSavingDraft ? "Saving..." : "Save Draft & Exit"}
          secondaryLabel="Discard & Exit"
          cancelLabel="Stay on Page"
          onConfirm={confirmExitWithSave}
          onSecondary={confirmExitWithoutSave}
          onCancel={() => setIsExitModalOpen(false)}
          type="info"
        />
      </div>
    </>
  );
};

export default AddListingPage;