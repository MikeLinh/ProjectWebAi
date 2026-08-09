import React from "react";
import DeblurIcon from '@mui/icons-material/Deblur';
import { Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material';
import { motion, type Variants } from "framer-motion"; 

export default function Footer() {
    const containerVariants : Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, 
            },
        },
    };

    const itemVariants : Variants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };
    return (
        <div className="bg-blue-950 text-white pt-12 pb-6 mt-16 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-40px" }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10"
                >
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <motion.button 
                                whileHover={{ rotate: 15 }}
                                transition={{ duration: 0.2 }}
                                className="focus:outline-none flex items-center justify-center"
                            > 
                                <DeblurIcon />
                            </motion.button>
                            <span className="font-bold text-lg tracking-wider">
                                BIKECYC <span className="text-blue-500">STORE</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed font-normal text-gray-400">
                            Cung cấp những mẫu xe đạp hiệu suất cao nhất thế giới từ năm 2026. 
                            Bứt phá mọi giới hạn cùng bạn.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4">
                        <h4 className="font-bold text-sm tracking-widest text-blue-400">SẢN PHẨM</h4>
                        <ul className="space-y-2.5 text-sm text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-transform duration-300 hover:translate-x-1.5 inline-block w-full">
                                Xe đường trường
                            </li>
                            <li className="hover:text-white cursor-pointer transition-transform duration-300 hover:translate-x-1.5 inline-block w-full">
                                Xe địa hình
                            </li>
                            <li className="hover:text-white cursor-pointer transition-transform duration-300 hover:translate-x-1.5 inline-block w-full">
                                Phụ kiện
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4">
                        <h4 className="font-bold text-sm tracking-widest text-blue-400">HỖ TRỢ</h4>
                        <ul className="space-y-2.5 text-sm text-gray-400">
                            <li className="hover:text-white cursor-pointer transition-transform duration-300 hover:translate-x-1.5 inline-block w-full">
                                Hướng dẫn mua hàng
                            </li>
                            <li className="hover:text-white cursor-pointer transition-transform duration-300 hover:translate-x-1.5 inline-block w-full">
                                Chính sách bảo hành
                            </li>
                            <li className="hover:text-white cursor-pointer transition-transform duration-300 hover:translate-x-1.5 inline-block w-full">
                                Liên hệ hỗ trợ
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4">
                        <h4 className="font-bold text-sm tracking-widest text-blue-400">LIÊN HỆ</h4>
                        <div className="flex space-x-2">
                            {[
                                { icon: <Facebook />, url: "#" },
                                { icon: <Instagram />, url: "#" },
                                { icon: <Twitter />, url: "#" },
                                { icon: <LinkedIn />, url: "#" }
                            ].map((social, i) => (
                                <motion.a 
                                    key={i}
                                    href={social.url} 
                                    whileHover={{ scale: 1.15, y: -3, color: "#3b82f6" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-gray-400 p-2 hover:bg-white/5 rounded-full flex items-center justify-center transition-colors duration-200"
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            <div className="max-w-6xl mx-auto border-t border-white/10 pt-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500">
                    © 2026 BIKECYC STORE. Tất cả quyền lợi được bảo lưu.
                </div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-500 hover:text-white transition-colors text-xs">Quyền riêng tư</a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors text-xs">Điều khoản dịch vụ</a>
                </div>
            </div>
        </div>
    );
}