import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import FormLabel from "../../ui/FormLabel";

interface MediaFormProps {
  images: File[];
  onSetImages: (files: File[]) => void;
}

type PreviewFile = File & { preview: string };

const MediaForm = ({ images, onSetImages }: MediaFormProps) => {
    const [previews, setPreviews] = useState<PreviewFile[]>([]);

    useEffect(() => {
        // إنشاء روابط المعاينة فقط عندما تتغير قائمة `images` الرئيسية
        const newPreviews = images.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setPreviews(newPreviews);

        // Nettoyage des URLs d'objet lorsque le composant est démonté ou lorsque قائمة الصور تتغير
        return () => {
            newPreviews.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [images]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // إضافة الملفات الجديدة إلى القائمة الحالية في الحالة الرئيسية
        onSetImages([...images, ...acceptedFiles]);
    }, [images, onSetImages]);

    const removeFile = (fileToRemove: File) => {
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
            <FormLabel text="360 URL link"><input type="text" className="w-full p-2.5 border rounded-lg" /></FormLabel>
            <FormLabel text="Video tour URL"><input type="text" className="w-full p-2.5 border rounded-lg" /></FormLabel>
        </div>
    );
};
export default MediaForm;