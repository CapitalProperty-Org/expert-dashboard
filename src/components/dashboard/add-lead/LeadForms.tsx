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

// Country codes for phone numbers
const countryCodes = [
    { code: '+971', country: 'UAE' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+965', country: 'Kuwait' },
    { code: '+973', country: 'Bahrain' },
    { code: '+974', country: 'Qatar' },
    { code: '+968', country: 'Oman' },
    { code: '+20', country: 'Egypt' },
    { code: '+212', country: 'Morocco' },
    { code: '+216', country: 'Tunisia' },
    { code: '+213', country: 'Algeria' },
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+31', country: 'Netherlands' },
    { code: '+32', country: 'Belgium' },
    { code: '+41', country: 'Switzerland' },
    { code: '+43', country: 'Austria' },
    { code: '+46', country: 'Sweden' },
    { code: '+47', country: 'Norway' },
    { code: '+45', country: 'Denmark' },
    { code: '+358', country: 'Finland' },
    { code: '+48', country: 'Poland' },
    { code: '+420', country: 'Czech Republic' },
    { code: '+36', country: 'Hungary' },
    { code: '+40', country: 'Romania' },
    { code: '+421', country: 'Slovakia' },
    { code: '+386', country: 'Slovenia' },
    { code: '+385', country: 'Croatia' },
    { code: '+387', country: 'Bosnia' },
    { code: '+382', country: 'Montenegro' },
    { code: '+389', country: 'Macedonia' },
    { code: '+355', country: 'Albania' },
    { code: '+371', country: 'Latvia' },
    { code: '+372', country: 'Estonia' },
    { code: '+370', country: 'Lithuania' },
    { code: '+375', country: 'Belarus' },
    { code: '+380', country: 'Ukraine' },
    { code: '+7', country: 'Russia' },
    { code: '+90', country: 'Turkey' },
    { code: '+30', country: 'Greece' },
    { code: '+351', country: 'Portugal' },
    { code: '+353', country: 'Ireland' },
    { code: '+352', country: 'Luxembourg' },
    { code: '+356', country: 'Malta' },
    { code: '+357', country: 'Cyprus' },
    { code: '+359', country: 'Bulgaria' },
    { code: '+81', country: 'Japan' },
    { code: '+82', country: 'South Korea' },
    { code: '+86', country: 'China' },
    { code: '+91', country: 'India' },
    { code: '+92', country: 'Pakistan' },
    { code: '+880', country: 'Bangladesh' },
    { code: '+977', country: 'Nepal' },
    { code: '+94', country: 'Sri Lanka' },
    { code: '+95', country: 'Myanmar' },
    { code: '+66', country: 'Thailand' },
    { code: '+84', country: 'Vietnam' },
    { code: '+855', country: 'Cambodia' },
    { code: '+856', country: 'Laos' },
    { code: '+60', country: 'Malaysia' },
    { code: '+65', country: 'Singapore' },
    { code: '+62', country: 'Indonesia' },
    { code: '+63', country: 'Philippines' },
    { code: '+61', country: 'Australia' },
    { code: '+64', country: 'New Zealand' },
    { code: '+27', country: 'South Africa' },
    { code: '+234', country: 'Nigeria' },
    { code: '+254', country: 'Kenya' },
    { code: '+256', country: 'Uganda' },
    { code: '+255', country: 'Tanzania' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+221', country: 'Senegal' },
    { code: '+225', country: 'Ivory Coast' },
    { code: '+233', country: 'Ghana' },
    { code: '+237', country: 'Cameroon' },
    { code: '+241', country: 'Gabon' },
    { code: '+242', country: 'Congo' },
    { code: '+243', country: 'DR Congo' },
    { code: '+244', country: 'Angola' },
    { code: '+245', country: 'Guinea-Bissau' },
    { code: '+246', country: 'British Indian Ocean Territory' },
    { code: '+247', country: 'Ascension Island' },
    { code: '+248', country: 'Seychelles' },
    { code: '+249', country: 'Sudan' },
    { code: '+250', country: 'Rwanda' },
    { code: '+252', country: 'Somalia' },
    { code: '+253', country: 'Djibouti' },
    { code: '+257', country: 'Burundi' },
    { code: '+258', country: 'Mozambique' },
    { code: '+259', country: 'Zanzibar' },
    { code: '+260', country: 'Zambia' },
    { code: '+261', country: 'Madagascar' },
    { code: '+262', country: 'Reunion' },
    { code: '+263', country: 'Zimbabwe' },
    { code: '+264', country: 'Namibia' },
    { code: '+265', country: 'Malawi' },
    { code: '+266', country: 'Lesotho' },
    { code: '+267', country: 'Botswana' },
    { code: '+268', country: 'Swaziland' },
    { code: '+269', country: 'Comoros' },
    { code: '+290', country: 'Saint Helena' },
    { code: '+291', country: 'Eritrea' },
    { code: '+297', country: 'Aruba' },
    { code: '+298', country: 'Faroe Islands' },
    { code: '+299', country: 'Greenland' },
    { code: '+350', country: 'Gibraltar' },
    { code: '+354', country: 'Iceland' },
    { code: '+373', country: 'Moldova' },
    { code: '+374', country: 'Armenia' },
    { code: '+376', country: 'Andorra' },
    { code: '+377', country: 'Monaco' },
    { code: '+378', country: 'San Marino' },
    { code: '+379', country: 'Vatican City' },
    { code: '+381', country: 'Serbia' },
    { code: '+383', country: 'Kosovo' },
    { code: '+387', country: 'Bosnia and Herzegovina' },
    { code: '+389', country: 'North Macedonia' },
    { code: '+500', country: 'Falkland Islands' },
    { code: '+501', country: 'Belize' },
    { code: '+502', country: 'Guatemala' },
    { code: '+503', country: 'El Salvador' },
    { code: '+504', country: 'Honduras' },
    { code: '+505', country: 'Nicaragua' },
    { code: '+506', country: 'Costa Rica' },
    { code: '+507', country: 'Panama' },
    { code: '+508', country: 'Saint Pierre and Miquelon' },
    { code: '+509', country: 'Haiti' },
    { code: '+51', country: 'Peru' },
    { code: '+52', country: 'Mexico' },
    { code: '+53', country: 'Cuba' },
    { code: '+54', country: 'Argentina' },
    { code: '+55', country: 'Brazil' },
    { code: '+56', country: 'Chile' },
    { code: '+57', country: 'Colombia' },
    { code: '+58', country: 'Venezuela' },
    { code: '+590', country: 'Guadeloupe' },
    { code: '+591', country: 'Bolivia' },
    { code: '+592', country: 'Guyana' },
    { code: '+593', country: 'Ecuador' },
    { code: '+594', country: 'French Guiana' },
    { code: '+595', country: 'Paraguay' },
    { code: '+596', country: 'Martinique' },
    { code: '+597', country: 'Suriname' },
    { code: '+598', country: 'Uruguay' },
    { code: '+599', country: 'Netherlands Antilles' },
    { code: '+670', country: 'East Timor' },
    { code: '+672', country: 'Australian External Territories' },
    { code: '+673', country: 'Brunei' },
    { code: '+674', country: 'Nauru' },
    { code: '+675', country: 'Papua New Guinea' },
    { code: '+676', country: 'Tonga' },
    { code: '+677', country: 'Solomon Islands' },
    { code: '+678', country: 'Vanuatu' },
    { code: '+679', country: 'Fiji' },
    { code: '+680', country: 'Palau' },
    { code: '+681', country: 'Wallis and Futuna' },
    { code: '+682', country: 'Cook Islands' },
    { code: '+683', country: 'Niue' },
    { code: '+685', country: 'Samoa' },
    { code: '+686', country: 'Kiribati' },
    { code: '+687', country: 'New Caledonia' },
    { code: '+688', country: 'Tuvalu' },
    { code: '+689', country: 'French Polynesia' },
    { code: '+690', country: 'Tokelau' },
    { code: '+691', country: 'Micronesia' },
    { code: '+692', country: 'Marshall Islands' },
    { code: '+850', country: 'North Korea' },
    { code: '+852', country: 'Hong Kong' },
    { code: '+853', country: 'Macau' },
    { code: '+880', country: 'Bangladesh' },
    { code: '+886', country: 'Taiwan' },
    { code: '+93', country: 'Afghanistan' },
    { code: '+960', country: 'Maldives' },
    { code: '+961', country: 'Lebanon' },
    { code: '+962', country: 'Jordan' },
    { code: '+963', country: 'Syria' },
    { code: '+964', country: 'Iraq' },
    { code: '+967', country: 'Yemen' },
    { code: '+970', country: 'Palestine' },
    { code: '+972', country: 'Israel' },
    { code: '+975', country: 'Bhutan' },
    { code: '+976', country: 'Mongolia' },
    { code: '+98', country: 'Iran' },
    { code: '+992', country: 'Tajikistan' },
    { code: '+993', country: 'Turkmenistan' },
    { code: '+994', country: 'Azerbaijan' },
    { code: '+995', country: 'Georgia' },
    { code: '+996', country: 'Kyrgyzstan' },
    { code: '+998', country: 'Uzbekistan' }
];

// Validation functions
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.includes('@') && email.includes('.com');
};

const validateRange = (from: string, to: string): boolean => {
    if (!from || !to) return true; // Allow empty values
    const fromNum = parseFloat(from);
    const toNum = parseFloat(to);
    return !isNaN(fromNum) && !isNaN(toNum) && fromNum <= toNum;
};

// دالة التحقق من صحة رقم الهاتف
function validatePhoneNumber(phone: string) {
    // يجب أن يكون أرقام فقط وطوله من 8 إلى 15 رقم
    return /^[0-9]{8,15}$/.test(phone);
}

const FormRow = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4 py-4 border-b border-gray-100 last:border-b-0 last:pb-0">
        {children}
    </div>
);

const Requirements = ({ leadData, handleStateUpdate, handleButtonGroupToggle }: any) => {
    const isBuyer = leadData.leadType === 'buyer';
    const isResidential = leadData.propertyCategory === 'residential';
    const propertyTypes = isResidential ? LeadData.propertyTypeOptionsResidential : LeadData.propertyTypeOptionsCommercial;

    console.log(leadData)

    return (
        <div className="space-y-2">
            {isBuyer && <FormRow><FormLabel icon={<CheckSquare />} text="Purpose of buying" /><MultiSelectButtonGroup options={['Own living', 'Resell', 'For renting', 'Investment']} selected={leadData.purposeOfBuying} onToggle={(val) => handleButtonGroupToggle('purposeOfBuying', val)} /></FormRow>}
            <FormRow><FormLabel icon={isResidential ? <Home /> : <Building />} text="Property type" /><MultiSelectButtonGroup options={propertyTypes} selected={leadData.propertyType} onToggle={(opt) => handleButtonGroupToggle('propertyType', opt)} /></FormRow>
            <FormRow>
                <FormLabel icon={<Home />} text="Property size, sqft" />
                <div className="col-span-3 flex items-center gap-2">
                    <input 
                        placeholder="From" 
                        value={leadData.sizeFrom} 
                        onChange={e => handleStateUpdate('sizeFrom', e.target.value)} 
                        className={`w-full p-2.5 border rounded-lg ${leadData.sizeFrom && leadData.sizeTo && !validateRange(leadData.sizeFrom, leadData.sizeTo) ? 'border-red-500' : ''}`} 
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        placeholder="To" 
                        value={leadData.sizeTo} 
                        onChange={e => handleStateUpdate('sizeTo', e.target.value)} 
                        className={`w-full p-2.5 border rounded-lg ${leadData.sizeFrom && leadData.sizeTo && !validateRange(leadData.sizeFrom, leadData.sizeTo) ? 'border-red-500' : ''}`} 
                    />
                </div>
                {leadData.sizeFrom && leadData.sizeTo && !validateRange(leadData.sizeFrom, leadData.sizeTo) && (
                    <div className="col-span-4 text-red-500 text-sm mt-1">Size "From" must be less than or equal to "To"</div>
                )}
            </FormRow>
            <FormRow>
                <FormLabel icon={<DollarSign />} text="Property price (AED)" />
                <div className="col-span-3 flex items-center gap-2">
                    <input 
                        placeholder="From" 
                        value={leadData.priceFrom} 
                        onChange={e => handleStateUpdate('priceFrom', e.target.value)} 
                        className={`w-full p-2.5 border rounded-lg ${leadData.priceFrom && leadData.priceTo && !validateRange(leadData.priceFrom, leadData.priceTo) ? 'border-red-500' : ''}`} 
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        placeholder="To" 
                        value={leadData.priceTo} 
                        onChange={e => handleStateUpdate('priceTo', e.target.value)} 
                        className={`w-full p-2.5 border rounded-lg ${leadData.priceFrom && leadData.priceTo && !validateRange(leadData.priceFrom, leadData.priceTo) ? 'border-red-500' : ''}`} 
                    />
                </div>
                {leadData.priceFrom && leadData.priceTo && !validateRange(leadData.priceFrom, leadData.priceTo) && (
                    <div className="col-span-4 text-red-500 text-sm mt-1">Price "From" must be less than or equal to "To"</div>
                )}
            </FormRow>
            
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
    const [selectedCountryCode, setSelectedCountryCode] = useState(leadData.phoneCode || '+971');
    
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/users`).then(res => setAgents(res.data.map((u: any) => ({ label: `${u.first_name} ${u.last_name}`, value: u.id }))));
    }, []);

    const statusOptions = ["New", "Prospect", "Visit in progress", "Qualified", "Contract sent", "Contract signed", "Not ready", "Not interested", "Called no reply"].map(s => ({label: s, value: s.toLowerCase().replace(/ /g, '_')}));

    const handleChange = (key: string, value: any) => {
        setLeadData((prev: any) => ({ ...prev, [key]: value }));
    };

    // عند تغيير كود الدولة
    const handleCountryCodeChange = (code: string) => {
        setSelectedCountryCode(code);
        handleChange('phoneCode', code);
    };

    // عند تغيير الرقم فقط أرقام
    const handlePhoneChange = (value: string) => {
        const cleanPhone = value.replace(/[^\d]/g, '');
        handleChange('phoneNumber', cleanPhone);
    };  

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div><label className="text-sm font-medium">Full name</label><input type="text" value={leadData.fullName} onChange={e => handleChange('fullName', e.target.value)} className="w-full mt-2 p-2.5 border rounded-lg" /></div>
                <div></div>
                <div>
                    <label className="text-sm font-medium">Phone number</label>
                    <div className="flex mt-2">
                        <select 
                            value={selectedCountryCode} 
                            onChange={e => handleCountryCodeChange(e.target.value)}
                            className="inline-flex items-center px-2 border border-r-0 bg-gray-50 rounded-l-lg text-sm"
                        >
                            {countryCodes.map((country, index) => (
                                <option key={index} value={country.code}>
                                    {country.code}
                                </option>
                            ))}
                        </select>
                        <input 
                            type="text" 
                            value={leadData.phoneNumber} 
                            onChange={e => handlePhoneChange(e.target.value)} 
                            className={`w-full p-2.5 border rounded-r-lg ${leadData.phoneNumber && !validatePhoneNumber(leadData.phoneNumber) ? 'border-red-500' : ''}`} 
                            placeholder="Phone number"
                        />
                    </div>
                    {leadData.phoneNumber && !validatePhoneNumber(leadData.phoneNumber) && (
                        <div className="text-red-500 text-sm mt-1">Please enter a valid phone number (8-15 digits)</div>
                    )}
                </div>
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <input 
                        type="email" 
                        value={leadData.email} 
                        onChange={e => handleChange('email', e.target.value)} 
                        className={`w-full mt-2 p-2.5 border rounded-lg ${leadData.email && !validateEmail(leadData.email) ? 'border-red-500' : ''}`} 
                    />
                    {leadData.email && !validateEmail(leadData.email) && (
                        <div className="text-red-500 text-sm mt-1">Please enter a valid email with @ and .com</div>
                    )}
                </div>
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
                    <FormRow>
                        <FormLabel icon={<Home />} text="Property category" />
                        <MultiSelectButtonGroup
                            options={['residential', 'commercial']}
                            selected={leadData.propertyCategory}
                            onToggle={(val) => { console.log(val); handleStateUpdate('propertyCategory', val); }}
                        />
                    </FormRow>
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