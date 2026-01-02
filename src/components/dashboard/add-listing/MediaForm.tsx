import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import FormLabel from "../../ui/FormLabel";

interface MediaFormProps {
    images: (File | { url: string; preview?: string; })[];
    onSetImages: (files: (File | { url: string; preview?: string; })[]) => void;
    onComplete?: () => void;
}

type PreviewFile = (File | { url: string; preview?: string; }) & { preview: string };

const MediaForm = ({ images, onSetImages, onComplete }: MediaFormProps) => {
    const [previews, setPreviews] = useState<PreviewFile[]>([]);

    useEffect(() => {
        // إنشاء روابط المعاينة فقط عندما تتغير قائمة `images` الرئيسية
        const newPreviews = images.map(file => {
            if ('url' in file) {
                return { ...file, preview: file.url } as PreviewFile;
            }
            return Object.assign(file, {
                preview: URL.createObjectURL(file as File)
            }) as PreviewFile;
        });
        setPreviews(newPreviews);

        if (images.length > 0 && onComplete) {
            onComplete();
        }

        // Nettoyage des URLs d'objet lorsque le composant est démonté ou lorsque قائمة الصور تتغير
        return () => {
            newPreviews.forEach(file => {
                if (file instanceof File) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [images, onComplete]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // إضافة الملفات الجديدة إلى القائمة الحالية في الحالة الرئيسية
        onSetImages([...images, ...acceptedFiles]);
    }, [images, onSetImages]);

    const removeFile = (fileToRemove: (File | { url: string; preview?: string; })) => {
        // إزالة الملف من الحالة الرئيسية
        onSetImages(images.filter(file => file !== fileToRemove));
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/bmp': []
        }
    });

    return (
        <div className="space-y-6">
            <FormLabel text="Photos of property">
                <p className="text-sm text-gray-500 font-normal mb-2">To rearrange, press and hold then drag the image.</p>
                <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-10 text-center text-gray-500 cursor-pointer">
                    <input {...getInputProps()} />
                    <p>Tap to upload photos or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, BMP</p>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {previews.map((file, index) => (
                        <div key={index} className="relative">
                            <img src={file.preview} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // منع فتح نافذة الرفع عند الضغط على زر الحذف
                                    removeFile(file);
                                }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg hover:bg-red-700"
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            </FormLabel>
            <FormLabel text="360 URL link"><input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500" placeholder="Enter 360 view URL" /></FormLabel>
            <FormLabel text="Video tour URL"><input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500" placeholder="Enter video tour URL" /></FormLabel>
        </div>
    );
};
export default MediaForm;