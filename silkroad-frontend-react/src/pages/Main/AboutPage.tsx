export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">

        {/* Banner */}
        <section className="relative w-full h-64 md:h-80 overflow-hidden">
          <img
            src="./public/images/banner.jpg"
            alt="SilkRoad Banner"
            className="w-full h-full object-cover brightness-90 transform scale-105 animate-[imageZoom_10s_ease-out_infinite]"
			width="600px"
			height="300px"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg animate-fadeIn">
              About SilkRoad
            </h1>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-14">

          {/* Two Column Section */}
          <section className="grid md:grid-cols-2 gap-10 items-center mb-20">
            {/* Left Text */}
            <div className="animate-slideUp float=left">
              <h2 className="text-3xl font-semibold mb-4 text-gray-900">
                A Better Way to Order Your Favorite Drinks
              </h2>

              <p className="text-gray-700 leading-relaxed mb-4">
                SilkRoad is a modern beverage ordering platform designed for fast,
                smooth, and enjoyable customer experiences. Browse stores, customize drinks,
                and track your delivery seamlessly.
              </p>

              <p className="text-gray-700 leading-relaxed">
                No more long lines. No more waiting without updates. SilkRoad brings convenience
                and transparency to every cup you order.
              </p>
            </div>
          {/* Chinese Section */}
          <section className="animate-slideUp">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">更便利的飲品訂購方式</h2>

            <p className="leading-relaxed mb-4 text-gray-700">
              SilkRoad 是一個強調顧客體驗的現代化線上飲品平台，讓您能快速瀏覽飲品、
              自由客製化、便捷結帳並追蹤外送進度。不論您喜歡手搖飲或是想嘗試新品牌，
              SilkRoad 都能提供最方便的選擇。
            </p>

            <p className="leading-relaxed mb-4 text-gray-700">
              從飲品上架、銷售、付款，到配送流程，SilkRoad 全面整合線上訂購體驗，
              讓整個流程更順暢、透明且高效，省去排隊與等待的時間。
            </p>

            <p className="leading-relaxed text-gray-700">
              我們與店家共同合作並透過後台系統維持平台的安全與公平性，
              確保每位顧客都能享受穩定、可靠且值得信賴的服務。
            </p>
          </section>
            {/* Right Image */}
            <div className="animate-fadeIn float=right">
              <img
                src="./public/images/showcase.jpg"
                alt="Beverage showcase"
                className="w-full rounded-xl shadow-lg object-cover"
				width="300px"
				height="450px"
              />
            </div>
          </section>

          {/* Features */}
          <section className="grid md:grid-cols-3 gap-8 mb-24">
            {/* Effortless ordering */}
            <div className="p-6 bg-white rounded-xl shadow-sm border animate-slideUp delay-75 flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Effortless Ordering</h3>
              <p className="text-gray-600">
                Browse beverages, customize your drink, and check out in seconds.
              </p>
            </div>

            {/* Wide selection */}
            <div className="p-6 bg-white rounded-xl shadow-sm border animate-slideUp delay-150 flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Wide Selection</h3>
              <p className="text-gray-600">
                Explore popular stores or discover new brands near you.
              </p>
            </div>

            {/* Reliable delivery */}
            <div className="p-6 bg-white rounded-xl shadow-sm border animate-slideUp delay-300 flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Reliable Delivery</h3>
              <p className="text-gray-600">
                Track your order from checkout to your doorstep in real time.
              </p>
            </div>
          </section>

		  {/*chinese*/}
            <div className="p-6 bg-white rounded-xl shadow-sm border animate-slideUp delay-75 flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">輕鬆訂購</h3>
              <p className="text-gray-600">
                瀏覽飲品、客製化你的飲料，幾秒內即可完成結帳。
              </p>
            </div>

            {/* Wide selection */}
            <div className="p-6 bg-white rounded-xl shadow-sm border animate-slideUp delay-150 flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">多種品項，任君挑選</h3>
              <p className="text-gray-600">
                探索熱門店家，或發掘你附近的新品牌。
              </p>
            </div>

            {/* Reliable delivery */}
            <div className="p-6 bg-white rounded-xl shadow-sm border animate-slideUp delay-300 flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">可靠的外送</h3>
              <p className="text-gray-600">
                從結帳到送達家門，全程即時追蹤你的訂單。
              </p>
            </div>


        </div>

        {/* Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes imageZoom {
            0% { transform: scale(1.05); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1.05); }
          }
          .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
          .delay-75 { animation-delay: 0.1s; }
          .delay-150 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.35s; }
        `}</style>

      </div>
    </>
  );
}
