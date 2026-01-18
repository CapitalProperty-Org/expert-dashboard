export const notificationSettingsData = [
    {
        category: "Listings",
        groups: [
            {
                subCategory: "Creation",
                settings: [
                    { label: "Approval", typeId: 1 },
                    { label: "Refused", typeId: 2 },
                ]
            },
            {
                subCategory: "Verification",
                settings: [
                    { label: "Verification approved", typeId: 3 },
                    { label: "Verification rejected", typeId: 4 },
                    { label: "Verification expired", typeId: 5 },
                ]
            },
            {
                subCategory: "Spotlight",
                settings: [
                    { label: "Spotlight won", typeId: 6 },
                    { label: "Spotlight outcompeted", typeId: 7 },
                    { label: "Spotlight window open", typeId: 8 },
                    { label: "Spotlight window closing", typeId: 9 },
                    { label: "Spotlight winner invalidated", typeId: 10 },
                    { label: "Spotlight performance report", typeId: 11 },
                    { label: "Spotlight Performance Report - Admin", typeId: 12 },
                    { label: "Spotlight Performance Report - Agent", typeId: 13 },
                ]
            },
            {
                subCategory: "Community Top Spot",
                settings: [
                    { label: "CTS won", typeId: 14 },
                    { label: "CTS outbid", typeId: 15 },
                ]
            },
            {
                subCategory: "Settings",
                settings: [
                    { label: "Watermarks Processed", typeId: 16 },
                ]
            }
        ]
    },
    {
        category: "Leads",
        groups: [
            {
                subCategory: "Call tracking",
                settings: [
                    { label: "Email Notifications for My Call Leads", typeId: 39 },
                    { label: "Email Notifications for All Call Leads from all Agents", typeId: 40 },
                ]
            },
            {
                subCategory: "Email leads",
                settings: [
                    { label: "My Email Leads from Listings", typeId: 41 },
                    { label: "My Email Leads from Projects", typeId: 42 },
                    { label: "All Email Leads from Company Profile Page", typeId: 43 },
                    { label: "All Email Leads from all Listings", typeId: 44 },
                    { label: "All Email Leads from all Projects", typeId: 45 },
                ]
            },
            {
                subCategory: "Agent Profile Lead",
                settings: [
                    { label: "WhatsApp Leads from Agent Profile", typeId: 46 },
                ]
            }
        ]
    },
    {
        category: "Credits",
        groups: [
            {
                subCategory: "Credits Updates and Alerts",
                settings: [
                    { label: "Credits released", typeId: 17 },
                    { label: "Low credits", typeId: 18 },
                    { label: "Credits deducted", typeId: 49 },
                    { label: "Credits expiring soon", typeId: 50 },
                ]
            }
        ]
    },
    {
        category: "Users",
        groups: [
            {
                subCategory: "Agent Verification",
                settings: [
                    { label: "Verification submitted", typeId: 19 },
                    { label: "Verification approved", typeId: 20 },
                    { label: "Verification rejected", typeId: 21 },
                    { label: "Agent unverified", typeId: 22 },
                ]
            },
            {
                subCategory: "Consumer Feedback",
                settings: [
                    { label: "New rating", typeId: 47 },
                ]
            },
            {
                subCategory: "SuperAgent Status",
                settings: [
                    { label: "SuperAgent status gained", typeId: 23 },
                    { label: "SuperAgent status lost", typeId: 24 },
                ]
            },
            {
                subCategory: "Agent Holiday Mode",
                settings: [
                    { label: "Upcoming agent holiday reminder", typeId: 25 },
                    { label: "Ongoing holiday terminated", typeId: 26 },
                ]
            }
        ]
    },
    {
        category: "API Integrations",
        groups: [
            {
                subCategory: "Updates and Alerts",
                settings: [
                    { label: "API key expiring", typeId: 48 },
                ]
            }
        ]
    }
];