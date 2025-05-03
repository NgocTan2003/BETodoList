import mongoose from "mongoose";

export interface NoteDocument extends mongoose.Document {
    title: string;
    content: string;
    isPinned: boolean;
    pathImages: Array<String>;
    createdAt: Date;
    updatedAt: Date;
    tags: Array<String>;
    userId: string;
}

const noteSchema = new mongoose.Schema<NoteDocument>({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isPinned: {
        type: Boolean,
        required: true
    },
    pathImages: {
        type: [String],
    },
    tags: {
        type: [String],
        required: true,
    },
    userId: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const NoteModel = mongoose.model<NoteDocument>("Note", noteSchema);
export default NoteModel;