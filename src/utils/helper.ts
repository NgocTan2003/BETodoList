export const extractPublicId = (url: string): string => {
    const match = url.match(/\/v1\/(notes\/[^?]+)/);
    return match ? match[1] : '';
};
