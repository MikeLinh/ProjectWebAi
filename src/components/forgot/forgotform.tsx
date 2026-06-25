import React, {useState} from "react";
import FormInput from "../common/frominput";
import SubmitButton from "../common/submitbutton";

export default function ForgotForm(){
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try{
            console.log("Reset password for: ",email);
            setIsSubmitted(true);
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false);
        }
        
    };
    if(isSubmitted){
        return(
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-xs text-green-700 mb-4 leading-relaxed">
                Mã code đặt lại mật khẩu của bạn đã được gửi thành công đến địa chỉ email của bạn. Vui lòng kiểm tra thư hoặc thư rác
            </div>
        )
    }
    return(
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <SubmitButton isLoading={loading}>Gửi mã khôi phục</SubmitButton>
        </form>
    )
}