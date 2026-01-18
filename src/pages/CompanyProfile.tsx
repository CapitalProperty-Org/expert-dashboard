import React, { useState, useEffect } from 'react';
import { Info, Briefcase, Phone, User, FileText, Building } from 'lucide-react';
import { fetchClientById } from '../services/clientService';
import type { ClientData } from '../services/clientService';
import { useAuth } from '../context/AuthContext';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!user?.clientId) {
        setLoading(false);
        return;
      }
      try {
        // استخدام الخدمة الجديدة لجلب بيانات العميل بشكل ديناميكي
        const clientData = await fetchClientById(user.clientId);
        setProfileData(clientData);
      } catch (err) {
        // في حالة فشل API، استخدم البيانات التجريبية
        console.warn("API call failed, using mock data:", err);
        const mockData: ClientData = {
          id: 1,
          accountNumber: 166036,
          descriptionEn: "Company Name: Taskeen Capital\\n\\nAddress: Office 1, DAMAC Building, Business Bay, Dubai, UAE\\n\\nCompany Description (English): Al Ream Island",
          descriptionAr: "",
          name: "1238538 REAL ESTATE",
          email: "hishamazmy2015@gmail.com",
          phone: "+971547538687",
          fax: null,
          vat: null,
          vatStatus: null,
          vatDocument: null,
          status: "active",
          crmId: null,
          clientType: "Broker",
          creditLimitType: "soft_limit",
          creditsEnabled: true,
          segments: [
            { id: 93, type: "segment", name: "Bronze" },
            { id: 8, type: "emirate", name: "Abu Dhabi" },
            { id: 4, type: "segment", name: "Bronze" },
            { id: 23, type: "category", name: "Economy" }
          ],
          segment: "Bronze",
          licenseNumber: "CN-5433232",
          licenseExpiryDate: "2025-07-21",
          broker: {
            id: 11570,
            name: "1238538 REAL ESTATE",
            email: "hishamazmy2015@gmail.com",
            phone: "+971547538687",
            fax: "",
            url: "",
            reraNumber: "CN-5433232",
            reraExpiryDate: "2025-07-21",
            address: "Office 0, Building 0, Abu Dhabi Gate City, 0, Abu Dhabi,",
            logoToken: null,
            logoCdnPath: null,
            logoVariants: null
          },
          parentId: null,
          isMainBranch: false,
          location: {
            id: 6,
            namePrimary: "Abu Dhabi",
            nameSecondary: "أبوظبي"
          },
          accountManager: {
            email: "neama@propertyfinder.ae"
          },
          subscription: null,
          starRating: null,
          exclusivityType: null,
          allowWhatsAppContact: true,
          isWhatsAppInsights: true,
          isExclusive: false
        };

        setProfileData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }



  if (!profileData) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center text-gray-500">No company profile data available.</div>
      </div>
    );
  }

  // التأكد من وجود البيانات الأساسية
  if (!profileData.name && !profileData.broker?.name) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center text-gray-500">Invalid company profile data.</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="space-y-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-800">Company Profile</h1>

        {/* Information Message */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            To update your profile, email our support team at{' '}
            <a href="mailto:support@propertyfinder.ae" className="font-semibold hover:underline">
              support@propertyfinder.ae
            </a>
          </p>
        </div>

        {/* Company Information Sections */}
        <div className="space-y-4">
          {/* Company Name Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Company Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Company name:</span>
                <span className="text-sm text-gray-800">{profileData.name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Contact information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Phone Number:</span>
                <span className="text-sm text-gray-800">{profileData.phone || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">City:</span>
                <span className="text-sm text-gray-800">{profileData.location?.namePrimary || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Address:</span>
                <span className="text-sm text-gray-800">{profileData.broker?.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Other Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Other information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Account Number:</span>
                <span className="text-sm text-gray-800">{profileData.accountNumber?.toString() || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Client Type:</span>
                <span className="text-sm text-gray-800">{profileData.clientType || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Display client name:</span>
                <span className="text-sm text-gray-800">{profileData.broker?.name || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Default email address:</span>
                <span className="text-sm text-gray-800">{profileData.email || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">VAT Number:</span>
                <span className="text-sm text-gray-800">{profileData.vat || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">VAT Status:</span>
                <span className="text-sm text-gray-800">{profileData.vatStatus || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Single contract for multiple branches:</span>
                <span className="text-sm text-gray-800">{profileData.isMainBranch ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Website URL:</span>
                <span className="text-sm text-gray-800">{profileData.broker?.url || '-'}</span>
              </div>
            </div>
          </div>

          {/* Corporate Licenses Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Corporate licenses</h2>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Trade License Number:</span>
                <span className="text-sm text-gray-800">{profileData.licenseNumber || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Expiry Date:</span>
                <span className="text-sm text-gray-800">{profileData.licenseExpiryDate || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">ORN Number:</span>
                <span className="text-sm text-gray-800">{profileData.broker?.reraNumber || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Expiry Date:</span>
                <span className="text-sm text-gray-800">{profileData.broker?.reraExpiryDate || '-'}</span>
              </div>
            </div>
          </div>

          {/* About Company Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">About company</h2>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">English:</span>
                <span className="text-sm text-gray-800"></span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Company Name:</span>
                <span className="text-sm text-gray-800">Taskeen Capital</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="text-sm font-medium text-gray-600 min-w-[160px]">Address:</span>
                <span className="text-sm text-gray-800">Office 1, DAMAC Building, Business Bay, Dubai, UAE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile; 