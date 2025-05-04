// backend/models/user_model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  referredBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: last 6 chars of ID as a simple referral code
userSchema.virtual("referralCode").get(function() {
  return this._id.toString().slice(-6);
});

// Virtual: count of how many users have referredBy = this._id
userSchema.virtual("referralCount", {
  ref: "User",
  localField: "_id",
  foreignField: "referredBy",
  count: true,
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare entered password to hashed
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
