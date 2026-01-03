// import { type Product } from "@/types/store";

// const dummyUrls = [
// 	"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkg50x9dXbZxmUadz94PATEQbPoryMSHL1Mg&s"
// 	// "https://png.pngtree.com/thumb_back/fw800/background/20241025/pngtree-green-smoothie-with-broccoli-image_16378995.jpg",
// 	// "https://s.yimg.com/ny/api/res/1.2/f107DnuEC7cuM3VcHwI.sQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTk2MA--/https://media.zenfs.com/ko/ebc.net.tw/67c02b4c3e119ce72c865e0cc6f086ff",
// 	// "https://hips.hearstapps.com/hmg-prod/images/uggg-683436eb8bf76.jpg?crop=0.498xw:0.997xh;0,0&resize=640:*",
// 	// "https://pic.pimg.tw/jetpeter/1702517182-2170193222-g_n.jpg",
// 	// "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/A_drink_for_relaxation......11.jpg/250px-A_drink_for_relaxation......11.jpg",
// 	// "https://images-my.girlstyle.com/wp-content/uploads/2024/01/6a65971d.jpg?auto=format&w=1053",
// 	// "https://i.epochtimes.com/assets/uploads/2024/07/id14291973-shutterstock_1064138750-450x300.jpg",
// 	// "https://www.gomaji.com/blog/wp-content/uploads/2021/07/IMG_8430.jpeg",
// 	// "https://blog.amazingtalker.com/wp-content/uploads/2023/01/kobby-mendez-xBFTjrMIC0c-unsplash-1024x621.jpg",
// 	// "https://c.pxhere.com/photos/9b/9c/alcohol_bar_beverage_close_up_cocktail_cold_drink_glass-1526105.jpg!s2",
// 	// "https://png.pngtree.com/thumb_back/fh260/background/20250225/pngtree-refreshing-orange-and-grapefruit-soda-image_16950837.jpg",
// 	// "https://png.pngtree.com/thumb_back/fh260/background/20250329/pngtree-orange-drinks-with-ice-cube-image_17155000.jpg",
// 	// "https://alternativebar.pl/_next/image?url=https%3A%2F%2Ffrpyol0mhkke.compat.objectstorage.eu-frankfurt-1.oraclecloud.com%2Fblogcms-assets%2Fthumbnail%2Fa1e45e331f0443d53f2e990e06369006%2Fnajlepsze-drinki-z-blue-curacao-i-grenadina-ktore-zachwyca-gosci.webp&w=1080&q=75",
// 	// "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRT6-DG3Zk9NOdTScEjRdHUyA5TMmvbbVhMSQ&s",
// 	// "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-00cicjGoOhT9L6ZW3kmc0RX5L4P_plVZAA&s",
// 	// "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR092ir2KZzxobpSV_K1vvvhkY18heInKeY76EzlfZ0TmQ-FeOlsteDvIgcBKDyN3QygDA&usqp=CAU",
// 	// "https://s23209.pcdn.co/wp-content/uploads/2015/07/Perfect-Iced-CoffeeIMG_0074.jpg",
// 	// "https://www.deliciousmagazine.co.uk/wp-content/uploads/2004/08/960_2022_Q2_SAM_FOLAN_ICED-COFFEE-768x960.jpg",
// 	// "https://upload.wikimedia.org/wikipedia/commons/3/30/VTR_-_Tom_Collins.jpg",
// 	// "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStMK9coo4PD6tr8ghbaKH5kafr_nocw_nGmh9C0qkrA83OPAeguHvrhjRVtD0pza59ahk&usqp=CAU",
// 	// "https://www.divvino.com.br/blog/wp-content/uploads/2023/09/drinks-com-prosecco-imagem-destacada.jpg",
// 	// "https://eventbotler.com/images/cocktails/shirley-temple-84bDzLRS.webp",
// ]
// const dummyOptions = {
// 	size: ["大", "中", "小", "超大", "家庭號", "自備", "台南水庫"],
// 	ice: ["去冰", "少冰", "微冰", "只要冰塊不加飲料", "恆河冰塊"],
// 	sugar: ["台南甜", "無糖", "整杯都糖", "一顆糖", "加鹽", "MSG", "甘蔗"]
// }


// export const baseProducts: Product[] = [
// 	{
// 		id: 1,
// 		vendor_id: 1,
// 		name: "可樂",
// 		price: 30,
// 		description: "渴了就來一瓶冰涼可樂，經典滋味，爽快直達心底！",
// 		options: { size: ["大", "中"], ice: ["去冰"], sugar: ["無糖"] },
// 		url: "cola",
// 		isListed: true,
// 	},
// 	{
// 		id: 2,
// 		vendor_id: 1,
// 		name: "花椰菜奶昔",
// 		price: 50,
// 		description: "品嘗新滋味的最佳選擇，蔬菜也能這麼順口！",
// 		options: { size: ["大", "中"], ice: ["少冰"], sugar: ["半糖"] },
// 		url: "cauliflowerSmoothie",
// 		isListed: true,



// 	},
// 	{
// 		id: 3,
// 		vendor_id: 1,
// 		name: "西瓜汁",
// 		price: 50,
// 		description: "夏日必備，一杯沁涼西瓜汁，清甜又解渴。",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "watermelonJuice",
// 		isListed: true,
// 	},
// 	{
// 		id: 4,
// 		vendor_id: 1,
// 		name: "柳橙汁",
// 		price: 50,
// 		description: "現榨柳橙，酸甜適中，補充滿滿活力。",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "orangeJuice",
// 		isListed: true,
// 	},
// 	{
// 		id: 5,
// 		vendor_id: 1,
// 		name: "薄荷莫吉托雞尾酒",
// 		price: 90,
// 		description: "一杯清爽的莫吉托，薄荷與氣泡交織出的微醺時光。",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "mintMojitoCocktail",
// 		isListed: true,
// 	},
// 	{
// 		id: 6,
// 		vendor_id: 1,
// 		name: "三杯汁",
// 		price: 140,
// 		description: "三杯雞的黃金搭檔，三杯汁，讓經典更有味。",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "threeJuice",
// 		isListed: true,
// 	},
// 	{
// 		id: 7,
// 		vendor_id: 1,
// 		name: "三杯汁V2",
// 		price: 140,
// 		description: "三杯汁系列全新進化版！水果風味 Part II 閃亮登場！",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "threeJuice2",
// 		isListed: true,
// 	},
// 	{
// 		id: 8,
// 		vendor_id: 1,
// 		name: "紅帽",
// 		price: 120,
// 		description: "帽子系列經典款！這杯紅色雞尾酒，清爽又迷人。",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "redHat",
// 		isListed: true,
// 	},
// 	{
// 		id: 9,
// 		vendor_id: 1,
// 		name: "乾杯",
// 		price: 100,
// 		description: "紅酒搭配香酥餅乾，前所未有的新奇組合，等你來嚐鮮。",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "cheer",
// 		isListed: true,
// 	},
// 	{
// 		id: 10,
// 		vendor_id: 1,
// 		name: "咖啡",
// 		price: 60,
// 		description: "Coffee or tea？不如試試這杯冰涼香濃的咖啡，提神首選！",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "coffee",
// 		isListed: true,
// 	},
// 	{
// 		id: 11,
// 		vendor_id: 1,
// 		name: "茶",
// 		price: 40,
// 		description: "Coffee or tea？別再猶豫，來杯熱茶暖暖身子吧！",
// 		options: { size: ["大", "中"], ice: ["去冰"], sugar: ["無糖"] },
// 		url: "tea",
// 		isListed: true,
// 	},
// 	{
// 		id: 12,
// 		vendor_id: 1,
// 		name: "蜜茶",
// 		price: 50,
// 		description: "甜蜜的蜂蜜加上溫潤熱茶，溫暖你的每個早晨與午後。",
// 		options: { size: ["大", "中"], ice: ["去冰"], sugar: ["無糖"] },
// 		url: "honeyTea",
// 		isListed: true,
// 	},
// 	{
// 		id: 13,
// 		vendor_id: 1,
// 		name: "綠帽",
// 		price: 999,
// 		description:
// 			"帽子系列主角登場！找到剛失戀的好友送他一杯，保證感動到說不出話。",
// 		options: { size: ["大", "中"], ice: ["正常冰"], sugar: ["全糖"] },
// 		url: "greenHat",
// 		isListed: true,
// 	},
// ];

// export const products: Product[] = baseProducts.map(p => ({
// 	...p,
// 	url: dummyUrls[Math.floor(Math.random() * dummyUrls.length)],
// 	options: {
// 		size: dummyOptions.size
// 			.sort(() => 0.5 - Math.random())
// 			.slice(0, Math.floor(Math.random() * dummyOptions.size.length) + 1),
// 		ice: dummyOptions.ice
// 			.sort(() => 0.5 - Math.random())
// 			.slice(0, Math.floor(Math.random() * dummyOptions.ice.length) + 1),
// 		sugar: dummyOptions.sugar
// 			.sort(() => 0.5 - Math.random())
// 			.slice(0, Math.floor(Math.random() * dummyOptions.sugar.length) + 1),
// 	},
// }));