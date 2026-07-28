import html2pdf from "html2pdf.js";
import type { Order } from "../ordertracking/orderitem";

export const handleExportInvoice = (order: Order, ngày: string, giờ: string) => {
  const invoiceHTML = `
    <div style="padding: 30px; font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 15px;">
        <div>
          <h1 style="margin: 0; font-size: 24px; color: #000; font-weight: bold;">BIKECYC STORE</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Cửa hàng xe đạp & phụ kiện chính hãng</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 20px; color: #e30019;">HÓA ĐƠN BÁN HÀNG</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px;"><b>Mã đơn:</b> #${order.orderId}</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;"><b>Ngày lập:</b> ${ngày} ${giờ}</p>
        </div>
      </div>

      <div style="margin-top: 20px; font-size: 13px; line-height: 1.6;">
        <p style="margin: 3px 0;"><b>Khách hàng:</b> ${order.receiverName || "Khách lẻ"}</p>
        <p style="margin: 3px 0;"><b>Địa chỉ:</b> ${order.shippingAddress || "Chưa cập nhật"}</p>
        <p style="margin: 3px 0;"><b>Hình thức thanh toán:</b> ${order.paymentMethod || "Tiền mặt/Chuyển khoản"}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f3f4f6; border-bottom: 2px solid #ddd;">
            <th style="padding: 10px; text-align: left;">STT</th>
            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
            <th style="padding: 10px; text-align: center;">SL</th>
            <th style="padding: 10px; text-align: right;">Đơn giá</th>
            <th style="padding: 10px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item, idx) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px;">${idx + 1}</td>
              <td style="padding: 10px;"><b>${item.productName}</b></td>
              <td style="padding: 10px; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right;">$${item.price.toLocaleString()}</td>
              <td style="padding: 10px; text-align: right;">$${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="margin-top: 25px; text-align: right; border-top: 2px solid #333; padding-top: 15px;">
        <p style="font-size: 16px; margin: 0;"><b>TỔNG CỘNG THANH TOÁN:</b> <span style="color: #e30019; font-size: 20px; font-weight: bold;">$${order.totalAmount.toLocaleString()}</span></p>
      </div>

      <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #777; border-top: 1px dashed #ccc; padding-top: 15px;">
        <p style="margin: 2px 0;">Cảm ơn quý khách đã mua hàng tại <b>BikeCyc Store</b>!</p>
        <p style="margin: 2px 0;">Mọi thắc mắc về bảo hành vui lòng liên hệ hotline hỗ trợ.</p>
      </div>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `HoaDon_BikeCyc_#${order.orderId}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 }, 
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

  html2pdf().set(opt).from(invoiceHTML).save();
};