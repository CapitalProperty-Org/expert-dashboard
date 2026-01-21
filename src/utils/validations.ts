export const validatePermit = (val: string, emirate: string): boolean => {
    // Special valid number specifically requested by user
    if (val === "1234567") {
        return true;
    }

    // Per-emirate logic
    if (emirate === "dubai") {
        return /^\d{6,8}$/.test(val);
    } else if (emirate === "abu_dhabi") {
        return /^202\d{10,13}$/.test(val);
    } else {
        return val.length > 5;
    }
};
