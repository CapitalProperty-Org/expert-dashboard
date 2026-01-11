import React, { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomSelect from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';

type Option = { value: string | number; label: string };

const FormField = ({ label, children, required = false }: { label: string, children: React.ReactNode, required?: boolean }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

// قائمة الجنسيات
const nationalities = [
    { value: 'Emirati', label: 'Emirati' },
    { value: 'Saudi', label: 'Saudi' },
    { value: 'Kuwaiti', label: 'Kuwaiti' },
    { value: 'Bahraini', label: 'Bahraini' },
    { value: 'Qatari', label: 'Qatari' },
    { value: 'Omani', label: 'Omani' },
    { value: 'Egyptian', label: 'Egyptian' },
    { value: 'Jordanian', label: 'Jordanian' },
    { value: 'Lebanese', label: 'Lebanese' },
    { value: 'Syrian', label: 'Syrian' },
    { value: 'Iraqi', label: 'Iraqi' },
    { value: 'Palestinian', label: 'Palestinian' },
    { value: 'Yemeni', label: 'Yemeni' },
    { value: 'British', label: 'British' },
    { value: 'American', label: 'American' },
    { value: 'Canadian', label: 'Canadian' },
    { value: 'Australian', label: 'Australian' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Dutch', label: 'Dutch' },
    { value: 'Belgian', label: 'Belgian' },
    { value: 'Swiss', label: 'Swiss' },
    { value: 'Austrian', label: 'Austrian' },
    { value: 'Swedish', label: 'Swedish' },
    { value: 'Norwegian', label: 'Norwegian' },
    { value: 'Danish', label: 'Danish' },
    { value: 'Finnish', label: 'Finnish' },
    { value: 'Polish', label: 'Polish' },
    { value: 'Czech', label: 'Czech' },
    { value: 'Hungarian', label: 'Hungarian' },
    { value: 'Romanian', label: 'Romanian' },
    { value: 'Slovak', label: 'Slovak' },
    { value: 'Slovenian', label: 'Slovenian' },
    { value: 'Croatian', label: 'Croatian' },
    { value: 'Bosnian', label: 'Bosnian' },
    { value: 'Montenegrin', label: 'Montenegrin' },
    { value: 'Macedonian', label: 'Macedonian' },
    { value: 'Albanian', label: 'Albanian' },
    { value: 'Latvian', label: 'Latvian' },
    { value: 'Estonian', label: 'Estonian' },
    { value: 'Lithuanian', label: 'Lithuanian' },
    { value: 'Belarusian', label: 'Belarusian' },
    { value: 'Ukrainian', label: 'Ukrainian' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Turkish', label: 'Turkish' },
    { value: 'Greek', label: 'Greek' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Irish', label: 'Irish' },
    { value: 'Luxembourgish', label: 'Luxembourgish' },
    { value: 'Maltese', label: 'Maltese' },
    { value: 'Cypriot', label: 'Cypriot' },
    { value: 'Bulgarian', label: 'Bulgarian' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Indian', label: 'Indian' },
    { value: 'Pakistani', label: 'Pakistani' },
    { value: 'Bangladeshi', label: 'Bangladeshi' },
    { value: 'Nepalese', label: 'Nepalese' },
    { value: 'Sri Lankan', label: 'Sri Lankan' },
    { value: 'Myanmar', label: 'Myanmar' },
    { value: 'Thai', label: 'Thai' },
    { value: 'Vietnamese', label: 'Vietnamese' },
    { value: 'Cambodian', label: 'Cambodian' },
    { value: 'Laotian', label: 'Laotian' },
    { value: 'Malaysian', label: 'Malaysian' },
    { value: 'Singaporean', label: 'Singaporean' },
    { value: 'Indonesian', label: 'Indonesian' },
    { value: 'Filipino', label: 'Filipino' },
    { value: 'New Zealander', label: 'New Zealander' },
    { value: 'South African', label: 'South African' },
    { value: 'Nigerian', label: 'Nigerian' },
    { value: 'Kenyan', label: 'Kenyan' },
    { value: 'Ugandan', label: 'Ugandan' },
    { value: 'Tanzanian', label: 'Tanzanian' },
    { value: 'Ethiopian', label: 'Ethiopian' },
];

// قائمة اللغات
const languages = [
    { value: 'Arabic', label: 'Arabic' },
    { value: 'English', label: 'English' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Urdu', label: 'Urdu' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Turkish', label: 'Turkish' },
    { value: 'Persian', label: 'Persian' },
    { value: 'Hebrew', label: 'Hebrew' },
    { value: 'Greek', label: 'Greek' },
    { value: 'Dutch', label: 'Dutch' },
    { value: 'Swedish', label: 'Swedish' },
    { value: 'Norwegian', label: 'Norwegian' },
    { value: 'Danish', label: 'Danish' },
    { value: 'Finnish', label: 'Finnish' },
    { value: 'Polish', label: 'Polish' },
    { value: 'Czech', label: 'Czech' },
    { value: 'Hungarian', label: 'Hungarian' },
    { value: 'Romanian', label: 'Romanian' },
    { value: 'Bulgarian', label: 'Bulgarian' },
    { value: 'Croatian', label: 'Croatian' },
    { value: 'Serbian', label: 'Serbian' },
    { value: 'Bosnian', label: 'Bosnian' },
    { value: 'Albanian', label: 'Albanian' },
    { value: 'Macedonian', label: 'Macedonian' },
    { value: 'Slovenian', label: 'Slovenian' },
    { value: 'Slovak', label: 'Slovak' },
    { value: 'Latvian', label: 'Latvian' },
    { value: 'Estonian', label: 'Estonian' },
    { value: 'Lithuanian', label: 'Lithuanian' },
    { value: 'Ukrainian', label: 'Ukrainian' },
    { value: 'Belarusian', label: 'Belarusian' },
    { value: 'Georgian', label: 'Georgian' },
    { value: 'Armenian', label: 'Armenian' },
    { value: 'Azerbaijani', label: 'Azerbaijani' },
    { value: 'Kazakh', label: 'Kazakh' },
    { value: 'Uzbek', label: 'Uzbek' },
    { value: 'Kyrgyz', label: 'Kyrgyz' },
    { value: 'Tajik', label: 'Tajik' },
    { value: 'Turkmen', label: 'Turkmen' },
    { value: 'Mongolian', label: 'Mongolian' },
    { value: 'Thai', label: 'Thai' },
    { value: 'Vietnamese', label: 'Vietnamese' },
    { value: 'Indonesian', label: 'Indonesian' },
    { value: 'Malay', label: 'Malay' },
    { value: 'Filipino', label: 'Filipino' },
    { value: 'Burmese', label: 'Burmese' },
    { value: 'Khmer', label: 'Khmer' },
    { value: 'Lao', label: 'Lao' },
    { value: 'Nepali', label: 'Nepali' },
    { value: 'Sinhala', label: 'Sinhala' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Odia', label: 'Odia' },
    { value: 'Assamese', label: 'Assamese' },
    { value: 'Kashmiri', label: 'Kashmiri' },
    { value: 'Sindhi', label: 'Sindhi' },
    { value: 'Konkani', label: 'Konkani' },
    { value: 'Manipuri', label: 'Manipuri' },
    { value: 'Khasi', label: 'Khasi' },
    { value: 'Mizo', label: 'Mizo' },
    { value: 'Garo', label: 'Garo' },
    { value: 'Naga', label: 'Naga' },
    { value: 'Bodo', label: 'Bodo' },
    { value: 'Santhali', label: 'Santhali' },
    { value: 'Dogri', label: 'Dogri' },
    { value: 'Kashmiri', label: 'Kashmiri' },
    { value: 'Sanskrit', label: 'Sanskrit' },
    { value: 'Pali', label: 'Pali' },
    { value: 'Prakrit', label: 'Prakrit' },
    { value: 'Apabhramsha', label: 'Apabhramsha' },
    { value: 'Pahari', label: 'Pahari' },
    { value: 'Rajasthani', label: 'Rajasthani' },
    { value: 'Bhojpuri', label: 'Bhojpuri' },
    { value: 'Awadhi', label: 'Awadhi' },
    { value: 'Braj', label: 'Braj' },
    { value: 'Bundeli', label: 'Bundeli' },
    { value: 'Bagheli', label: 'Bagheli' },
    { value: 'Chhattisgarhi', label: 'Chhattisgarhi' },
    { value: 'Haryanvi', label: 'Haryanvi' },
    { value: 'Kumaoni', label: 'Kumaoni' },
    { value: 'Garhwali', label: 'Garhwali' },
    { value: 'Kangri', label: 'Kangri' },
    { value: 'Dogri', label: 'Dogri' },
    { value: 'Pahari', label: 'Pahari' },
    { value: 'Kashmiri', label: 'Kashmiri' },
    { value: 'Ladakhi', label: 'Ladakhi' },
    { value: 'Balti', label: 'Balti' },
    { value: 'Shina', label: 'Shina' },
    { value: 'Burushaski', label: 'Burushaski' },
    { value: 'Khowar', label: 'Khowar' },
    { value: 'Kalasha', label: 'Kalasha' },
    { value: 'Torwali', label: 'Torwali' },
    { value: 'Kohistani', label: 'Kohistani' },
    { value: 'Hindko', label: 'Hindko' },
    { value: 'Saraiki', label: 'Saraiki' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Sindhi', label: 'Sindhi' },
    { value: 'Balochi', label: 'Balochi' },
    { value: 'Pashto', label: 'Pashto' },
    { value: 'Brahui', label: 'Brahui' },
    { value: 'Shina', label: 'Shina' },
    { value: 'Khowar', label: 'Khowar' },
    { value: 'Kalasha', label: 'Kalasha' },
    { value: 'Torwali', label: 'Torwali' },
    { value: 'Kohistani', label: 'Kohistani' },
    { value: 'Hindko', label: 'Hindko' },
    { value: 'Saraiki', label: 'Saraiki' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Sindhi', label: 'Sindhi' },
    { value: 'Balochi', label: 'Balochi' },
    { value: 'Pashto', label: 'Pashto' },
    { value: 'Brahui', label: 'Brahui' },
];

// قائمة أكواد الدول
const countryCodes = [
    { value: '971', label: '+971' },
    { value: '966', label: '+966' },
    { value: '965', label: '+965' },
    { value: '973', label: '+973' },
    { value: '974', label: '+974' },
    { value: '968', label: '+968' },
    { value: '20', label: '+20' },
    { value: '212', label: '+212' },
    { value: '216', label: '+216' },
    { value: '213', label: '+213' },
    { value: '1', label: '+1' },
    { value: '44', label: '+44' },
    { value: '33', label: '+33' },
    { value: '49', label: '+49' },
    { value: '39', label: '+39' },
    { value: '34', label: '+34' },
    { value: '31', label: '+31' },
    { value: '32', label: '+32' },
    { value: '41', label: '+41' },
    { value: '43', label: '+43' },
    { value: '46', label: '+46' },
    { value: '47', label: '+47' },
    { value: '45', label: '+45' },
    { value: '358', label: '+358' },
    { value: '48', label: '+48' },
    { value: '420', label: '+420' },
    { value: '36', label: '+36' },
    { value: '40', label: '+40' },
    { value: '421', label: '+421' },
    { value: '386', label: '+386' },
    { value: '385', label: '+385' },
    { value: '387', label: '+387' },
    { value: '382', label: '+382' },
    { value: '389', label: '+389' },
    { value: '355', label: '+355' },
    { value: '371', label: '+371' },
    { value: '372', label: '+372' },
    { value: '370', label: '+370' },
    { value: '375', label: '+375' },
    { value: '380', label: '+380' },
    { value: '7', label: '+7' },
    { value: '90', label: '+90' },
    { value: '30', label: '+30' },
    { value: '351', label: '+351' },
    { value: '353', label: '+353' },
    { value: '352', label: '+352' },
    { value: '356', label: '+356' },
    { value: '357', label: '+357' },
    { value: '359', label: '+359' },
    { value: '81', label: '+81' },
    { value: '82', label: '+82' },
    { value: '86', label: '+86' },
    { value: '91', label: '+91' },
    { value: '92', label: '+92' },
    { value: '880', label: '+880' },
    { value: '977', label: '+977' },
    { value: '94', label: '+94' },
    { value: '95', label: '+95' },
    { value: '66', label: '+66' },
    { value: '84', label: '+84' },
    { value: '855', label: '+855' },
    { value: '856', label: '+856' },
    { value: '60', label: '+60' },
    { value: '65', label: '+65' },
    { value: '62', label: '+62' },
    { value: '63', label: '+63' },
    { value: '61', label: '+61' },
    { value: '64', label: '+64' },
    { value: '27', label: '+27' },
    { value: '234', label: '+234' },
    { value: '254', label: '+254' },
    { value: '256', label: '+256' },
    { value: '255', label: '+255' },
    { value: '251', label: '+251' },
];

// دالة التحقق من صحة رقم الهاتف
function validatePhoneNumber(phone: string) {
    return /^[0-9]{8,15}$/.test(phone);
}
// دالة التحقق من صحة الإيميل
function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.includes('@') && email.includes('.com');
}

const AddNewUser = () => {
    const navigate = useNavigate();
    const { roles } = useAuth();
    console.log('AddNewUser: Roles from AuthContext:', roles);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneCode, setPhoneCode] = useState<Option | null>(countryCodes[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<Option | null>(null);
    const [nationality, setNationality] = useState<Option | null>(null);
    const [selectedLanguages, setSelectedLanguages] = useState<Option[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const roleOptions = useMemo(() => {
        const options = roles
            .filter(role => role.type === 'base')
            .map(role => ({ value: role.id.toString(), label: role.name, key: role.roleKey }));
        console.log('AddNewUser: roleOptions computed:', options);
        return options;
    }, [roles]);

    // التحقق من صحة النموذج - إذا كان role agent، يجب إضافة الجنسية واللغات
    const isFormValid = firstName &&
        phoneNumber &&
        validatePhoneNumber(phoneNumber) &&
        loginEmail &&
        validateEmail(loginEmail) &&
        password &&
        selectedRole &&
        ((selectedRole as any).key !== 'agent' || (nationality && selectedLanguages.length > 0));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setError("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        // Extract phone code value and roleId value
        const fullPhoneNumber = phoneCode ? `+${phoneCode.value}${phoneNumber}` : '';
        const roleId = selectedRole ? Number(selectedRole.value) : null;

        const userData: {
            firstName: string;
            lastName: string;
            phoneNumber: string;
            loginEmail: string;
            roleId: number | null;
            password: string;
            nationality?: string;
            language?: string[];
        } = {
            firstName,
            lastName,
            phoneNumber: fullPhoneNumber,
            loginEmail,
            roleId,
            password,
        };

        // إضافة الجنسية واللغات إذا كان role agent
        if ((selectedRole as any).key === 'agent') {
            userData.nationality = nationality?.value as string;
            userData.language = selectedLanguages.map(lang => lang.value as string);
        }

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users`, userData);
            setSuccess('User created successfully! Redirecting...');

            setFirstName('');
            setLastName('');
            setPhoneNumber('');
            setLoginEmail('');
            setPassword('');
            setSelectedRole(null);
            setPhoneCode(countryCodes[0]);
            setNationality(null);
            setSelectedLanguages([]);

            setTimeout(() => navigate('/users'), 2000);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="  space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft size={16} />
                    Back
                </button>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200/80 rounded-lg p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Add a New User</h2>

                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FormField label="First Name" required>
                                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                            <FormField label="Last Name">
                                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                            <FormField label="Mobile Phone" required>
                                <div className="flex">
                                    <CustomSelect
                                        options={countryCodes}
                                        value={phoneCode}
                                        onChange={setPhoneCode}
                                        placeholder="+971"
                                        className="w-24 rounded-r-none"
                                    />
                                    <input type="tel" placeholder="50 123 4567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} className={`w-full p-2.5 border border-l-0 rounded-r-lg text-sm ${phoneNumber && !validatePhoneNumber(phoneNumber) ? 'border-red-500' : ''}`} />
                                </div>
                                {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                                    <div className="text-red-500 text-sm mt-1">Please enter a valid phone number (8-15 digits)</div>
                                )}
                            </FormField>
                            <FormField label="Login Email" required>
                                <input type="email" placeholder="Login Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${loginEmail && !validateEmail(loginEmail) ? 'border-red-500' : ''}`} />
                                {loginEmail && !validateEmail(loginEmail) && (
                                    <div className="text-red-500 text-sm mt-1">Please enter a valid email with @ and .com</div>
                                )}
                            </FormField>
                            <FormField label="Password" required>
                                <input type="password" placeholder="Set a password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
                            </FormField>
                        </div>
                        <FormField label="Role" required>
                            <CustomSelect options={roleOptions} placeholder="Select a role" value={selectedRole} onChange={setSelectedRole} />
                        </FormField>

                        {/* الحقول الإضافية التي تظهر فقط عند اختيار role agent */}
                        {(selectedRole as any)?.key === 'agent' && (
                            <>
                                <FormField label="Nationality" required>
                                    <CustomSelect
                                        options={nationalities}
                                        placeholder="Select nationality"
                                        value={nationality}
                                        onChange={setNationality}
                                    />
                                </FormField>
                                <FormField label="Languages" required>
                                    <div className="space-y-2">
                                        <CustomSelect
                                            options={languages}
                                            placeholder="Select languages"
                                            value={null}
                                            onChange={(selected) => {
                                                if (selected && !selectedLanguages.find(lang => lang.value === selected.value)) {
                                                    setSelectedLanguages(prev => [...prev, selected]);
                                                }
                                            }}
                                        />
                                        {selectedLanguages.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedLanguages.map((lang, index) => (
                                                    <div key={lang.value} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-sm">
                                                        <span>{lang.label}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedLanguages(prev => prev.filter((_, i) => i !== index))}
                                                            className="text-red-500 hover:text-red-700 ml-1"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormField>
                            </>
                        )}
                        <div>
                            <button
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 enabled:hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send invitation'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewUser;