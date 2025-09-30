import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserProfile extends Document {
  userId: string
  displayName?: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String },
    photoURL: { type: String },
  },
  { timestamps: true }
)

export const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema)
