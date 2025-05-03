import NoteModel, { NoteDocument } from "../models/note.model";
import { NOT_FOUND, CREATED, INTERNAL_SERVER_ERROR } from "../constants/http"
import { Request } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../constants/env"
import { uploadImage, deleteImage } from "../services/image.service"
import { extractPublicId } from "../utils/helper"

type CreateNoteRequest = {
    title: string;
    content: string;
    isPinned: boolean;
    tags: Array<String>;
    userId: string;
    images?: Buffer[] | null;
}

type UpdateNoteResquest = {
    title: string;
    content: string;
    isPinned: boolean;
    tags: Array<String>;
    imageOld?: Array<String>;
    images?: Buffer[] | null;
}

type NoteResponse = {
    errorCode?: number,
    message: string,
    notes?: Array<NoteDocument>
}

type UpdateIsPinned = {
    isPinned: boolean;
}

type note = {
    title: string;
    content: string;
    isPinned: boolean;
    tags: Array<String>;
    pathImages?: Array<string>;
    userId: string
}

const GetAll = async (userId: string): Promise<NoteResponse> => {
    try {
        const notes = await NoteModel.find({ userId: userId });

        return {
            message: "Success",
            notes: notes
        }
    } catch (error: any) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const Create = async (request: CreateNoteRequest): Promise<NoteResponse> => {
    try {
        const noteData: note = {
            title: request.title,
            content: request.content,
            isPinned: request.isPinned,
            tags: request.tags,
            userId: request.userId,
            pathImages: []
        }

        if (request.images && request.images.length > 0) {
            for (const img of request.images) {
                const resultImage = await uploadImage(img);

                if (resultImage.errorCode) {
                    return {
                        errorCode: resultImage.errorCode,
                        message: resultImage.message
                    };
                }

                if (resultImage.url) {
                    console.log("resultImage.url ------------------------------", resultImage.url);
                    noteData.pathImages?.push(resultImage.url);
                }
            }
        }

        const note = await NoteModel.create(noteData);
        return {
            message: "Create Success"
        }
    } catch (error: any) {
        console.log("erorr note service -----------------------", error);
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const Update = async (req: Request, data: UpdateNoteResquest): Promise<NoteResponse> => {
    try {
        const note = await NoteModel.findOne({ _id: req.params.noteId })
        if (!note) {
            return ({
                errorCode: NOT_FOUND,
                message: "Not Found"
            })
        }

        if (data.title) note.title = data.title;
        if (data.content) note.content = data.content;
        if (data.tags) note.tags = data.tags;
        if (data.isPinned) note.isPinned = data.isPinned;
        if (data.imageOld) {
            const deletedImages = note.pathImages
                .filter(image => !data.imageOld?.includes(image))
                .map(image => image.toString());

            const publicIds = deletedImages
                .map(url => extractPublicId(url))
                .filter(Boolean);

            const deleteResult = await deleteImage(publicIds);
            console.log('Delete result:', deleteResult);
            if (deleteResult.errorCode) {
                return {
                    errorCode: deleteResult.errorCode,
                    message: deleteResult.message
                };
            }
            note.pathImages = data.imageOld;
        }

        if (data.images && data.images.length > 0) {
            for (const img of data.images) {
                const resultCreate = await uploadImage(img);

                if (resultCreate.errorCode) {
                    return {
                        errorCode: resultCreate.errorCode,
                        message: resultCreate.message
                    };
                }

                if (resultCreate.url) {
                    note.pathImages?.push(resultCreate.url);
                }
            }
        }

        await note.save();

        return {
            message: "Update Success"
        }
    } catch (error: any) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const Delete = async (req: Request): Promise<NoteResponse> => {
    try {
        const note = await NoteModel.findOne({ _id: req.params.noteId })
        if (!note) {
            return ({
                errorCode: NOT_FOUND,
                message: "Not Found"
            })
        }

        await NoteModel.deleteOne({ _id: note._id });

        return {
            message: "Delete Success"
        }
    } catch (error: any) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const Search = async (req: Request): Promise<NoteResponse> => {
    try {
        const accessToken = req.cookies.accessToken;
        const decoded: any = jwt.verify(accessToken, JWT_SECRET);
        const userId = decoded.user._id;
        const searchQuery = req.query.query as string;

        const matchingNotes = await NoteModel.find({
            userId: userId,
            $or: [
                { title: { $regex: new RegExp(searchQuery, "i") } },
                { content: { $regex: new RegExp(searchQuery, "i") } }
            ],
        });

        return {
            message: "Success",
            notes: matchingNotes
        }

    } catch (error: any) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const UpdateIsPinned = async (req: Request, data: UpdateIsPinned): Promise<NoteResponse> => {
    try {
        const note = await NoteModel.findOne({ _id: req.params.noteId })
        if (!note) {
            return {
                errorCode: NOT_FOUND,
                message: "Note note found"
            };
        }

        note.isPinned = data.isPinned;
        await note.save();

        return {
            message: "Update Success",
        }

    } catch (error: any) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

export { GetAll, Create, Update, Delete, Search, UpdateIsPinned }