import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  points: number;
  badges: string[];
  language: 'en' | 'si' | 'ta';
  degree?: 'IT' | 'AI' | 'Design';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    language: { type: String, enum: ['en', 'si', 'ta'], default: 'en' },
    degree: {
      type: String,
      enum: ['IT', 'AI', 'Design'],
      required: function (this: IUser) {
        return this.role === 'student';
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
