"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFirestoreTimestamp = void 0;
const formatFirestoreTimestamp = (timestamp) => {
    if (!timestamp || !timestamp._seconds) {
        return null;
    }
    return new Date(timestamp._seconds * 1000).toISOString();
};
exports.formatFirestoreTimestamp = formatFirestoreTimestamp;
//# sourceMappingURL=utils.js.map