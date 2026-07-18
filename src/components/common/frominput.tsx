import React from "react";

//Cho phép component 'FormInput' tự động kế thừa các thuộc tính tiêu chuẩn của một thẻ input trong HTML
interface FromInputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    label:string;
}
export default function FormInput({label, ...props}: FromInputProps){ 
  return(
      <div className="space-y-3 text-xs">
        <label className="font-semibold text-gray-700 block">{label}</label>
        <input 
        {...props} //sử dụng toán tử spread lưu lại các thuộc tính truyền vào
        className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-non focus:border-indigo-950 transition-colors text-gray-700"
        />
    </div>
  );
}