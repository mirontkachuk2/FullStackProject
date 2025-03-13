export const formatFirestoreTimestamp = (timestamp: any): string | null => {
    if (!timestamp || !timestamp._seconds) {
        return null;
    }
    return new Date(timestamp._seconds * 1000).toISOString();
};
