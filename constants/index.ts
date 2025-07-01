// src/constants/index.ts

import { SvgProps } from "react-native-svg";
import PartlyCloudy from "../assets/svg/partlyCloudy";
import PartlyCloudyNight from "../assets/svg/PartlyCloudyNight";
import ModerateRain from "../assets/svg/ModerateRain";
import Sunny from "../assets/svg/Sunny";
import Overcast from "../assets/svg/Overcast";
import LightRain from "../assets/svg/LightRain";
import HeavyRain from "../assets/svg/HeavyRain";
import Mist from "../assets/svg/Mist";
import Thundery from "../assets/svg/Thundery";
import Clear from "../assets/svg/Clear";
import Scattered from "../assets/svg/Scattered";

export const apiKey = "23bf1c3f16cc21b3cbb39b7218b64bf9";

/**
 * Mapping ikon SVG berdasarkan waktu (Day/Night) dan kondisi cuaca
 */
export const weatherImages: Record<"Day" | "Night", Record<string, React.FC<SvgProps>>> = {
  Day: {
    "few clouds": PartlyCloudy,
    "shower rain": ModerateRain,
    // "Patchy rain possible": ModerateRain,
    "scattered clouds": Scattered,
    // "Sunny": Sunny,
    "clear sky": Sunny,
    "broken clouds": Overcast,
    "rain" : HeavyRain,
    "thunderstorm": Thundery,
    "thunderstorm with light rain": Thundery,
    "thunderstorm with rain	": Thundery,
    "thunderstorm with heavy rain": Thundery,
    "light thunderstorm": Thundery,
    "heavy thunderstorm": Thundery,
    "ragged thunderstorm": Thundery,
    "thunderstorm with light drizzle": Thundery,
    "thunderstorm with drizzle": Thundery,
    "thunderstorm with heavy drizzle": Thundery,
    "light intensity drizzle": LightRain,
    "drizzle": LightRain,
    "heavy intensity drizzle": LightRain,
    "light intensity drizzle rain": LightRain,
    "drizzle rain": LightRain,
    "heavy intensity drizzle rain": LightRain,
    "shower rain and drizzle": LightRain,
    "heavy shower rain and drizzle": LightRain,
    "shower drizzle": LightRain,
    "light rain": LightRain,
    "moderate rain": ModerateRain,
    "heavy intensity rain": HeavyRain,
    "very heavy rain": HeavyRain,
    "extreme rain": HeavyRain,
    "light intensity shower rain": LightRain,
    "heavy intensity shower rain": LightRain,
    "ragged shower main": LightRain,
    "overcast clouds": Overcast,
    "Mist": Mist,
  },
  Night: {
    "few clouds": PartlyCloudyNight,
    "scattered clouds": Scattered,
    "shower rain": LightRain,
    // "Moderate rain": LightRain,
    // "Patchy rain possible": LightRain,
    "clear sky": Clear,
    "broken clouds": Overcast,
    "rain" : HeavyRain,
    "light rain" : LightRain,
    "thunderstorm": Thundery,
    "overcast clouds": Overcast,
    // "Cloudy": Overcast,
    // "Light rain": LightRain,
    // "Light rain shower": LightRain,
    "Mist": Mist,
    // "other": LightRain,
  },
};
