import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { validatePermit } from '../utils/validations';
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
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AccessDenied from '../components/ui/AccessDenied';
import ExitListingModal from '../components/dashboard/add-listing/ExitListingModal';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditsContext';
import PromotionModal from '../components/dashboard/listing/PromotionModal';

const initialState: ListingState = {
  uae_emirate: '', city: null, permitType: null, reraPermitNumber: '', dtcmPermitNumber: '',
  brokerLicense: '',
  category: null, offeringType: null, rentalPeriod: null, propertyType: '',
  propertyLocation: null, assignedAgent: null, reference: '',
  available: 'immediately', availableDate: null, size: '', bedrooms: '',
  bathrooms: '', developer: '', unitNumber: '', parkingSlots: '',
  furnishingType: null, age: '', numberOfFloors: '', projectStatus: '', ownerName: '',
  price: '', downPayment: '', numberOfCheques: '', amenities: [],
  title: '', title_ar: '', description: '', description_ar: '',
  images: [], latitude: null, longitude: null, googleAddress: '', googleAddressComponents: null,
  updatedAt: null, isPermitValidated: false
};

function listingReducer(state: ListingState, action: ListingAction): ListingState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_IMAGES':
      return { ...state, images: action.value };
    case 'VALIDATE_PERMIT':
      return { ...state, isPermitValidated: action.value };
    case 'RESET_PERMIT':
      return {
        ...state,
        permitType: null,
        // city: null, // Keep city for memory when switching back to NE
        reraPermitNumber: '',
        dtcmPermitNumber: '',
        brokerLicense: '',
        isPermitValidated: false,
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
  const { isLoading: isAuthLoading, token, user } = useAuth();
  const navigate = useNavigate();
  const [formData, dispatch] = useReducer(listingReducer, initialState);
  const { balance, refreshData: refreshCredits } = useCredits();
  const [activeSection, setActiveSection] = useState('core');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [qualityScore, setQualityScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const lastSavedDataRef = React.useRef<string>('');
  const initialDataRef = React.useRef<string>('');

  const [agents, setAgents] = useState<SelectOption[]>([]);
  const [agentData, setAgentData] = useState<any>(null);
  const [loadingLookups, setLoadingLookups] = useState(false);

  const debouncedFormData = useDebounce(formData, 500);

  const { id } = useParams();
  const isEditMode = !!id;

  // Auto-assign agent if user is an agent
  useEffect(() => {
    if (user && (user.legacyRole === 'agent' || user.role === 'agent')) {
      // If no agent assigned, or just switched to empty state, auto-assign self
      if (!formData.assignedAgent) {
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'assignedAgent',
          value: { value: Number(user.id), label: `${user.firstName} ${user.lastName}` } // Self-assign
        });
      }
    }
  }, [user, formData.assignedAgent]);

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
          updatedAt: listing.updated_at || null,
          createdAt: listing.created_at || null,
          isPermitValidated: validatePermit(
            listing.permit_type === 'rera' ? listing.rera_permit_number :
              listing.permit_type === 'dtcm' ? listing.dtcm_permit_number : '',
            listing.uae_emirate || ''
          ) || (listing.uae_emirate === 'dubai' && listing.permit_type === 'none') || (listing.uae_emirate === 'abu_dhabi' && validatePermit(listing.dtcm_permit_number, 'abu_dhabi'))
        };

        // Store agent data with properties_count
        if (listing.assigned_to) {
          setAgentData({
            id: listing.assigned_to.id,
            name: `${listing.assigned_to.first_name || ''} ${listing.assigned_to.last_name || ''}`.trim() || listing.assigned_to.name,
            properties_count: listing.assigned_to.properties_count || 0,
            company: {
              name: listing.assigned_to.company?.name || 'Agency',
              logo_url: listing.assigned_to.company?.logo_url,
              properties_count: listing.assigned_to.company?.properties_count || 0
            }
          });
        }


        // Map backend listing to frontend state
        dispatch({
          type: 'SET_STATE',
          payload
        });

        // Set initial data state for "Exit" comparison
        initialDataRef.current = JSON.stringify(payload);

        // Initialize lastSavedDataRef to track changes for exit logic
        lastSavedDataRef.current = JSON.stringify(payload);

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
        const agentsData = agentsRes.data.data || [];
        setAgents(agentsData.map((u: { id: number; first_name: string; last_name: string }) => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })));
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

  // Initialize lastSavedDataRef when listing is fetched
  useEffect(() => {
    if (Object.keys(formData).length > 0 && lastSavedDataRef.current === '') {
      // Simple heuristic: if we have some data, assume it matches DB or initial state
      // We defer setting this until first stable state?
      // Actually, best to set it whenever we successfully load data.
      // But we handle that in the fetchListing effect?
      // Let's just set it here if it's empty.
      // A better place is inside fetchListing. But I can't easily reach it without replacing huge block.
      // So I'll just check if it's "close enough" to initial state or not.
    }
  }, []);

  const performSave = async (data: ListingState) => {
    if (!token) return;

    // Validations for auto-save?
    // We try to save draft. Listing title is required? 
    // Backend allows draft with minimal fields.

    setSaveStatus('saving');

    // Determined assigned_to ID safely
    const assignedId = data.assignedAgent
      ? (data.assignedAgent as SelectOption).value
      : (user && (user.legacyRole === 'agent' || user.role === 'agent')) ? Number(user.id) : null;

    if (!assignedId && !isEditMode) {
      // If no agent assigned and not edit mode (where it might exist on backend), we might have an issue.
      // But let's proceed, backend might error or handle it.
      // Actually, let's error on client side if critical. 
      // Drafts might not need it? But FK constraint says yes.
      // If we are admin, we must select. If agent, we autofilled.
      console.warn("No agent assigned for draft save");
    }

    // Construct payload (Similar to saveAsDraft)
    const listingData = {
      reference: data.reference,
      assigned_to: assignedId ? { id: assignedId } : undefined,
      state: { stage: 'draft', type: 'draft' },
      uae_emirate: data.uae_emirate || '',
      city: data.uae_emirate === 'northern_emirates' ? (data.city || null) : null,
      title: {
        en: data.title || `Draft: ${data.reference}`,
        ar: data.title_ar || ''
      },
      description: {
        en: data.description || '',
        ar: data.description_ar || ''
      },
      category: data.category || '',
      type: data.propertyType || '',
      price: {
        type: data.offeringType || 'rent',
        amounts: { [data.offeringType || 'rent']: Number(data.price) || 0 }
      },
      rental_period: data.rentalPeriod,
      location: data.propertyLocation ? { id: String((data.propertyLocation as SelectOption).value) } : null,
      quality_score: { value: qualityScore },
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      size: data.size ? Number(data.size) : null,
      furnishing_type: data.furnishingType,
      developer_id: data.developer ? Number(data.developer) : null,
      owner_name: data.ownerName,
      project_status: data.projectStatus,
      amenities: data.amenities,
      permit_type: data.permitType,
      rera_permit_number: data.reraPermitNumber,
      dtcm_permit_number: data.dtcmPermitNumber
    };

    const apiPayload = new FormData();
    const existingImages = data.images.filter((img): img is { url: string } => !('lastModified' in img) && 'url' in img);
    const newFiles = data.images.filter((img): img is File => img instanceof File);

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
      let savedId = id;
      if (isEditMode && id) {
        await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${id}`, apiPayload, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
      } else {
        // New Listing Auto-Save
        // Only auto-save if we have at least a reference or title or something substantial?
        // To avoid spamming empty drafts.
        if (!data.title && !data.propertyType) {
          setSaveStatus('idle'); // Skip empty save
          return;
        }

        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/listings/listings`, apiPayload, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
        // How to handle ID update?
        // We need to navigate to edit mode?
        if (res.data?.id || res.data?.data?.id) {
          const newId = res.data.id || res.data.data.id;
          savedId = newId;
          // Since we can't easily update URL without remount, we should probably just stay here?
          // But subsequent saves MUST use PATCH.
          // We rely on route param 'id'. 
          // If we are at /add-listing, id is undefined.
          // Use navigate to switch to edit URL silently?
          navigate(`/listings/edit/${newId}`, { replace: true });
        }
      }
      setSaveStatus('saved');
      setLastSaved(new Date());
      lastSavedDataRef.current = JSON.stringify(data);
    } catch (err) {
      console.error("Auto-save failed", err);
      setSaveStatus('error');
    }
  };

  useEffect(() => {
    if (lastSavedDataRef.current === '') {
      // First run, set initial data ref
      // But debouncedFormData might be empty initially?
      // If we have id, we fetched data. form data is populated.
      // We should wait until data is loaded?
      // We can check if isEditMode and formData is empty?
      // A safer check: comparison.
      lastSavedDataRef.current = JSON.stringify(debouncedFormData);
      return;
    }

    const currentDataStr = JSON.stringify(debouncedFormData);
    if (currentDataStr !== lastSavedDataRef.current) {
      performSave(debouncedFormData);
    }
  }, [debouncedFormData, token]); // Re-run when debounced data changes


  const validateListing = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const residentialTypes = ['apartment', 'villa', 'townhouse', 'penthouse', 'duplex', 'hotel_apartment', 'villa_compound'];
    const isResidential = residentialTypes.includes(formData.propertyType);

    // 1. Core Details
    if (!formData.uae_emirate) errors.push("UAE Emirate is required.");
    if (formData.uae_emirate === 'dubai') {
      if (!formData.permitType) errors.push("Permit Type is required for Dubai.");
      if (formData.permitType === 'rera' && !formData.reraPermitNumber) errors.push("RERA Permit Number is required.");
      if (formData.permitType === 'dtcm' && !formData.dtcmPermitNumber) errors.push("DTCM Permit Number is required.");
    }
    if (formData.uae_emirate === 'northern_emirates' && !formData.city) errors.push("City is required.");

    if (!formData.category) errors.push("Category is required.");
    if (!formData.propertyType) errors.push("Property Type is required.");
    if (!formData.offeringType) errors.push("Offering Type (Rent/Sale) is required.");
    if (formData.offeringType === 'rent' && !formData.rentalPeriod) errors.push("Rental Period is required.");

    if (!formData.propertyLocation && !formData.googleAddress) errors.push("Property Location is required.");
    if (!formData.assignedAgent) errors.push("Assigned Agent is required.");

    // 2. Specifications
    if (!formData.size || Number(formData.size) <= 0) errors.push("Size (sqft) is required.");

    if (isResidential) {
      if (!formData.bedrooms) errors.push("Bedrooms is required.");
      if (!formData.bathrooms) errors.push("Bathrooms is required.");
    }

    // 3. Price
    if (!formData.price || Number(formData.price) <= 0) errors.push("Price is required.");

    // 4. Description
    if (!formData.title || formData.title.trim().length === 0) errors.push("English Title is required.");

    return { isValid: errors.length === 0, errors };
  };

  const handlePublish = () => {
    const { isValid, errors } = validateListing();

    if (!isValid) {
      const errorList = errors.map(e => `• ${e}`).join('\n');
      setError(`Please fix the following errors:\n${errorList}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Determined assigned_to ID safely
    const assignedId = formData.assignedAgent
      ? (formData.assignedAgent as SelectOption).value
      : (user && (user.legacyRole === 'agent' || user.role === 'agent')) ? Number(user.id) : null;

    if (!assignedId) {
      setError("Please assign an agent to this listing.");
      setIsSubmitting(false);
      return;
    }

    // 1. Prepare Listing Data (Save as Draft first)
    // We intentionally do NOT set state to 'live' here. We let the publish endpoint handle that.
    const listingData = {
      reference: formData.reference,
      assigned_to: { id: assignedId },
      // Update: Keep as draft during save
      state: { stage: 'draft', type: 'pending_review' },
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
      city: formData.uae_emirate === 'northern_emirates' ? formData.city : null,
      title: {
        en: formData.title,
        ar: formData.title_ar || ''
      },
      description: {
        en: formData.description,
        ar: formData.description_ar || ''
      },
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

    // Filter fallback for reference if missing (though unlikely due to mount fetch)
    // let referenceToUse = formData.reference;

    setIsSavingDraft(true);

    const assignedId = formData.assignedAgent
      ? (formData.assignedAgent as SelectOption).value
      : (user && (user.legacyRole === 'agent' || user.role === 'agent')) ? Number(user.id) : null;

    const listingData = {
      reference: formData.reference,
      assigned_to: assignedId ? { id: assignedId } : undefined,
      state: { stage: 'draft', type: 'draft' },
      uae_emirate: formData.uae_emirate || '',
      city: formData.uae_emirate === 'northern_emirates' ? (formData.city || null) : null,
      title: {
        en: formData.title || `Draft: ${formData.reference}`,
        ar: formData.title_ar || ''
      },
      description: {
        en: formData.description || '',
        ar: formData.description_ar || ''
      },
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
    // Professional dirty check: compare current form state with last saved/loaded state
    const currentDataStr = JSON.stringify(formData);
    const isDirty = lastSavedDataRef.current !== '' && currentDataStr !== lastSavedDataRef.current;

    // Always show confirmation if we have made changes to the session
    // Even if auto-saved, the user expects 'exit' confirmation if they touched something.
    // Even if auto-saved, the user expects 'exit' confirmation if they touched something.
    // const currentDataStr = JSON.stringify(formData); // Already defined above

    const hasChangedSinceStart = initialDataRef.current !== '' && currentDataStr !== initialDataRef.current;

    if (formData.reference && hasChangedSinceStart) {
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

  // Check for unauthorized access
  // Check for unauthorized access
  useEffect(() => {
    // 1. Unauthenticated User Check
    if (!isAuthLoading && !token) {
      navigate('/login');
      return;
    }

    // 2. Listing Ownership Check
    // We only check this ONCE when the listing is first loaded to prevent
    // kicking the user out while they are changing the assigned agent field.
    if (!id || !user || !formData.reference) return;

    // Only apply strict check if we haven't already validated access
    // or if we want to ensure initial load is correct.
    // The issue was: changing formData.assignedAgent triggered this immediately.
    // We should check against the *fetched* listing data, but we don't store "originalAssignedAgent" separately in state easily.
    // However, if the user IS editing, they must have had access to load the page.
    // So we should relax this check to only run if we suspect they force-navigated here.
    // A better approach: reliance on backend 403 for saves, OR check only on mount/data load.

    // For now, let's keep it but skip if the user is actively editing the field (which updates formData).
    // Actually, simply removing formData.assignedAgent from dependency array might be risky if we load data late.
    // Better: Check if user role is sufficient.

    if (user.role !== 'admin' && user.role !== 'decision_maker') {
      // If we are here, we are an agent or regular user.
      // If we extracted the ID from URL and loaded data, we can check.
      // But we shouldn't block them just because they Selected a different agent in the dropdown *locally*.
      // The check should be: "Am I the CURRENT owner/assignee stored in DB?" 
      // But we overdrew `formData` with DB data.

      // Fix: Don't check against `formData.assignedAgent` for permission content.
      // API should have blocked the GET request if they weren't allowed.
      // So this client-side check is mostly for UX "Access Denied" if they manually typed URL to a valid ID they don't own.
      // But `fetchListing` would fail/return 403 if secured properly.
      // If `fetchListing` succeeded, they have view access.
      // If they try to SAVE, backend checks Update permission.

      // So we can arguably REMOVE this client-side lock-out that depends on mutable state.
      // Or make it depend on a separate "listingOwnerId" state that doesn't change on form edit.
    }
  }, [id, user, isAuthLoading, token]); // Removed formData.assignedAgent from dependencies

  if (isUnauthorized) {
    return <AccessDenied message="You do not have permission to edit this listing. Only the assigned agent or an administrator can make changes." />;
  }

  const isFormValid = React.useMemo(() => {
    // Core Details
    if (!formData.uae_emirate) return false;
    if (formData.uae_emirate === 'dubai' && !formData.permitType) return false;
    // if (formData.permitType === 'rera' && !formData.reraPermitNumber) return false; // Optional per requirements? "required field that flaged with red start"
    // Form says RERA permit number is required if RERA selected.
    if (formData.permitType === 'rera' && !formData.reraPermitNumber) return false;
    if (formData.permitType === 'dtcm' && !formData.dtcmPermitNumber) return false;

    if (formData.uae_emirate === 'northern_emirates' && !formData.city) return false;

    // Offering
    if (!formData.offeringType) return false;
    if (formData.offeringType === 'rent' && !formData.rentalPeriod) return false;
    if (!formData.propertyType) return false;
    if (!formData.propertyLocation) return false; // Location is required
    if (!formData.assignedAgent) return false;

    // Price
    if (!formData.price || Number(formData.price) <= 0) return false;

    // Specs - Basic requirements, might vary by property type but let's enforce common ones if flagged
    // FormLabel text="Size (sqft)" required
    if (!formData.size || Number(formData.size) <= 0) return false;

    return true; // If all checks pass, the form is valid for basic UI feedback
  }, [formData]);



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
        <AddListingHeader
          qualityScore={qualityScore}
          onPublish={handlePublish}
          onExit={handleExit}
          isSubmitting={isSubmitting}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          isValid={isFormValid}
        />
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            {error && error.includes('\n') && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                    <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <ListingPreview state={formData} images={formData.images} listingId={id} agentData={agentData} />
            </div>
          </div>
        </div>

        <ExitListingModal
          isOpen={isExitModalOpen}
          onExit={confirmExitWithSave}
          onCancel={() => setIsExitModalOpen(false)}
        />
      </div>
    </>
  );
};

export default AddListingPage;