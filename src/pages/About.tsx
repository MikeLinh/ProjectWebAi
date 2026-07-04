import React from "react";
import HeroSection from "../components/about/herosection";
import AboutBrand from "../components/about/AboutBrand";
import QualitySection from "../components/about/QualitySection";
import ProductHighlight from "../components/about/ProductHighlight";
import PricingSection from "../components/about/PricingSection";
import PromotionSection from "../components/about/PromotionSection";
import WhyUsSection from "../components/about/WhyUsSection";
import Navbar from "../components/home/navbar";
import Footer from "../components/home/footer";

export default function About() {
  return (
    <div className="bg-gray-50">
        <Navbar/>
      <HeroSection />
      <AboutBrand />
      <QualitySection />
      <ProductHighlight />
      <PricingSection />
      <PromotionSection />
      <WhyUsSection />
      <Footer/>
    </div>
  );
}