package com.source.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String toEmail, String resetCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("yourgmail@gmail.com"); 
        message.setTo(toEmail);
        message.setSubject("Mã khôi phục mật khẩu - Your App");
        message.setText(
            "Xin chào,\n\n" +
            "Mã khôi phục mật khẩu của bạn là: " + resetCode + "\n\n" +
            "Mã này sẽ hết hạn sau 10 phút.\n\n" +
            "Trân trọng,\nYour App Team"
        );

        mailSender.send(message);
    }
    public void sendNewPasswordEmail(String toEmail, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("yourgmail@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Mật khẩu mới của bạn");
        message.setText(
            "Xin chào,\n\n" +
            "Mật khẩu mới của bạn là: " + newPassword + "\n\n" +
            "Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.\n\n" +
            "Trân trọng,\nYour App Team"
        );
        mailSender.send(message);
    }
}