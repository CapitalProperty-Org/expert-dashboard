import React, { useState, useEffect } from 'react';
import { MoreHorizontal, FileText, Trash2, Archive, ThumbsUp, Copy, Ban } from 'lucide-react';
import axios from 'axios';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import { useListings } from '../../context/ListingsContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SuccessToast from './SuccessToast';
import ErrorToast from './ErrorToast';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { useAuth } from '../../context/AuthContext';

interface ListingData {
    id: string;
    reference?: string;
    bedrooms?: string | null;
    type?: string;
    price?: {
        type?: 'sale' | 'rent';
        amounts?: {
            sale?: number;
            yearly?: number;
            monthly?: number;
            [key: string]: number | undefined;
        };
    };
    location?: {
        name?: string;
    };
    state?: {
        type?: string;
        stage?: string;
    };
    bathrooms?: string | null;
    size?: number | null;
    category?: string;
    amenities?: string[];
    description?: {
        en?: string;
    };
    images?: string[];
    assigned_to?: { id?: string | number };
    created_by?: { id?: string | number };
}

interface ActionMenuProps {
    listingId: string;
    onActionComplete: () => void;
    listingData?: ListingData;
}

const ActionMenu = ({ listingId, onActionComplete, listingData }: ActionMenuProps) => {
    const { openModal, ConfirmationModalComponent } = useConfirmationModal();
    const { archiveListing, publishListing, deleteListing, unpublishListing } = useListings();
    const { user } = useAuth();
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [visible, setVisible] = useState(false); // Tippy visibility state

    const canEdit = React.useMemo(() => {
        if (!user || !listingData) return false;
        if (user.role === 'admin' || user.role === 'decision_maker') return true; // Admin override

        const userId = Number(user.id);
        const assignedId = Number(listingData.assigned_to?.id);
        const createdId = Number(listingData.created_by?.id);

        return userId === assignedId || userId === createdId;
    }, [user, listingData]);

    // PDF Generation Logic (Kept mostly as is, just function extracted if needed, but keeping inline for simplicity)
    const generatePDF = async () => {
        if (!listingData) {
            console.error('No listing data available for PDF generation');
            return;
        }
        setIsGeneratingPdf(true);
        try {
            const doc = new jsPDF();
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.height = '600px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.padding = '20px';
            tempDiv.style.fontFamily = 'Arial, sans-serif';

            tempDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">PF</div>
                    <h1 style="margin: 0; color: #333; font-size: 18px;">Property Finder</h1>
                </div>
            `;

            const imageSection = document.createElement('div');
            imageSection.style.textAlign = 'center';
            imageSection.style.marginBottom = '20px';
            imageSection.style.padding = '20px';
            imageSection.style.backgroundColor = '#f8f9fa';
            imageSection.style.borderRadius = '8px';
            imageSection.style.border = '2px dashed #dee2e6';

            if (listingData.images && listingData.images.length > 0) {
                try {
                    const img = document.createElement('img');
                    img.src = listingData.images[0];
                    img.style.width = '400px';
                    img.style.height = '200px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    img.style.border = '2px solid #dee2e6';

                    // Promise wrapper for image loading
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        // Determine failure if not loaded within timeout
                        setTimeout(() => {
                            if (!img.complete) resolve(null);
                        }, 3000);
                    });

                    imageSection.innerHTML = '';
                    imageSection.appendChild(img);

                } catch (error) {
                    console.warn('Failed to load property image, using placeholder:', error);
                    createCanvasPlaceholder();
                }
            } else {
                createCanvasPlaceholder();
            }

            function createCanvasPlaceholder() {
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#f8f9fa';
                    ctx.fillRect(0, 0, 400, 200);
                    ctx.strokeStyle = '#dee2e6';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, 400, 200);
                    ctx.fillStyle = '#667eea';
                    ctx.font = 'bold 48px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('🏠', 200, 80);
                    ctx.fillStyle = '#333';
                    ctx.font = 'bold 20px Arial';
                    ctx.fillText(`${listingData?.bedrooms || 'N/A'} BR ${listingData?.type || 'Property'}`, 200, 120);
                    ctx.fillStyle = '#666';
                    ctx.font = '14px Arial';
                    ctx.fillText(listingData?.location?.name || 'Location', 200, 140);
                    ctx.fillStyle = '#28a745';
                    ctx.font = 'bold 16px Arial';
                    const priceText = listingData?.price?.amounts?.yearly
                        ? `${listingData.price.amounts.yearly.toLocaleString()} AED`
                        : listingData?.price?.amounts?.sale
                            ? `${listingData.price.amounts.sale.toLocaleString()} AED`
                            : 'POA';
                    ctx.fillText(priceText || 'POA', 200, 160);
                }
                imageSection.innerHTML = '';
                imageSection.appendChild(canvas);
            }

            tempDiv.appendChild(imageSection);

            const detailsSection = document.createElement('div');
            detailsSection.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h2 style="color: #333; font-size: 16px; margin-bottom: 10px;">Property Details</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                        <div><strong>Reference:</strong> ${listingData.reference || listingId}</div>
                        <div><strong>Status:</strong> ${listingData.state?.stage || listingData.state?.type || 'N/A'}</div>
                        <div><strong>Type:</strong> ${listingData.type || 'N/A'}</div>
                        <div><strong>Category:</strong> ${listingData.category || 'N/A'}</div>
                        <div><strong>Bedrooms:</strong> ${listingData.bedrooms || 'N/A'}</div>
                        <div><strong>Bathrooms:</strong> ${listingData.bathrooms || 'N/A'}</div>
                        <div><strong>Size:</strong> ${listingData.size ? `${listingData.size} sqft` : 'N/A'}</div>
                        <div><strong>Price Type:</strong> ${listingData.price?.type || 'N/A'}</div>
                    </div>
                </div>
            `;
            tempDiv.appendChild(detailsSection);

            if (listingData.amenities && listingData.amenities.length > 0) {
                const amenitiesSection = document.createElement('div');
                amenitiesSection.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #333; font-size: 14px; margin-bottom: 8px;">Amenities</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${listingData.amenities.map(amenity =>
                    `<span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 11px;">${amenity}</span>`
                ).join('')}
                        </div>
                    </div>
                `;
                tempDiv.appendChild(amenitiesSection);
            }

            if (listingData.images && listingData.images.length > 1) {
                const imagesSection = document.createElement('div');
                imagesSection.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #333; font-size: 14px; margin-bottom: 8px;">Property Images</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            ${listingData.images.slice(1, 5).map((imgSrc, index) => `
                                <div style="text-align: center;">
                                    <img src="${imgSrc}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #dee2e6;" alt="Property Image ${index + 2}" />
                                    <p style="font-size: 10px; color: #666; margin-top: 5px;">Image ${index + 2}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                tempDiv.appendChild(imagesSection);
            }

            if (listingData.description?.en) {
                const descSection = document.createElement('div');
                descSection.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #333; font-size: 14px; margin-bottom: 8px;">Description</h3>
                        <p style="color: #666; font-size: 12px; line-height: 1.4; margin: 0;">${listingData.description.en}</p>
                    </div>
                `;
                tempDiv.appendChild(descSection);
            }

            const footer = document.createElement('div');
            footer.innerHTML = `
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #666; font-size: 10px;">
                    Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                </div>
            `;
            tempDiv.appendChild(footer);

            document.body.appendChild(tempDiv);

            try {
                const canvasResult = await html2canvas(tempDiv, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvasResult.toDataURL('image/png');
                const imgWidth = 190;
                const pageHeight = 297;
                const imgHeight = (canvasResult.height * imgWidth) / canvasResult.width;
                let heightLeft = imgHeight;
                let position = 0;

                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                const fileName = `property-${listingData.reference || listingId}-${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
            } finally {
                document.body.removeChild(tempDiv);
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            setMessage('Failed to generate PDF. Please try again.');
            setShowErrorToast(true);
        } finally {
            setIsGeneratingPdf(false);
            setVisible(false); // Close menu after action
        }
    };

    const handleAction = async (action: 'archive' | 'delete' | 'createPdf' | 'publish' | 'copy' | 'unpublish') => {
        setIsLoading(true);
        // Do NOT close immediately for async actions if you want to show loading state inside menu? 
        // Actually, better to close menu and show toast/floating loader.
        // But for consistency let's match previous behavior - wait for action? 
        // Previous behavior: setIsOpen(false) immediately. 
        setVisible(false);

        try {
            switch (action) {
                case 'delete':
                    await deleteListing(listingId);
                    setMessage('Listing deleted successfully!');
                    setShowSuccessToast(true);
                    break;
                case 'archive':
                    await archiveListing(listingId);
                    setMessage('Listing archived successfully!');
                    setShowSuccessToast(true);
                    break;
                case 'createPdf':
                    await generatePDF();
                    break;
                case 'publish':
                    await publishListing(listingId);
                    setMessage('Listing published successfully! 🚀');
                    setShowSuccessToast(true);
                    break;
                case 'unpublish':
                    await unpublishListing(listingId);
                    setMessage('Listing reverted to draft successfully!');
                    setShowSuccessToast(true);
                    break;
            }

            onActionComplete();
        } catch (error: unknown) {
            console.error(`Error performing ${action}:`, error);
            const errMsg = error instanceof Error ? error.message : `Failed to perform ${action}.`;
            setMessage(errMsg);
            setShowErrorToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmAction = (action: 'archive' | 'delete') => {
        const actionText = action.charAt(0).toUpperCase() + action.slice(1);
        const isDestructive = action === 'delete' || action === 'archive';

        setVisible(false); // Close menu before showing modal

        openModal({
            title: `${actionText} Listing`,
            description: `Are you sure you want to ${action} this listing?`,
            confirmText: actionText,
            isDestructive,
            onConfirm: () => handleAction(action),
        });
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'publish': return <ThumbsUp size={16} />;
            case 'createPdf': return <FileText size={16} />;
            case 'archive': return <Archive size={16} />;
            case 'delete': return <Trash2 size={16} />;
            case 'copy': return <Copy size={16} />;
            case 'unpublish': return <Ban size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'publish': return 'Publish';
            case 'createPdf': return isGeneratingPdf ? 'Generating PDF...' : 'Create PDF';
            case 'archive': return 'Archive';
            case 'delete': return 'Delete';
            case 'copy': return 'Copy Reference';
            case 'unpublish': return 'Unpublish';
            default: return action;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'publish': return 'text-violet-600 hover:bg-violet-50';
            case 'createPdf': return 'text-gray-700 hover:bg-gray-50';
            case 'archive': return 'text-gray-700 hover:bg-gray-50';
            case 'delete': return 'text-red-600 hover:bg-red-50';
            case 'copy': return 'text-violet-600 hover:bg-violet-50';
            case 'unpublish': return 'text-gray-700 hover:bg-gray-50';
            default: return 'text-gray-700 hover:bg-gray-50';
        }
    };

    const menuContent = (
        <div className="w-48 bg-white rounded-md shadow-sm">
            <div className="py-1">
                {canEdit && (listingData?.state?.stage === 'draft' || listingData?.state?.stage === 'archived') && (
                    <>
                        {/* Check for completeness: price, location, images, type, category */}
                        {(() => {
                            const hasPrice = listingData?.price?.amounts?.sale || listingData?.price?.amounts?.yearly || listingData?.price?.amounts?.monthly;
                            const hasLocation = listingData?.location?.name;
                            const hasImages = listingData?.images && listingData.images.length > 0;
                            const hasType = listingData?.type;
                            const hasCategory = listingData?.category;

                            const isComplete = hasPrice && hasLocation && hasImages && hasType && hasCategory;

                            if (!isComplete) return null;

                            return (
                                <button
                                    onClick={() => handleAction('publish')}
                                    disabled={isLoading}
                                    className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm ${getActionColor('publish')} disabled:opacity-50`}
                                >
                                    {getActionIcon('publish')}
                                    {getActionLabel('publish')}
                                </button>
                            );
                        })()}
                    </>
                )}
                {canEdit && listingData?.state?.stage === 'live' && (
                    <button
                        onClick={() => handleAction('unpublish')}
                        disabled={isLoading}
                        className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm ${getActionColor('unpublish')} disabled:opacity-50`}
                    >
                        {getActionIcon('unpublish')}
                        {getActionLabel('unpublish')}
                    </button>
                )}
                <button
                    onClick={() => handleAction('createPdf')}
                    disabled={isLoading || isGeneratingPdf}
                    className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm ${getActionColor('createPdf')} disabled:opacity-50`}
                >
                    {getActionIcon('createPdf')}
                    {getActionLabel('createPdf')}
                </button>

                {canEdit && (
                    <>
                        <button
                            onClick={() => confirmAction('delete')}
                            disabled={isLoading}
                            className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm ${getActionColor('delete')} disabled:opacity-50`}
                        >
                            {getActionIcon('delete')}
                            {getActionLabel('delete')}
                        </button>

                        <button
                            onClick={() => confirmAction('archive')}
                            disabled={isLoading}
                            className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm ${getActionColor('archive')} disabled:opacity-50`}
                        >
                            {getActionIcon('archive')}
                            {getActionLabel('archive')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative">
            <Tippy
                content={menuContent}
                visible={visible}
                onClickOutside={() => setVisible(false)}
                interactive={true}
                placement="bottom-end"
                theme="light"
                animation="fade"
                offset={[0, 4]} // Offset to match previous margin top
                appendTo={document.body}
                popperOptions={{
                    strategy: 'fixed',
                    modifiers: [
                        {
                            name: 'preventOverflow',
                            options: {
                                boundary: 'window',
                            },
                        },
                    ],
                }}
            >
                <button
                    onClick={() => setVisible(!visible)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isLoading}
                >
                    <MoreHorizontal size={16} className="text-gray-600" />
                </button>
            </Tippy>

            {ConfirmationModalComponent}
            {showSuccessToast && (
                <SuccessToast
                    show={showSuccessToast}
                    message={message}
                    onClose={() => setShowSuccessToast(false)}
                />
            )}
            {showErrorToast && (
                <ErrorToast
                    show={showErrorToast}
                    message={message}
                    onClose={() => setShowErrorToast(false)}
                />
            )}
        </div>
    );
};

export default ActionMenu;