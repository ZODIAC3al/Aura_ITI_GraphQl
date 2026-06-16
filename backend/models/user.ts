import mongoose from 'mongoose'
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
});

userSchema.pre("save", async function (this: any) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

var userModel = mongoose.model("User", userSchema);
export default userModel;
