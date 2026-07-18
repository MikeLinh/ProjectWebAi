import React, { useState } from "react";
import Sidebar from "../components/siderbar";
import DashboardOverview from "./Overview";
import ManageProducts from "./ManagerProduct";
import ManageOrders from "./ManagerOrder";
import ManagePromotions from "./ManagerPromotion";
import ManageCategories from "./ManagerCategory";
import ManageWarehouse from "./ManagerWarehouse";
import ManagerManufacturer from "./ManagerManufacturer";
import ManagerSupplier from "./ManagerSupplier";
import User from "./ManageUser"

export default function AdminLayout() {
  // currentTab lưu tab đang mở
  // setCurrentTab dùng để thay đổi tab
  // Mặc định mở Dashboard (overview)
  const [currentTab, setCurrentTab] = useState<string>("overview");

  //Tạo 1 hàm quyết định component nào sẽ được hiển thị
  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return <DashboardOverview />;
      case "products":
        return <ManageProducts />;
      case "warehouse":
        return <ManageWarehouse />;
      case "orders":
        return <ManageOrders />;
      case "promotions":
        return <ManagePromotions />;
      case "categories":
        return <ManageCategories/>;
      case "manufacturer":
        return <ManagerManufacturer/>;
      case "supplier":
        return <ManagerSupplier/>;
      case "user":
        return <User/>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar nhận tab hiện tại và hàm đổi tab */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}