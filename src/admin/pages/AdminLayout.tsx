import React, { useState } from "react";
import Sidebar from "../components/siderbar";
import DashboardOverview from "./Overview";
import ManageProducts from "./ManagerProduct";
import ManageOrders from "./ManagerOrder";
import ManagePromotions from "./ManagerPromotion";

export default function AdminLayout() {
  const [currentTab, setCurrentTab] = useState<string>("overview");

  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return <DashboardOverview />;
      case "products":
        return <ManageProducts />;
      case "orders":
        return <ManageOrders />;
      case "promotions":
        return <ManagePromotions />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}