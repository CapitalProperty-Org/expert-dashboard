import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Camera, ShieldCheck, User, Globe, Phone, Info, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import "react-day-picker/style.css";
import CustomSelect from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { cn } from '../lib/utils';
import { nationalities, languages as fullLanguages, countryCodes } from '../data/constants';

const FormField = ({ label, children, required = false, hint }: { label: string, children: React.ReactNode, required?: boolean, hint?: string }) => (
    <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <Icon size={18} />
        </div>
        <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">{title}</h3>
    </div>
);

const CompliancePieChart = ({ percentage }: { percentage: number }) => {
    const strokeDasharray = `${percentage} ${100 - percentage}`;
    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f3f4f6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#7c3aed" strokeWidth="3" strokeDasharray={strokeDasharray} strokeDashoffset="25" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-violet-600 leading-none">{percentage}%</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Profile</span>
            </div>
        </div>
    );
};

const UserDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { roles, isLoading: isAuthLoading, refreshUser } = useAuth();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        // Private Profile
        firstName: '',
        lastName: '',
        phoneCode: '971',
        phoneNumber: '',
        loginEmail: '',
        password: '',
        selectedRole: null as { value: string, label: string } | null,
        status: 'active',

        // Public Profile
        usePrivateInfo: false,
        profilePhotoUrl: '',

        // Secondary Contact
        phoneSecondaryCode: '971',
        phoneSecondaryNumber: '',
        whatsappCode: '971',
        whatsappNumber: '',

        // Compliance
        licenseBBN: '',
        licenseBLN: '',
        licenseOther: '',
        licenseOtherExpiry: '',

        // Professional Details
        experienceSince: '',
        languages: [] as string[],
        nationality: '',
        position: '',
        linkedin: '',
        bioEn: '',
        bioAr: '',
    });

    const [loadingPage, setLoadingPage] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorPrivate, setErrorPrivate] = useState<string | null>(null);
    const [successPrivate, setSuccessPrivate] = useState<string | null>(null);
    const [errorPublic, setErrorPublic] = useState<string | null>(null);
    const [successPublic, setSuccessPublic] = useState<string | null>(null);
    const [isPublicSectionOpen, setIsPublicSectionOpen] = useState(true);

    // Calculate completion progress
    const progress = useMemo(() => {
        const fields = [
            formData.profilePhotoUrl,
            formData.phoneSecondaryNumber,
            formData.whatsappNumber,
            formData.licenseBBN || formData.licenseBLN || formData.licenseOther,
            formData.licenseOtherExpiry,
            formData.experienceSince,
            formData.languages.length > 0,
            formData.nationality,
            formData.position,
            formData.linkedin,
            formData.bioEn,
            formData.bioAr
        ];
        const completed = fields.filter(f => f && (typeof f === 'string' ? f.trim() !== '' : true)).length;
        return Math.round((completed / fields.length) * 100);
    }, [formData]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePhotoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (isAuthLoading) return;

        const fetchUserData = async () => {
            setLoadingPage(true);
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`);

                // Helper to parse phone
                const parsePhone = (mobile: string) => {
                    if (!mobile) return { code: '971', num: '' };

                    // If doesn't start with +, assume it's just the number without code
                    if (!mobile.startsWith('+')) return { code: '971', num: mobile };

                    const cleanMobile = mobile.substring(1); // remove +

                    // Match against available country codes, longest first
                    const sortedCodes = [...countryCodes].sort((a, b) => b.value.length - a.value.length);
                    for (const country of sortedCodes) {
                        if (cleanMobile.startsWith(country.value)) {
                            return {
                                code: country.value,
                                num: cleanMobile.substring(country.value.length)
                            };
                        }
                    }

                    // Fallback to 3 digits if no match
                    return { code: cleanMobile.substring(0, 3), num: cleanMobile.substring(3) };
                };

                const mainPhone = parsePhone(data.mobile);
                const secondPhone = parsePhone(data.publicProfile?.phoneSecondary);
                const waPhone = parsePhone(data.publicProfile?.whatsappPhone);

                const currentRole = roles.find(r => r.id === data.role);

                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phoneCode: mainPhone.code,
                    phoneNumber: mainPhone.num,
                    loginEmail: data.email || '',
                    selectedRole: currentRole ? { value: currentRole.id.toString(), label: currentRole.name } : null,
                    password: '',
                    status: data.status || 'active',

                    usePrivateInfo: data.usePrivateInfo || false,
                    profilePhotoUrl: data.publicProfile?.imageUrl || '',

                    phoneSecondaryCode: secondPhone.code,
                    phoneSecondaryNumber: secondPhone.num,
                    whatsappCode: waPhone.code,
                    whatsappNumber: waPhone.num,

                    licenseBBN: data.publicProfile?.compliances?.bbn || (data.license?.type === 'BBN' ? data.license.number : ''),
                    licenseBLN: data.publicProfile?.compliances?.bln || (data.license?.type === 'BLN' ? data.license.number : ''),
                    licenseOther: data.publicProfile?.compliances?.other || (data.license?.type === 'Other' ? data.license.number : ''),
                    licenseOtherExpiry: data.publicProfile?.compliances?.other_expiry || (data.license?.type === 'Other' ? data.license.expiry?.split('T')[0] : ''),

                    experienceSince: data.experienceSince ? data.experienceSince.split('T')[0] : '',
                    languages: data.publicProfile?.languages || [],
                    nationality: data.publicProfile?.nationality || '',
                    position: data.publicProfile?.positionPrimary || '',
                    linkedin: data.publicProfile?.linkedinAddress || '',
                    bioEn: data.bio_en || '',
                    bioAr: data.bio_ar || '',
                });

            } catch (err) {
                setErrorPrivate('Failed to load user data.');
                console.error(err);
            } finally {
                setLoadingPage(false);
            }
        };

        if (id) fetchUserData();
    }, [id, isAuthLoading, roles]);

    const roleOptions = useMemo(() =>
        roles
            .filter(role => role.type === 'base')
            .map(role => ({ value: role.id.toString(), label: role.name })),
        [roles]);

    const licenseOptions = [
        { value: 'BBN', label: 'Dubai Broker License (BBN)' },
        { value: 'BLN', label: 'Abu Dhabi Broker License (BLN)' },
        { value: 'Other', label: 'Other' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.firstName && formData.phoneNumber && formData.loginEmail && formData.selectedRole;

    const validatePhone = (num: string) => {
        if (!num) return true; // Optional fields are valid if empty
        return num.length >= 8 && num.length <= 12;
    };

    const handleSavePrivate = async () => {
        if (!formData.firstName || !formData.phoneNumber || !formData.loginEmail || !formData.selectedRole) {
            setErrorPrivate("Please fill all required fields in Private Profile.");
            setSuccessPrivate(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!validatePhone(formData.phoneNumber)) {
            setErrorPrivate("Phone number must be between 8 and 12 digits.");
            setSuccessPrivate(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        setErrorPrivate(null);
        setSuccessPrivate(null);

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobile: `+${formData.phoneCode}${formData.phoneNumber}`,
            email: formData.loginEmail,
            roleId: Number(formData.selectedRole?.value),
            status: formData.status
        };

        if (formData.password) {
            (payload as any).password = formData.password;
        }

        try {
            await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`, payload);
            await refreshUser(); // تحديث بيانات المستخدم في السياق (Context) لتحديث الشريط الجانبي
            console.log('User refreshed after private save');
            setSuccessPrivate('Private settings saved!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (err: any) {
            setErrorPrivate(err.response?.data?.message || "Failed to save private settings.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSavePublic = async () => {
        if (formData.phoneSecondaryNumber && !validatePhone(formData.phoneSecondaryNumber)) {
            setErrorPublic("Secondary phone number must be between 8 and 12 digits.");
            setSuccessPublic(null);
            setIsPublicSectionOpen(true);
            setTimeout(() => window.scrollTo({ top: document.getElementById('public-profile-section')?.offsetTop || 0, behavior: 'smooth' }), 100);
            return;
        }

        if (formData.whatsappNumber && !validatePhone(formData.whatsappNumber)) {
            setErrorPublic("WhatsApp number must be between 8 and 12 digits.");
            setSuccessPublic(null);
            setIsPublicSectionOpen(true);
            setTimeout(() => window.scrollTo({ top: document.getElementById('public-profile-section')?.offsetTop || 0, behavior: 'smooth' }), 100);
            return;
        }

        setIsSubmitting(true);
        setErrorPublic(null);
        setSuccessPublic(null);

        const payload = {
            use_private_info: formData.usePrivateInfo,
            profile_photo_url: formData.profilePhotoUrl,
            phone_secondary: formData.phoneSecondaryNumber ? `+${formData.phoneSecondaryCode}${formData.phoneSecondaryNumber}` : null,
            whatsapp_phone: formData.whatsappNumber ? `+${formData.whatsappCode}${formData.whatsappNumber}` : null,
            compliances: {
                bbn: formData.licenseBBN,
                bln: formData.licenseBLN,
                other: formData.licenseOther,
                other_expiry: formData.licenseOtherExpiry
            },
            license_type: formData.licenseBBN ? 'BBN' : (formData.licenseBLN ? 'BLN' : (formData.licenseOther ? 'Other' : null)),
            license_number: formData.licenseBBN || formData.licenseBLN || formData.licenseOther,
            license_expiry: formData.licenseOtherExpiry || null,
            experience_since: formData.experienceSince,
            language: formData.languages,
            nationality: formData.nationality,
            position_primary: formData.position,
            linkedin_address: formData.linkedin,
            bio_en: formData.bioEn,
            bio_ar: formData.bioAr,
        };

        try {
            await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`, payload);
            await refreshUser(); // تحديث بيانات المستخدم في السياق (Context) لتحديث الشريط الجانبي
            console.log('User refreshed after public save');
            setSuccessPublic('Public profile updated!');
            setIsPublicSectionOpen(true);
            setTimeout(() => window.scrollTo({ top: document.getElementById('public-profile-section')?.offsetTop || 0, behavior: 'smooth' }), 100);
        } catch (err: any) {
            setErrorPublic(err.response?.data?.message || "Failed to update public profile.");
            setIsPublicSectionOpen(true);
            setTimeout(() => window.scrollTo({ top: document.getElementById('public-profile-section')?.offsetTop || 0, behavior: 'smooth' }), 100);
        } finally {
            setIsSubmitting(false);
        }
    };

    const [showLicenseCalendar, setShowLicenseCalendar] = useState(false);
    const [showExperienceCalendar, setShowExperienceCalendar] = useState(false);

    if (isAuthLoading || loadingPage) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-6">
                <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Users
                </button>

                <div className="space-y-6 pb-20">
                    {/* Private Profile Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-8">
                            <SectionHeader icon={ShieldCheck} title="Private Profile" />

                            {errorPrivate && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm flex gap-2 items-center"><Info size={16} />{errorPrivate}</div>}
                            {successPrivate && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm flex gap-2 items-center"><Check size={16} />{successPrivate}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <FormField label="First Name" required>
                                    <input name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                                </FormField>
                                <FormField label="Last Name" required>
                                    <input name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                                </FormField>
                                <FormField label="Login Email" required>
                                    <input name="loginEmail" type="email" placeholder="example@domain.com" value={formData.loginEmail} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                                </FormField>
                                <FormField label="Mobile Phone" required>
                                    <div className="flex">
                                        <CustomSelect
                                            options={countryCodes}
                                            value={countryCodes.find(c => c.value === formData.phoneCode) || { value: formData.phoneCode, label: `+${formData.phoneCode}` }}
                                            onChange={val => setFormData(p => ({ ...p, phoneCode: String(val?.value || '971') }))}
                                            placeholder="+971"
                                            className="w-24 rounded-r-none"
                                        />
                                        <input name="phoneNumber" type="tel" placeholder="Enter mobile number" value={formData.phoneNumber} onChange={e => setFormData(p => ({ ...p, phoneNumber: e.target.value.replace(/\D/g, '') }))} className="w-full p-2.5 border border-l-0 border-gray-200 rounded-r-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                                    </div>
                                </FormField>
                                <FormField label="New Password" hint="Leave blank to keep current password">
                                    <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                                </FormField>
                                <FormField label="System Role" required>
                                    <CustomSelect options={roleOptions} placeholder="Select a role" value={formData.selectedRole} onChange={val => setFormData(p => ({ ...p, selectedRole: val as { value: string, label: string } }))} />
                                </FormField>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <button type="button" onClick={handleSavePrivate} disabled={isSubmitting} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-sm hover:bg-neutral-800 transition-colors flex items-center gap-2">
                                    {isSubmitting ? <LoadingSpinner /> : 'Save Private Details'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Public Profile Section */}
                    <div id="public-profile-section" className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsPublicSectionOpen(!isPublicSectionOpen)}>
                                    <SectionHeader icon={Globe} title="Public Profile" />
                                </div>
                            </div>

                            {isPublicSectionOpen && (<>
                                <div className="mb-6 flex justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" checked={formData.usePrivateInfo} onChange={e => setFormData(p => ({ ...p, usePrivateInfo: e.target.checked }))} className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500" />
                                        <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">Sync info from private profile</span>
                                    </label>
                                </div>

                                {errorPublic && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm flex gap-2 items-center"><Info size={16} />{errorPublic}</div>}
                                {successPublic && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm flex gap-2 items-center"><Check size={16} />{successPublic}</div>}

                                <div className="space-y-10">
                                    {/* Completion & Photo Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-gray-100 pb-10">
                                        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
                                            <CompliancePieChart percentage={progress} />
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm mb-1">Compliance Score</h4>
                                                <p className="text-xs text-gray-400 max-w-[120px]">Keep your profile updated to increase visibility.</p>
                                            </div>
                                        </div>

                                        {/* Photo Upload */}
                                        <div className="flex items-center gap-6 p-4">
                                            <div className="relative group cursor-pointer" onClick={handleImageClick}>
                                                <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-violet-300 transition-colors">
                                                    {formData.profilePhotoUrl ? (
                                                        <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={32} className="text-gray-300" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Camera size={24} className="text-white" />
                                                    </div>
                                                </div>
                                                <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-500 hover:text-violet-600 transition-colors">
                                                    <Camera size={16} />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm mb-1">Profile Photo</h4>
                                                <p className="text-xs text-gray-400 max-w-xs">Click to upload. Recommended dimensions: 800x800px. Supports JPG, PNG or WebP.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contacts */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-gray-100">
                                        <FormField label="Secondary Phone">
                                            <div className="flex">
                                                <CustomSelect
                                                    options={countryCodes}
                                                    value={countryCodes.find(c => c.value === formData.phoneSecondaryCode) || { value: formData.phoneSecondaryCode, label: `+${formData.phoneSecondaryCode}` }}
                                                    onChange={val => setFormData(p => ({ ...p, phoneSecondaryCode: String(val?.value || '971') }))}
                                                    placeholder="+971"
                                                    className="w-24 rounded-r-none"
                                                />
                                                <input name="phoneSecondaryNumber" type="tel" placeholder="Enter secondary phone number" value={formData.phoneSecondaryNumber} onChange={e => setFormData(p => ({ ...p, phoneSecondaryNumber: e.target.value.replace(/\D/g, '') }))} className="w-full p-2.5 border border-l-0 border-gray-200 rounded-r-lg text-sm outline-none" />
                                            </div>
                                        </FormField>
                                        <FormField label="WhatsApp Number">
                                            <div className="flex">
                                                <CustomSelect
                                                    options={countryCodes}
                                                    value={countryCodes.find(c => c.value === formData.whatsappCode) || { value: formData.whatsappCode, label: `+${formData.whatsappCode}` }}
                                                    onChange={val => setFormData(p => ({ ...p, whatsappCode: String(val?.value || '971') }))}
                                                    placeholder="+971"
                                                    className="w-24 rounded-r-none"
                                                />
                                                <input name="whatsappNumber" type="tel" placeholder="Enter WhatsApp number" value={formData.whatsappNumber} onChange={e => setFormData(p => ({ ...p, whatsappNumber: e.target.value.replace(/\D/g, '') }))} className="w-full p-2.5 border border-l-0 border-gray-200 rounded-r-lg text-sm outline-none" />
                                            </div>
                                        </FormField>
                                    </div>

                                    {/* Licensing */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ShieldCheck size={16} className="text-gray-400" />
                                            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Compliance & Licensing</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <FormField label="Dubai Broker License (BBN)">
                                                <input name="licenseBBN" type="text" placeholder="Enter BBN number" value={formData.licenseBBN} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500" />
                                            </FormField>
                                            <FormField label="Abu Dhabi License (BLN)">
                                                <input name="licenseBLN" type="text" placeholder="Enter BLN number" value={formData.licenseBLN} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500" />
                                            </FormField>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField label="Other License">
                                                    <input name="licenseOther" type="text" placeholder="Enter other license" value={formData.licenseOther} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500" />
                                                </FormField>
                                                <FormField label="Other License Expiry">
                                                    <div className="relative">
                                                        <input
                                                            name="licenseOtherExpiry"
                                                            type="text"
                                                            readOnly
                                                            value={formData.licenseOtherExpiry}
                                                            onClick={() => setShowLicenseCalendar(!showLicenseCalendar)}
                                                            placeholder="Expiry Date"
                                                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer focus:ring-2 focus:ring-violet-500"
                                                        />
                                                        {showLicenseCalendar && (
                                                            <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
                                                                <DayPicker
                                                                    mode="single"
                                                                    selected={formData.licenseOtherExpiry ? new Date(formData.licenseOtherExpiry) : undefined}
                                                                    onSelect={(date) => {
                                                                        if (date) {
                                                                            const offset = date.getTimezoneOffset();
                                                                            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                                                                            setFormData(p => ({ ...p, licenseOtherExpiry: localDate.toISOString().split('T')[0] }));
                                                                            setShowLicenseCalendar(false);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Details */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <User size={16} className="text-gray-400" />
                                            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">About & Professional Details</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <FormField label="Position / Job Title">
                                                <input name="position" type="text" placeholder="e.g. Senior Property Consultant" value={formData.position} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none" />
                                            </FormField>
                                            <FormField label="Experience Since">
                                                <div className="relative">
                                                    <input
                                                        name="experienceSince"
                                                        type="text"
                                                        readOnly
                                                        value={formData.experienceSince}
                                                        onClick={() => setShowExperienceCalendar(!showExperienceCalendar)}
                                                        placeholder="YYYY-MM-DD"
                                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                                                    />
                                                    {showExperienceCalendar && (
                                                        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
                                                            <DayPicker
                                                                mode="single"
                                                                selected={formData.experienceSince ? new Date(formData.experienceSince) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        const offset = date.getTimezoneOffset();
                                                                        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                                                                        setFormData(p => ({ ...p, experienceSince: localDate.toISOString().split('T')[0] }));
                                                                        setShowExperienceCalendar(false);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </FormField>
                                            <FormField label="Spoken Languages">
                                                <CustomSelect
                                                    options={fullLanguages}
                                                    placeholder="Select a language"
                                                    value={null}
                                                    isMulti={true}
                                                    selectedValues={formData.languages}
                                                    onChange={val => {
                                                        if (val) {
                                                            const exists = formData.languages.includes(String(val.value));
                                                            if (exists) {
                                                                setFormData(p => ({ ...p, languages: p.languages.filter(l => l !== String(val.value)) }));
                                                            } else {
                                                                setFormData(p => ({ ...p, languages: [...p.languages, String(val.value)] }));
                                                            }
                                                        }
                                                    }}
                                                    onRemoveValue={val => {
                                                        setFormData(p => ({ ...p, languages: p.languages.filter(l => l !== String(val)) }));
                                                    }}
                                                />
                                            </FormField>
                                            <FormField label="Nationality">
                                                <CustomSelect
                                                    options={nationalities}
                                                    placeholder="Select nationality"
                                                    value={nationalities.find(n => n.value === formData.nationality) || null}
                                                    onChange={val => setFormData(p => ({ ...p, nationality: String(val?.value || '') }))}
                                                />
                                            </FormField>
                                            <FormField label="LinkedIn Profile URL">
                                                <input name="linkedin" type="url" placeholder="https://linkedin.com/in/username" value={formData.linkedin} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none" />
                                            </FormField>
                                            <div className="md:col-span-2">
                                                <FormField label="Description (English)">
                                                    <textarea name="bioEn" rows={4} placeholder="Tell us about yourself in English..." value={formData.bioEn} onChange={handleInputChange as any} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none" />
                                                </FormField>
                                            </div>
                                            <div className="md:col-span-2">
                                                <FormField label="Description (Arabic)">
                                                    <textarea name="bioAr" rows={4} dir="rtl" placeholder="أخبرنا عن نفسك باللغة العربية..." value={formData.bioAr} onChange={handleInputChange as any} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none" />
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                                    <button type="button" onClick={handleSavePublic} disabled={isSubmitting} className="bg-red-600 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2">
                                        {isSubmitting ? <LoadingSpinner /> : 'Update Public Profile'}
                                    </button>
                                </div>
                            </>)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDetails;