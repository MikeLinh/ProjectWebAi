interface ProductBannerProps {
  backgroundp: string;
}

export default function ProductBanner({ backgroundp }: ProductBannerProps) {
  return (
    <div
      className="w-full h-[180px] md:h-[220px] bg-cover bg-center relative flex flex-col items-center justify-center text-white"
      style={{ backgroundImage: `url(${backgroundp})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center space-y-2">
        <p className="text-sm md:text-base tracking-[3px] uppercase">Trang chủ/ Sản phẩm</p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-wide">SẢN PHẨM</h1>
      </div>
    </div>
  );
}