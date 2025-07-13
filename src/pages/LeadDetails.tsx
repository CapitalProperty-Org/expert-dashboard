import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { LeadDetailsForm, LeadTypeAndRequirementsForm, NoteForm } from "../components/dashboard/add-lead/LeadForms";
import FormSection from "../components/ui/FormSection";
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useConfirmationModal } from '../hooks/useConfirmationModal';
import SuccessToast from '../components/ui/SuccessToast';
import ErrorToast from '../components/ui/ErrorToast';

const LeadDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal, ConfirmationModalComponent } = useConfirmationModal();

    const [leadData, setLeadData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // جلب بيانات الـ Lead عند تحميل الصفحة
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/agent-opportunities/${id}`)
            .then(response => {
                const data = response.data;
                console.log(data)
                // تحويل البيانات لتكون متوافقة مع حالة الفورم
                setLeadData({
                    fullName: data.fullName,
                    phoneNumber: data.mobile.replace('+971', ''), // مثال بسيط
                    email: data.email,
                    status: { value: data.status, label: data.status },
                    assignedTo: data.userId ? { value: data.userId, label: `Agent ${data.userId}` } : '',
                    leadType: data.type,
                    propertyCategory: data.category,
                    purposeOfBuying: data.purpose,
                    propertyType: data.propertyType,
                    sizeFrom: data.sizeFrom || '',
                    sizeTo: data.sizeTo || '',
                    priceFrom: data.priceFrom || '',
                    priceTo: data.priceTo || '',
                    bedrooms: data.beds,
                    bathrooms: data.baths,
                    furnishingType: data.furnishingType,
                    readinessToBuy: data.readinessToBuy,
                    purchasePeriod: data.purchasePeriod,
                    moveInPeriod: data.moveInPeriod, // افترض أنه لا يوجد
                    preferredLocations: data.locations ? data.locations.map((loc: any) => ({ value: loc.id, label: loc.name_en })) : [],
                    note: data.note || ''
                });
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load lead details.");
            })
            .finally(() => setLoading(false));
    }, [id]);
    
    const handleStateUpdate = (key: string, value: any) => {
        setLeadData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleButtonGroupToggle = (key: string, value: string) => {
        setLeadData((prev: any) => ({ ...prev, [key]: prev[key] === value ? '' : value }));
    };

    // دوال الفاليديشن (من LeadForms)
    function validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.includes('@') && email.includes('.com');
    }
    function validateRange(from: string, to: string): boolean {
        if (!from || !to) return true;
        const fromNum = parseFloat(from);
        const toNum = parseFloat(to);
        return !isNaN(fromNum) && !isNaN(toNum) && fromNum <= toNum;
    }
    // دالة التحقق من صحة الفورم
    function isFormValid(leadData: any) {
        if (
            !leadData.fullName?.trim() ||
            !leadData.phoneNumber?.trim() ||
            !leadData.email?.trim() ||
            !validateEmail(leadData.email) ||
            (leadData.sizeFrom && leadData.sizeTo && !validateRange(leadData.sizeFrom, leadData.sizeTo)) ||
            (leadData.priceFrom && leadData.priceTo && !validateRange(leadData.priceFrom, leadData.priceTo))
        ) {
            return false;
        }
        return true;
    }

    const handleSaveChanges = async () => {
        setIsSubmitting(true);
        setError(null);
        
        const payload = {
        fullName: leadData.fullName,
        mobile: `+971${leadData.phoneNumber}`,
        email: leadData.email,
        status: typeof leadData.status === 'object' && leadData.status && 'value' in leadData.status ? (leadData.status as { value: string }).value : (leadData.status ?? ''),
        userId: typeof leadData.assignedTo === 'object' && leadData.assignedTo && 'value' in leadData.assignedTo ? Number((leadData.assignedTo as { value: string | number }).value) : (leadData.assignedTo ? Number(leadData.assignedTo) : undefined),
        
        // Requirements
        propertyType: leadData.propertyType,
        priceFrom: Number(leadData.priceFrom) || null, // استخدم null إذا كان فارغًا
        priceTo: Number(leadData.priceTo) || null,
        sizeFrom: Number(leadData.sizeFrom) || null,
        sizeTo: Number(leadData.sizeTo) || null,
        preferredLocation: leadData.preferredLocations && leadData.preferredLocations.value ? [leadData.preferredLocations.value] : [],
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
            await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/agent-opportunities/${id}`, payload);
            setSuccess("Changes saved successfully!");
            setTimeout(() => {
                navigate('/leads-regular-management');
            }, 3200);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/agent-opportunities/${id}`);
            alert('Lead deleted successfully!');
            navigate('/leads-regular-management');
        } catch (err) {
            setError('Failed to delete lead.');
        }
    };

    const confirmDelete = () => {
        openModal({
            title: 'Delete Lead',
            description: 'Are you sure you want to permanently delete this lead? This action cannot be undone.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: handleDelete
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    if (error && !leadData) return <div className="text-center text-red-500 py-16">{error}</div>;

    return (
        <>
            <SuccessToast message={success || ''} show={!!success} onClose={() => setSuccess(null)} />
            <ErrorToast message={error || ''} show={!!error && !!leadData} onClose={() => setError(null)} />
            {ConfirmationModalComponent}

            <div className="p-4 sm:p-6 md:p-8 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Lead Details</h1>
                
                {leadData && (
                    <>
                        <FormSection title="Lead Details">
                            <LeadDetailsForm leadData={leadData} setLeadData={setLeadData} />
                        </FormSection>
                        
                        <LeadTypeAndRequirementsForm leadData={leadData} handleStateUpdate={handleStateUpdate} handleButtonGroupToggle={handleButtonGroupToggle} />

                        <NoteForm leadData={leadData} setLeadData={setLeadData} />

                        <div className="flex items-center justify-between gap-4 pt-4 border-t mt-6">
                            <div>
                                <button onClick={() => navigate('/leads-regular-management')} className="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-100">Cancel</button>
                                <button onClick={handleSaveChanges} disabled={isSubmitting || !isFormValid(leadData)} className="ml-4 bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg disabled:bg-red-400 hover:bg-red-700">
                                    {isSubmitting ? 'Saving...' : 'Save changes'}
                                </button>
                            </div>
                            <button onClick={confirmDelete} className="bg-transparent border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-600">
                                Delete Lead
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default LeadDetails;