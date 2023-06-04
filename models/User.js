import mongoose from "mongoose";
const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    
    phoneNumber:{
        type:Number,
        required:true,
    }
});
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    contacts:[contactSchema]
})

const User = mongoose.model("User", userSchema);
export default User;


