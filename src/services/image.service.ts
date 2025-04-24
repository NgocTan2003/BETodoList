import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_COULD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SERECT_KEY } from "../constants/env"
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR } from '../constants/http';
import { v4 as uuidv4 } from 'uuid';


cloudinary.config({
    cloud_name: CLOUDINARY_COULD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SERECT_KEY,
});

type ResponseUpload = {
    errorCode?: number,
    message: string,
    url?: string,
}

export const uploadImage = async (image: Buffer | null): Promise<ResponseUpload> => {
    try {
        if (image != null) {
            const base64Image = image.toString('base64');
            const dataURI = `data:image/jpeg;base64,${base64Image}`;
            const uniqueId = uuidv4();
            const uploadResult = await cloudinary.uploader.upload(dataURI, {
                public_id: `notes/${uniqueId}`, 
            });

            console.log("uploadResult ------------------------------", uploadResult);
        }

        const optimizeUrl = cloudinary.url('notes', {
            fetch_format: 'auto',
            quality: 'auto'
        });

        return {
            message: "Upload suceess",
            url: optimizeUrl
        }
    } catch (error) {
        console.log("erorr image service -----------------------");

        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: "Image upload failed"
        }
    }
};
