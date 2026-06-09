    import React from "react";
    import DeblurIcon from '@mui/icons-material/Deblur';
    import { Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material';

    export default function Footer() {
        return (
            <div className="bg-blue-950 text-white pt-12 pb-6 mt-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10">
                        {/* Column 1*/}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <button> <DeblurIcon /></button>
                                <span className="font-bold text-lg">
                                    BIKECYC <span className="text-blue-500">STORE</span>
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed font-normal text-gray-400">
                                Cung cấp những mẫu xe đạp hiệu suất cao nhất thế giới từ năm 2026. 
                                Bứt phá mọi giới hạn cùng bạn.</p>
                        </div>
                        {/* Column 2*/}
                        <div className="space-y-4">
                            <h4 className="font-bold">SẢN PHẨM</h4>
                            <ul className="space-y-2.5 text-sm text-gray-400">
                                <li className="hover:text-white cursor-pointer transition-all duration-300 hover:translate-x-2">
                                    Xe đường trường</li>
                                <li className="hover:text-white cursor-pointer transition-all duration-300 hover:translate-x-2">
                                    Xe địa hình</li>
                                <li className="hover:text-white cursor-pointer transition-all duration-300 hover:translate-x-2">
                                    Phụ kiện</li>
                            </ul>
                        </div>
                         {/* Column 3*/}
                         <div className="space-y-4">
                            <h4 className="font-bold">HỖ TRỢ</h4>
                            <ul className="space-y-2.5 text-sm text-gray-400">
                                <li className="hover:text-white cursor-pointer transition-all duration-300 hover:translate-x-2">
                                    Hướng dẫn mua hàng</li>
                                <li className="hover:text-white cursor-pointer transition-all duration-300 hover:translate-x-2">
                                    Chính sách bảo hành</li>
                                <li className="hover:text-white cursor-pointer transition-all duration-300 hover:translate-x-2">
                                    Liên hệ hỗ trợ</li>
                            </ul>
                        </div>
                         {/* Column 4*/}
                         <div className="space-y-4">
                            <h4 className="font-bold">LIÊN HỆ</h4>
                                <div className="space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors p-1">
                                        <Facebook className="hover:scale-125 transform duration-300" /></a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors p-1">
                                        <Instagram className="hover:scale-125 transform duration-300" /></a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors p-1">
                                        <Twitter className="hover:scale-125 transform duration-300" /></a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors p-1">
                                        <LinkedIn className="hover:scale-125 transform duration-300" /></a>
                                </div>
                         </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto border-t border-white/20 pt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        © 2026 BIKECYCTORE. Tất cả quyền lợi được bảo lưu.
                    </div>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm"> Quyền riêng tư</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm"> Điều khoản dịch vụ</a>
                    </div>
                </div>
            
            </div>
            
        );
    }