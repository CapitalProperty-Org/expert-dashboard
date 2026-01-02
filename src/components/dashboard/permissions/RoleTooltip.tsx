import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { Check } from 'lucide-react';

interface RoleDescription {
    title: string;
    subtitle?: string;
    description: string;
    features?: string[];
}

const ROLE_DESCRIPTIONS: Record<string, RoleDescription> = {
    'decision_maker': {
        title: 'Decision Maker',
        subtitle: 'Suitable titles: Chairman, CEO, COO',
        description: 'Decision Maker is the user with access to all modules and features.',
        features: [
            'Manage Contracts, Payment and Invoices.',
            'Full access to Listings, Leads and Insights.',
            'Create and manage users in your organization.'
        ]
    },
    'advisor': {
        title: 'Advisor',
        subtitle: 'Suitable titles: Managing & Sales Directors',
        description: 'Advisor is a full access user to facilitate the Decision Maker in driving key decisions.',
        features: [
            'Manage Payment and Invoices.',
            'Full access to Listings, Leads and Insights.',
            'Create and manage users in your organization.'
        ]
    },
    'admin': {
        title: 'Admin',
        subtitle: 'Suitable titles: Admin, Sales/Leasing Manager, Operations Manager',
        description: 'Admin is a day-to-day operations & management role.',
        features: [
            'Full access to Listings, Leads and Insights.',
            'Create, publish, & update Listings.',
            'Manage credits, claim transactions, set agent holiday and more.'
        ]
    },
    'basic_admin': {
        title: 'Basic Admin',
        subtitle: 'Suitable titles: Admin, Sales/Leasing Manager, Operations Manager',
        description: 'Basic Admin cannot upgrade listings and allocate credits between agents.',
        features: [
            'Access to Listings, Leads, & Insights;',
            'Create, publish, & update Listings.',
            'Claim transactions, set agent holiday and more.'
        ]
    },
    'agent': {
        title: 'Agent',
        subtitle: 'Suitable titles: Agent, Client Relationship, Property Consultant, Advisor',
        description: 'Agent is an exclusive role for one\'s own listings.',
        features: [
            'View the listings assigned to them.',
            'View and manage their SuperAgent Insights, set holiday mode, & claim their transactions.'
        ]
    },
    'finance': {
        title: 'Finance',
        subtitle: 'Suitable titles: CFO, Finance Manager, Finance Executive',
        description: 'An exclusive role to manage finance related operations.',
        features: [
            'Manage payments & invoices.',
            'Manage credits.',
            'Access to features like Community Top Spot & Spotlight listings, and more.'
        ]
    },
    'limited_access_user': {
        title: 'Limited Access User',
        description: 'A view-only access to relevant but not sensitive information in PF Expert.'
    },
    'basic_user': {
        title: 'Limited Access User',
        description: 'A view-only access to relevant but not sensitive information in PF Expert.'
    },
    'limited_user': {
        title: 'Limited Access User',
        description: 'A view-only access to relevant but not sensitive information in PF Expert.'
    }
};

interface RoleTooltipProps {
    roleKey: string;
    children: React.ReactElement;
}

const RoleTooltip = ({ roleKey, children }: RoleTooltipProps) => {
    // If it's a custom role (not in our map), we try to find its base role description if possible?
    // Or just return children if no description found. 
    // User requested "Base type roles", so we likely only need to support the keys above.
    // If a custom role comes in, we might want to show the description of its BASE role.
    // But the component props passed here might be the Custom Role's key.
    // However, the Table already filters to ONLY display base roles (as per previous task).
    // So roleKey will be one of the base keys. Good.

    const data = ROLE_DESCRIPTIONS[roleKey];

    if (!data) {
        return children;
    }

    const tooltipContent = (
        <div className="w-80 p-4 text-left">
            <h3 className="text-gray-900 font-bold text-base mb-1">{data.title}</h3>
            {data.subtitle && <p className="text-gray-500 text-xs mb-3">{data.subtitle}</p>}

            <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                {data.description}
            </p>

            {data.features && data.features.length > 0 && (
                <ul className="space-y-2">
                    {data.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check size={14} className="mt-1 text-gray-400 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <Tippy
            content={tooltipContent}
            theme="light"
            interactive={true}
            placement="bottom"
            maxWidth={350}
            className="shadow-xl border border-gray-100"
        >
            <div className="inline-block cursor-help hover:text-gray-900 transition-colors">
                {children}
            </div>
        </Tippy>
    );
};

export default RoleTooltip;
