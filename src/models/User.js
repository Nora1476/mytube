import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  socialOnly: { type: Boolean, default: false }, //이메일로 로그인하려는데 패스워드가 없을때는 대비
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
});

userSchema.pre("save", async function () {
  console.log("user pass", this.password);
  this.password = await bcrypt.hash(this.password, 5);
  console.log("hash pass", this.password);
});

const User = mongoose.model("User", userSchema);
export default User;
