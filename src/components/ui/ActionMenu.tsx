import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, FileText, Trash2, Archive } from 'lucide-react';
import axios from 'axios';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import { useListings } from '../../context/ListingsContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
    images?: string[]; // Added images property
}

interface ActionMenuProps {
    listingId: string;
    onActionComplete: () => void;
    listingData?: ListingData;
}

const ActionMenu = ({ listingId, onActionComplete, listingData }: ActionMenuProps) => {
    const { openModal, ConfirmationModalComponent } = useConfirmationModal();
    const { archiveListing } = useListings();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const generatePDF = async () => {
        if (!listingData) {
            console.error('No listing data available for PDF generation');
            return;
        }
        setIsGeneratingPdf(true);
        try {
            const doc = new jsPDF();
            
            // Create a temporary div for rendering images
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.height = '600px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.padding = '20px';
            tempDiv.style.fontFamily = 'Arial, sans-serif';
            
            // Add header with logo placeholder
            tempDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">PF</div>
                    <h1 style="margin: 0; color: #333; font-size: 18px;">Property Finder</h1>
                </div>
            `;
            
            // Add property image placeholder
            const imageSection = document.createElement('div');
            imageSection.style.textAlign = 'center';
            imageSection.style.marginBottom = '20px';
            imageSection.style.padding = '20px';
            imageSection.style.backgroundColor = '#f8f9fa';
            imageSection.style.borderRadius = '8px';
            imageSection.style.border = '2px dashed #dee2e6';
            
            // Try to add real property image if available
            if (listingData.images && listingData.images.length > 0) {
                try {
                    const img = document.createElement('img');
                    img.src = listingData.images[0];
                    img.style.width = '400px';
                    img.style.height = '200px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    img.style.border = '2px solid #dee2e6';
                    
                    // Add loading and error handling
                    img.onload = () => {
                        imageSection.innerHTML = '';
                        imageSection.appendChild(img);
                    };
                    
                    img.onerror = () => {
                        // Fallback to canvas if image fails to load
                        createCanvasPlaceholder();
                    };
                    
                    // Set a timeout in case image takes too long
                    setTimeout(() => {
                        if (!img.complete) {
                            createCanvasPlaceholder();
                        }
                    }, 3000);
                    
                } catch (error) {
                    console.warn('Failed to load property image, using placeholder:', error);
                    createCanvasPlaceholder();
                }
            } else {
                // No images available, use canvas placeholder
                createCanvasPlaceholder();
            }
            
            function createCanvasPlaceholder() {
                // Create a placeholder image with property details
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Background
                    ctx.fillStyle = '#f8f9fa';
                    ctx.fillRect(0, 0, 400, 200);
                    
                    // Border
                    ctx.strokeStyle = '#dee2e6';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, 400, 200);
                    
                    // Property icon
                    ctx.fillStyle = '#667eea';
                    ctx.font = 'bold 48px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('🏠', 200, 80);
                    
                    // Property title
                    ctx.fillStyle = '#333';
                    ctx.font = 'bold 20px Arial';
                    ctx.fillText(`${listingData.bedrooms || 'N/A'} BR ${listingData.type || 'Property'}`, 200, 120);
                    
                    // Location
                    ctx.fillStyle = '#666';
                    ctx.font = '14px Arial';
                    ctx.fillText(listingData.location?.name || 'Location', 200, 140);
                    
                    // Price
                    ctx.fillStyle = '#28a745';
                    ctx.font = 'bold 16px Arial';
                    const priceText = listingData.price?.amounts?.yearly 
                        ? `${listingData.price.amounts.yearly.toLocaleString()} AED`
                        : listingData.price?.amounts?.sale 
                        ? `${listingData.price.amounts.sale.toLocaleString()} AED`
                        : 'POA';
                    ctx.fillText(priceText, 200, 160);
                }
                
                imageSection.innerHTML = '';
                imageSection.appendChild(canvas);
            }
            
            tempDiv.appendChild(imageSection);
            
            // Add property details
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
            
            // Add amenities if available
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
            
            // Add multiple images if available
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
            
            // Add description if available
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
            
            // Add footer
            const footer = document.createElement('div');
            footer.innerHTML = `
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #666; font-size: 10px;">
                    Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                </div>
            `;
            tempDiv.appendChild(footer);
            
            // Add to DOM temporarily
            document.body.appendChild(tempDiv);
            
            try {
                // Convert to canvas
                const canvasResult = await html2canvas(tempDiv, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                
                // Convert canvas to image
                const imgData = canvasResult.toDataURL('image/png');
                
                // Calculate dimensions
                const imgWidth = 190;
                const pageHeight = 297;
                const imgHeight = (canvasResult.height * imgWidth) / canvasResult.width;
                let heightLeft = imgHeight;
                let position = 0;
                
                // Add first page
                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // Add additional pages if needed
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                // Save PDF
                const fileName = `property-${listingData.reference || listingId}-${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
                console.log('PDF generated successfully with images:', fileName);
                
            } finally {
                // Clean up
                document.body.removeChild(tempDiv);
            }
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleAction = async (action: 'archive' | 'delete' | 'createPdf') => {
        setIsLoading(true);
        setIsOpen(false);

        try {
            switch (action) {
                case 'delete':
                    await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/listings/listings/${listingId}`);
                    break;
                case 'archive':
                    await archiveListing(listingId);
                    break;
                case 'createPdf':
                    await generatePDF();
                    break;
            }
            
            onActionComplete();
        } catch (error: unknown) {
            console.error(`Error performing ${action}:`, error);
            // You might want to show an error toast here
        } finally {
            setIsLoading(false);
        }
    };

    const confirmAction = (action: 'archive' | 'delete') => {
        const actionText = action.charAt(0).toUpperCase() + action.slice(1);
        const isDestructive = action === 'delete' || action === 'archive';
        
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
            case 'createPdf': return <FileText size={16} />;
            case 'archive': return <Archive size={16} />;
            case 'delete': return <Trash2 size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'createPdf': return isGeneratingPdf ? 'Generating PDF...' : 'Create PDF';
            case 'archive': return 'Archive';
            case 'delete': return 'Delete';
            default: return action;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'createPdf': return 'text-gray-700 hover:bg-gray-50';
            case 'archive': return 'text-gray-700 hover:bg-gray-50';
            case 'delete': return 'text-red-600 hover:bg-red-50';
            default: return 'text-gray-700 hover:bg-gray-50';
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
            >
                <MoreHorizontal size={16} className="text-gray-600" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                        <button
                            onClick={() => handleAction('createPdf')}
                            disabled={isLoading || isGeneratingPdf}
                            className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm ${getActionColor('createPdf')} disabled:opacity-50`}
                        >
                            {getActionIcon('createPdf')}
                            {getActionLabel('createPdf')}
                        </button>
                        
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
                    </div>
                </div>
            )}

            {ConfirmationModalComponent}
        </div>
    );
};

export default ActionMenu;