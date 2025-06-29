export const permissionsData = [
    {
        category: "Contracts & Invoices",
        permissions: [
            { 
                name: "View Contracts, Payments, & Invoices", 
                // تحويل المصفوفة إلى كائن
                access: { "decision_maker": true, "advisor": true, "admin": true, "basic_admin": false, "agent": false, "finance": true, "basic_user": false } 
            },
            { 
                name: "Manage Contracts, Payments, & Invoices", 
                access: { "decision_maker": true, "advisor": true, "admin": false, "basic_admin": false, "agent": false, "finance": true, "basic_user": false } 
            },
        ]
    },
    {
        category: "Properties",
        permissions: [
            { 
                name: "View Listings", 
                access: { "decision_maker": true, "advisor": true, "admin": true, "basic_admin": true, "agent": true, "finance": false, "basic_user": true } 
            },
            { 
                name: "Create New Listing", 
                access: { "decision_maker": true, "advisor": true, "admin": true, "basic_admin": true, "agent": false, "finance": false, "basic_user": false } 
            },
            // ... قم بتحويل باقي الصلاحيات بنفس الطريقة
        ]
    },
    {
        category: "Leads",
        permissions: [
            { 
                name: "View Regular Leads", 
                access: { "decision_maker": true, "advisor": true, "admin": true, "basic_admin": true, "agent": true, "finance": false, "basic_user": false } 
            },
            { 
                name: "Create & Update Regular Leads", 
                access: { "decision_maker": true, "advisor": true, "admin": true, "basic_admin": true, "agent": false, "finance": false, "basic_user": false } 
            },
        ]
    }
];