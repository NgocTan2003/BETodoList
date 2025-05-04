import { createNoteSchema, updateNoteSchema, updateNoteIsPinnedSchema } from "./note.schema";
import { Create, Delete, Update, Search, UpdateIsPinned, GetList } from "../services/note.service"
import { z } from "zod";
import { Request, Response } from "express";
import { CREATED, OK, INTERNAL_SERVER_ERROR, UNAUTHORIZED, BAD_REQUEST } from "../constants/http"

const getListHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const user = (req as any).user;
        if (!user || !user._id) {
            return res.status(UNAUTHORIZED).json({
                statusCode: UNAUTHORIZED,
                message: "Unauthorized"
            });
        }

        const response = await GetList(user._id, req);

        if (response.errorCode) {
            return res.status(response.errorCode || 500).json({
                statusCode: response.errorCode,
                message: response.message
            });
        }

        return res.status(200).json({
            statusCode: OK,
            message: response.message,
            notes: response.notes
        });
    } catch (error) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const createHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = (req as any).user?._id;
        const files = req.files as Express.Multer.File[];

        const request = {
            title: req.body.title,
            content: req.body.content,
            isPinned: req.body.isPinned === "true",
            tags: JSON.parse(req.body.tags),
            userId: userId,
            images: files.map(file => file.buffer)
        };

        const validatedData = createNoteSchema.parse(request);
        const response = await Create(validatedData);

        if (response.errorCode) {
            return res.status(OK).json({
                statusCode: response.errorCode,
                message: response.message
            });
        }

        return res.status(200).json({
            statusCode: CREATED,
            message: response.message
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(err => err.message);
            return res.status(OK).json({
                statuscode: BAD_REQUEST,
                message: messages,
            });
        }
        throw error;
    }
}

const updateHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const files = req.files as Express.Multer.File[];

        const request = {
            title: req.body.title,
            content: req.body.content,
            isPinned: req.body.isPinned === "true",
            tags: JSON.parse(req.body.tags),
            imageOld: JSON.parse(req.body.imageOld),
            images: files.map(file => file.buffer)
        };

        const validatedData = updateNoteSchema.parse(request);
        const response = await Update(req, validatedData);

        if (response.errorCode) {
            return res.status(response.errorCode || 500).json({
                statusCode: response.errorCode,
                message: response.message,
            });
        }

        return res.status(200).json({
            statusCode: OK,
            message: response.message
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({ messages });
        }
        throw error;
    }
}

const deleteHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const response = await Delete(req);

        if (response.errorCode) {
            return res.status(response.errorCode || 500).json({
                statusCode: response.errorCode,
                message: response.message,
            });
        }

        return res.status(200).json({
            statusCode: OK,
            message: response.message
        });
    } catch (error) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const searchHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const response = await Search(req);

        if (response.errorCode) {
            return res.status(response.errorCode || 500).json({
                statusCode: response.errorCode,
                message: response.message
            });
        }

        return res.status(200).json({
            statusCode: OK,
            message: response.message,
            notes: response.notes
        });

    } catch (error) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

const updateIsPinned = async (req: Request, res: Response): Promise<any> => {
    try {
        const request = updateNoteIsPinnedSchema.parse({
            ...req.body
        });

        const response = await UpdateIsPinned(req, request);

        if (response.errorCode) {
            return res.status(response.errorCode || 500).json({
                statusCode: response.errorCode,
                message: response.message
            });
        }

        return res.status(200).json({
            statusCode: OK,
            message: response.message,
        });

    } catch (error) {
        return {
            errorCode: INTERNAL_SERVER_ERROR,
            message: error
        };
    }
}

export { getListHandler, createHandler, updateHandler, deleteHandler, searchHandler, updateIsPinned }