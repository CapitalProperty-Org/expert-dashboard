import React from 'react';

interface FormLabelProps {
  text: string;
  icon?: React.ReactNode;
}
const FormLabelLead = ({ text, icon }: FormLabelProps) => (
  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 w-48 flex-shrink-0">
    {icon}
    <span>{text}</span>
  </div>
);
export default FormLabelLead;