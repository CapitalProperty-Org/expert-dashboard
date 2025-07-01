import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LeadDetailsForm, LeadTypeAndRequirementsForm, NoteForm } from "../components/dashboard/add-lead/LeadForms";
import FormSection from "../components/ui/FormSection";
import SuccessToast from '../components/ui/SuccessToast';
import ErrorToast from '../components/ui/ErrorToast';

// هذا هو الهيكل الصحيح والنهائي للحالة الأولية
export const initialLeadState = {
    // LeadDetailsForm
    fullName: '', phoneCode: '+971', phoneNumber: '', email: '',
    status: 'new', assignedTo: '',
    
    // LeadTypeAndRequirementsForm
    leadType: 'buyer', propertyCategory: 'residential',
    
    // Requirements (كلها اختيار فردي الآن)
    purposeOfBuying: '', propertyType: '', sizeFrom: '', sizeTo: '',
    priceFrom: '', priceTo: '', bedrooms: '', bathrooms: '',
    furnishingType: '', readinessToBuy: '', purchasePeriod: '', 
    moveInPeriod: '',
    preferredLocations: [], // مصفوفة لتخزين المواقع المختارة { value, label }

    // NoteForm
    note: ''
};

// قائمة بالحقول التي تنتمي إلى قسم "المتطلبات"
const requirementFields = [
    'purposeOfBuying', 'propertyType', 'sizeFrom', 'sizeTo', 'priceFrom', 'priceTo',
    'bedrooms', 'bathrooms', 'furnishingType', 'readinessToBuy', 'purchasePeriod', 
    'moveInPeriod', 'preferredLocations'
];

const NewLead = () => {
    const navigate = useNavigate();
    const [leadData, setLeadData] = useState(initialLeadState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ## الدالة الموحدة والمبسطة لتحديث الحالة ##
    const handleStateUpdate = (key: string, value: any) => {
        setLeadData(prev => {
            const newState = { ...prev };

            // إعادة تعيين المتطلبات عند تغيير النوع الأساسي
            if (key === 'leadType' || key === 'propertyCategory') {
                requirementFields.forEach(field => {
                    (newState as any)[field] = initialLeadState[field as keyof typeof initialLeadState];
                });
            }

            // منطق التحديث
            (newState as any)[key] = value;
            
            return newState;
        });
    };
    
    // دالة خاصة بالأزرار لضمان الاختيار الفردي
    const handleButtonGroupToggle = (key: string, value: string) => {
        setLeadData(prev => ({
            ...prev,
            [key]: prev[key as keyof typeof prev] === value ? '' : value
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        
        const payload = {
            fullName: leadData.fullName,
            mobile: `${leadData.phoneCode}${leadData.phoneNumber}`,
            email: leadData.email,
            status: leadData.status,
            userId: Number(leadData.assignedTo) || undefined,
            propertyType: leadData.propertyType,
            priceFrom: Number(leadData.priceFrom) || undefined,
            priceTo: Number(leadData.priceTo) || undefined,
            sizeFrom: Number(leadData.sizeFrom) || undefined,
            sizeTo: Number(leadData.sizeTo) || undefined,
            preferredLocation: leadData.preferredLocations.map((loc: any) => loc.value), // إرسال الـ IDs فقط
            note: leadData.note,
            type: leadData.leadType,
            category: leadData.propertyCategory,
            baths: leadData.bathrooms,
            beds: leadData.bedrooms,
            furnishingType: leadData.furnishingType,
            purpose: leadData.purposeOfBuying,
            moveInPeriod: leadData.moveInPeriod,
            purchasePeriod: leadData.purchasePeriod,
            readinessToBuy: leadData.readinessToBuy,
        };

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/agent-opportunities`, payload);
                setShowSuccess(true);
            
            setTimeout(() => {
                navigate('/leads-regular-management');
            }, 3200);
        } catch (err: any) {
                        setError(err.response?.data?.message || 'Failed to create lead. Please check the details and try again.');

        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <>
          <SuccessToast 
                message="Lead created successfully!" 
                show={showSuccess} 
                onClose={() => setShowSuccess(false)} 
            />
    
            <ErrorToast 
                message={error || ''} 
                show={!!error} 
                onClose={() => setError(null)} 
            />
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">New lead</h1>
            
            <FormSection title="Lead Details">
                <LeadDetailsForm leadData={leadData} setLeadData={setLeadData} />
            </FormSection>
            
            <LeadTypeAndRequirementsForm leadData={leadData} handleStateUpdate={handleStateUpdate} handleButtonGroupToggle={handleButtonGroupToggle} />

            <NoteForm leadData={leadData} setLeadData={setLeadData} />

            <div className="flex items-center justify-end gap-4 pt-4 border-t mt-6">
                <button onClick={() => navigate(-1)} className="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-100">Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitting || !leadData.fullName} className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700">
                    Create Lead
                </button>
            </div>
            {error && <p className="text-right text-red-500 mt-2">{error}</p>}
        </div>
        </>
    );
};

export default NewLead;