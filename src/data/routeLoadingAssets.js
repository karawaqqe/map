import {
	birdImage,
	birdSound,
	cloudImages,
	continents,
	eiridorMusic,
	holyLightMusic,
	windSound,
	worldMapImage,
	worldMapMusic,
} from "./continents";
import { eiridorMapImage, eiridorRegions } from "./eiridor";
import { holyLightMapImage, holyLightRegions } from "./holylight";
import {
	spindelBlizzardAmbience,
	spindelBuildingLayers,
	spindelFogParticles,
	spindelInteractiveCastle,
	spindelMapImage,
	spindelOst,
	spindelRegions,
	spindelRoomAssets,
} from "./spindel";

const shrineAssets = {
	background: new URL("../../img/cubes/Spindel/shrine/shrine_bg.png", import.meta.url).href,
	statue: new URL("../../img/cubes/Spindel/shrine/shrine_statue.png", import.meta.url).href,
	effects: new URL("../../img/cubes/Spindel/shrine/shrine_effects.png", import.meta.url).href,
	eyes: new URL("../../img/cubes/Spindel/shrine/eyes_glow_shrine.png", import.meta.url).href,
	dialogueWindow: new URL("../../img/cubes/Spindel/shrine/dialogue_window.png", import.meta.url).href,
	ambience: new URL("../../sounds/spindel/cave/cave_shrine_ambience.mp3", import.meta.url).href,
	dialogueClick: new URL("../../sounds/spindel/cave/dialogue_click.mp3", import.meta.url).href,
	screamer: new URL("../../videos/screamer-test.mp4", import.meta.url).href,
};

const regionMapImages = {
	drakenholm: new URL("../../img/continents/Regions/Eiridor/Drakenholm/Untitled23_20260607205818.png", import.meta.url).href,
	everdan: new URL("../../img/continents/Regions/Holylight/Everdawn/Everdan.png", import.meta.url).href,
	everdawn: new URL("../../img/continents/Regions/Holylight/Everdawn/Everdan.png", import.meta.url).href,
	kaelmore: new URL("../../img/continents/Regions/Holylight/Kaelmore/kaelmore.png", import.meta.url).href,
	lyumeris: new URL("../../img/continents/Regions/Eiridor/lumeris/lumeris2.png", import.meta.url).href,
	morvein: new URL("../../img/continents/Regions/Eiridor/Morvein/rea.png", import.meta.url).href,
	morveyn: new URL("../../img/continents/Regions/Eiridor/Morvein/rea.png", import.meta.url).href,
	noktreyn: new URL("../../img/continents/Regions/Eiridor/Noktreyn/Noktrein.png", import.meta.url).href,
};

const regionMarkerIcons = [
	new URL("../../svg/Eiridor/Church/cross3.svg", import.meta.url).href,
	new URL("../../svg/Eiridor/Bar/drakenholm_tavern_icon.svg", import.meta.url).href,
	new URL("../../svg/Eiridor/Forge/forge_transparent.svg", import.meta.url).href,
	new URL("../../svg/Eiridor/Market/market_scalesdrakenholm.svg", import.meta.url).href,
	new URL("../../svg/Eiridor/Bar/morvein_tavern_icon.svg", import.meta.url).href,
	new URL("../../svg/Eiridor/Bar/noktrein_tavern_icon.svg", import.meta.url).href,
	new URL("../../svg/Eiridor/Bar/lumeris_tavern_icon_transparent.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Church/cross6.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Church/cross8.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Church/cross11.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Forge/everdane_forge_icon.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Forge/kaelmore_forge_icon.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Market/everdane_market_scales_detailed.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Market/kaelmore_market_icon_no_bg.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Monastery/dark_monastery_shield.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Monastery/golden_monastery_cross.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Bar/everdan_tavern_icon.svg", import.meta.url).href,
	new URL("../../svg/HolyLight/Bar/kaelmor_tavern_icon.svg", import.meta.url).href,
	new URL("../../svg/infopanel/cross2.svg", import.meta.url).href,
	new URL("../../svg/infopanel/forge_icon.svg", import.meta.url).href,
	new URL("../../svg/infopanel/market_scales.svg", import.meta.url).href,
];

const bookAssets = [
	new URL("../../img/books/spindel/voss_journal/book_assets/table_back.jpg", import.meta.url).href,
	new URL("../../img/books/spindel/voss_journal/book_assets/cover_front.png", import.meta.url).href,
	new URL("../../img/books/spindel/voss_journal/book_assets/open_book.png", import.meta.url).href,
	new URL("../../img/books/spindel/voss_journal/book_assets/pages_left.png", import.meta.url).href,
	new URL("../../img/books/spindel/voss_journal/book_assets/pages_right.png", import.meta.url).href,
	new URL("../../img/books/spindel/voss_journal/book_assets/castle_page_left.png", import.meta.url).href,
	new URL("../../img/books/spindel/voss_journal/book_assets/castle_page_right.png", import.meta.url).href,
	spindelOst,
];

const worldAssets = [
	worldMapImage,
	windSound,
	birdImage,
	birdSound,
	worldMapMusic,
	...cloudImages,
	...continents.flatMap((continent) => [continent.image, continent.crest]),
];

const eiridorAssets = [
	eiridorMapImage,
	new URL("../../img/herbs/eiridor_union/eiridor_union_crest.png", import.meta.url).href,
	eiridorMusic,
	windSound,
	birdImage,
	birdSound,
	...cloudImages,
	...eiridorRegions.flatMap((region) => [region.image, region.crest]),
];

const holyLightAssets = [
	holyLightMapImage,
	holyLightMusic,
	windSound,
	birdImage,
	birdSound,
	new URL("../../svg/Capital/holy_capital_sword_shield.svg", import.meta.url).href,
	...cloudImages,
	...holyLightRegions.map((region) => region.image),
];

const spindelAssets = [
	spindelMapImage,
	spindelOst,
	spindelBlizzardAmbience,
	spindelInteractiveCastle,
	...spindelFogParticles,
	...spindelRegions.map((region) => region.image),
	...spindelBuildingLayers.map((building) => building.image),
];

const roomAssets = [
	...Object.values(spindelRoomAssets),
	...spindelFogParticles,
	shrineAssets.dialogueWindow,
	shrineAssets.dialogueClick,
];

function getRegionAssets(pathname) {
	const regionId = pathname.split("/").filter(Boolean).pop();

	return [
		regionMapImages[regionId],
		birdImage,
		birdSound,
		...cloudImages,
		...regionMarkerIcons,
	];
}

const routeMatchers = [
	{ test: (pathname) => pathname === "/", label: "World Map", assets: worldAssets },
	{ test: (pathname) => pathname === "/eiridor", label: "Eiridor", assets: eiridorAssets },
	{ test: (pathname) => pathname === "/holy-light", label: "Holy Light", assets: holyLightAssets },
	{ test: (pathname) => pathname === "/shrine", label: "Shrine", assets: Object.values(shrineAssets) },
	{ test: (pathname) => pathname === "/spindel", label: "Spindel", assets: spindelAssets },
	{ test: (pathname) => pathname === "/spindel/room", label: "Spindel Room", assets: roomAssets },
	{ test: (pathname) => pathname === "/spindel/edar-voss-journal", label: "Edran Voss Journal", assets: bookAssets },
	{ test: (pathname) => pathname.startsWith("/region/"), label: "Region Map", assets: getRegionAssets },
	{ test: (pathname) => pathname.startsWith("/holy-light/region/"), label: "Region Map", assets: getRegionAssets },
	{ test: (pathname) => pathname.startsWith("/city/"), label: "City Map", assets: [] },
	{ test: (pathname) => pathname === "/void", label: "Void", assets: [] },
];

export function getRouteLoadingTarget(pathname) {
	const matcher = routeMatchers.find((routeMatcher) => routeMatcher.test(pathname));
	const assets = typeof matcher?.assets === "function"
		? matcher.assets(pathname)
		: matcher?.assets ?? [];

	return {
		assets: [...new Set(assets.filter(Boolean))],
		label: matcher?.label ?? "Location",
	};
}
