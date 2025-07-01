import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Building, DollarSign, Bed, Bath, Armchair, MapPin, Calendar, Clock, CheckSquare } from 'lucide-react';
import * as LeadData from '../../../data/newLeadData';
import FormLabel from '../../ui/FormLabel';
import MultiSelectButtonGroup from '../../ui/MultiSelectButtonGroup';
import CustomSelect from '../../ui/CustomSelect';
import SegmentedControl from '../../ui/SegmentedControl';
import FormSection from '../../ui/FormSection';
import LocationAutocomplete from '../../ui/LocationAutocomplete';

const FormRow = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4 py-4 border-b border-gray-100 last:border-b-0 last:pb-0">
        {children}
    </div>
);

const Requirements = ({ leadData, handleStateUpdate, handleButtonGroupToggle }: any) => {
    const isBuyer = leadData.leadType === 'buyer';
    const isResidential = leadData.propertyCategory === 'residential';
    const propertyTypes = isResidential ? LeadData.propertyTypeOptionsResidential : LeadData.propertyTypeOptionsCommercial;

    return (
        <div className="space-y-2">
            {isBuyer && <FormRow><FormLabel icon={<CheckSquare />} text="Purpose of buying" /><MultiSelectButtonGroup options={LeadData.purposeOfBuyingOptions} selected={leadData.purposeOfBuying} onToggle={(opt) => handleButtonGroupToggle('purposeOfBuying', opt)} /></FormRow>}
            <FormRow><FormLabel icon={isResidential ? <Home /> : <Building />} text="Property type" /><MultiSelectButtonGroup options={propertyTypes} selected={leadData.propertyType} onToggle={(opt) => handleButtonGroupToggle('propertyType', opt)} /></FormRow>
            <FormRow><FormLabel icon={<Home />} text="Property size, sqft" /><div className="col-span-3 flex items-center gap-2"><input placeholder="From" value={leadData.sizeFrom} onChange={e => handleStateUpdate('sizeFrom', e.target.value)} className="w-full p-2.5 border rounded-lg" /><span className="text-gray-400">-</span><input placeholder="To" value={leadData.sizeTo} onChange={e => handleStateUpdate('sizeTo', e.target.value)} className="w-full p-2.5 border rounded-lg" /></div></FormRow>
            <FormRow><FormLabel icon={<DollarSign />} text="Property price (AED)" /><div className="col-span-3 flex items-center gap-2"><input placeholder="From" value={leadData.priceFrom} onChange={e => handleStateUpdate('priceFrom', e.target.value)} className="w-full p-2.5 border rounded-lg" /><span className="text-gray-400">-</span><input placeholder="To" value={leadData.priceTo} onChange={e => handleStateUpdate('priceTo', e.target.value)} className="w-full p-2.5 border rounded-lg" /></div></FormRow>
            
            {isResidential && <FormRow><FormLabel icon={<Bed />} text="Number of bedrooms" /><MultiSelectButtonGroup options={LeadData.bedroomsOptions} selected={leadData.bedrooms} onToggle={(opt) => handleButtonGroupToggle('bedrooms', opt)} /></FormRow>}
            {isResidential && <FormRow><FormLabel icon={<Bath />} text="Number of bathrooms" /><MultiSelectButtonGroup options={LeadData.bathroomsOptions} selected={leadData.bathrooms} onToggle={(opt) => handleButtonGroupToggle('bathrooms', opt)} /></FormRow>}
            {isResidential && <FormRow><FormLabel icon={<Armchair />} text="Furnishing type" /><MultiSelectButtonGroup options={LeadData.furnishingOptions} selected={leadData.furnishingType} onToggle={(opt) => handleButtonGroupToggle('furnishingType', opt)} /></FormRow>}
            
            <FormRow><FormLabel icon={<MapPin />} text="Preferred locations" /><div className="col-span-3"><LocationAutocomplete value={leadData.preferredLocations} onChange={(value) => handleStateUpdate('preferredLocations', value)} /></div></FormRow>            
            
            {isBuyer ? (
                <>
                    <FormRow><FormLabel icon={<Calendar />} text="Readiness to buy" /><MultiSelectButtonGroup options={LeadData.readinessOptions} selected={leadData.readinessToBuy} onToggle={(opt) => handleButtonGroupToggle('readinessToBuy', opt)} /></FormRow>
                    <FormRow><FormLabel icon={<Clock />} text="Purchase period" /><MultiSelectButtonGroup options={LeadData.purchasePeriodOptions} selected={leadData.purchasePeriod} onToggle={(opt) => handleButtonGroupToggle('purchasePeriod', opt)} /></FormRow>
                </>
            ) : (
                <FormRow><FormLabel icon={<Calendar />} text="Move in period" /><MultiSelectButtonGroup options={LeadData.moveInPeriodOptions} selected={leadData.moveInPeriod} onToggle={(opt) => handleButtonGroupToggle('moveInPeriod', opt)} /></FormRow>
            )}
        </div>
    );
};
export const LeadDetailsForm = ({ leadData, setLeadData }: any) => {
    const [agents, setAgents] = useState([]);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/users`).then(res => setAgents(res.data.map((u: any) => ({ label: `${u.first_name} ${u.last_name}`, value: u.id }))));
    }, []);

    const statusOptions = ["New", "Prospect", "Visit in progress", "Qualified", "Contract sent", "Contract signed", "Not ready", "Not interested", "Called no reply"].map(s => ({label: s, value: s.toLowerCase().replace(/ /g, '_')}));

    const handleChange = (key: string, value: any) => {
        setLeadData((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div><label className="text-sm font-medium">Full name</label><input type="text" value={leadData.fullName} onChange={e => handleChange('fullName', e.target.value)} className="w-full mt-2 p-2.5 border rounded-lg" /></div>
                <div></div>
                <div><label className="text-sm font-medium">Phone number</label><div className="flex mt-2"><span className="inline-flex items-center px-3 border border-r-0 bg-gray-50">+971</span><input type="text" value={leadData.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} className="w-full p-2.5 border rounded-r-lg" /></div></div>
                <div><label className="text-sm font-medium">Email</label><input type="email" value={leadData.email} onChange={e => handleChange('email', e.target.value)} className="w-full mt-2 p-2.5 border rounded-lg" /></div>
                <div><label className="text-sm font-medium">Status</label><CustomSelect options={statusOptions} value={leadData.status} onChange={v => handleChange('status', v)} /></div>
                <div><label className="text-sm font-medium">Assigned to</label><CustomSelect options={agents} placeholder="Assigned to" value={leadData.assignedTo} onChange={v => handleChange('assignedTo', v)} /></div>
            </div>
        </div>
    );
};

export const LeadTypeAndRequirementsForm = ({ leadData, handleStateUpdate, handleButtonGroupToggle }: any) => {
    return (
        <div className="space-y-8">
            <FormSection title="Lead Type"><SegmentedControl options={[{label: 'Buyer', value: 'buyer'}, {label: 'Tenant', value: 'tenant'}]} value={leadData.leadType} onChange={(v) => handleStateUpdate('leadType', v)} /></FormSection>
            <FormSection title="Requirements">
                <div className="space-y-2">
                    <FormRow><FormLabel icon={<Home />} text="Property category" /><SegmentedControl options={[{label: 'Residential', value: 'residential'}, {label: 'Commercial', value: 'commercial'}]} value={leadData.propertyCategory} onChange={(v) => handleStateUpdate('propertyCategory', v)} className="w-auto col-span-3" /></FormRow>
                    <div className="pt-4 border-t border-gray-100">
                        <Requirements leadData={leadData} handleStateUpdate={handleStateUpdate} handleButtonGroupToggle={handleButtonGroupToggle} />
                    </div>
                </div>
            </FormSection>
        </div>
    );
};

export const NoteForm = ({ leadData, setLeadData }: any) => (
    <FormSection title="Note"><div className="w-full"><label className="text-sm font-medium">Add note</label><textarea placeholder="Your note" value={leadData.note} onChange={e => setLeadData({...leadData, note: e.target.value})} rows={4} className="w-full mt-2 p-2.5 border rounded-lg" /></div></FormSection>
);