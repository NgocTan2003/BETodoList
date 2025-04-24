const getEnv = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
}

export const MONGO_URI = getEnv("MONGO_URI");
export const PORT = getEnv("PORT", "8000");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const APP_DOMAIN = getEnv("APP_DOMAIN");
export const JWT_SECRET = getEnv("JWT_SECRET")
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET")
export const NODE_ENV = getEnv("NODE_ENV")
export const MAIL_HOST = getEnv("MAIL_HOST");
export const MAIL_USERNAME = getEnv("MAIL_USERNAME")
export const MAIL_PASSWORD = getEnv("MAIL_PASSWORD")
export const CLOUDINARY_COULD_NAME = getEnv("CLOUDINARY_COULD_NAME")
export const CLOUDINARY_API_KEY = getEnv("CLOUDINARY_API_KEY")
export const CLOUDINARY_SERECT_KEY = getEnv("CLOUDINARY_SERECT_KEY")