import React,{useState} from "react";
import FormInput from "../components/common/frominput"
import SubmitButton from "../components/common/submitbutton";
import RegisterFooter from "../components/register/registerfooter";


export default function RegisterForm(){
   
    const [formData, setFormData]=useState({
        fullName:"",
        email:"",
        password:"",
        confirmPassword:"",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const handleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();
        setLoading(true);
        try{
            console.log("Dữ liệu gửi lên Backend: ",formData);
        }catch(error){
            console.error(error);
        }finally{
            setLoading(false);
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    return(
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-gray-100">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-wide">Create Account</h1>
                    <p className="text-gray-400 text-xs mt-1">Sign up to get started</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Full name" type="text" name="fullName"
                        placeholder="Enter your full name" value={formData.fullName}
                        onChange={handleChange} required
                    />
                    <FormInput
                        label="Email Address" type="email" name="email"
                        placeholder="Enter your email" value={formData.email}
                        onChange={handleChange} required
                    />
                    <FormInput
                        label="Password" type="password" name="password"
                        placeholder="Enter your password" value={formData.password}
                        onChange={handleChange} required
                    />
                    <FormInput
                        label="Confirm Password" type="password" name="confirmPassword"
                        placeholder="Confirm your password" value={formData.confirmPassword}
                        onChange={handleChange} required
                    />
                    <SubmitButton isLoading={loading}>Register</SubmitButton>
                </form>
                <RegisterFooter/>
            </div>
        </div>
    );
}