import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username:{
            type : string,
            required : true,
            unique : true,
            trim: true,
        },
        phoneNumber:{
            type: string,
            required : true,
            unique : true,
            trim: true,
        },
        email:{
            type: string,
            required : true,
            unique : true,
            trim: true,
        },
        password:{
            type: string,
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