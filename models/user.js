import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username:{
            type : String,
            required : true,
            unique : true,
            trim: true,
        },
        phoneNumber:{
            type: String,
            required : true,
            unique : true,
            trim: true,
        },
        email:{
            type: String,
            required : true,
            unique : true,
            trim: true,
        },
        password:{
            type: String,
            required : true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['buyer', 'seller', 'admin'],
            default: 'buyer',
        },
    },

    {
    timestamps: true,
    }

    );

    const User = mongoose.model('User', userSchema);
    export default User;