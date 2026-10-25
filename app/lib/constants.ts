import { ADMIN_USERS, USERS } from "@env"
import Constants from "expo-constants"
import { Country } from "@/types/recipes"
import { Theme, User } from "@/types"
import { Category } from "@/types/generated/models/category"
import { MealType } from "@/types/generated/models/meal_type"

export const CATEGORY_ORDER: Category[] = [
    "remaining",
    "bread",
    "housekeeping",
    "drinks",
    "meat",
    "fish",
    "fruit/vegetables",
    "fridge",
    "dairy",
    "world",
    "breakfast",
    "snacks",
    "carbs",
    "sugar/desserts",
    "sauce/spices",
    "preserved",
    "hygiene",
    "freezer",
]

export const MEAL_TYPES: MealType[] = ["Any", "Breakfast", "Lunch", "Dinner", "Dessert"]

export const MEALS: { [key in MealType]: string } = {
    Any: "🍽",
    Breakfast: "🥞",
    Lunch: "🥪",
    Dinner: "🍝",
    Dessert: "🍰",
}

export const GRADIENT = ["#1e55fc", "#1e55fc", "#fc559f", "#fda848"] as const

export const COUNTRIES: Country[] = [
    { name: "Argentina", flag: "🇦🇷" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "Austria", flag: "🇦🇹" },
    { name: "Belgium", flag: "🇧🇪" },
    { name: "Brazil", flag: "🇧🇷" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "Chile", flag: "🇨🇱" },
    { name: "China", flag: "🇨🇳" },
    { name: "Czech Republic", flag: "🇨🇿" },
    { name: "Denmark", flag: "🇩🇰" },
    { name: "Egypt", flag: "🇪🇬" },
    { name: "Finland", flag: "🇫🇮" },
    { name: "France", flag: "🇫🇷" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "Greece", flag: "🇬🇷" },
    { name: "India", flag: "🇮🇳" },
    { name: "Indonesia", flag: "🇮🇩" },
    { name: "Ireland", flag: "🇮🇪" },
    { name: "Italy", flag: "🇮🇹" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "Kenya", flag: "🇰🇪" },
    { name: "Malaysia", flag: "🇲🇾" },
    { name: "Mexico", flag: "🇲🇽" },
    { name: "Morocco", flag: "🇲🇦" },
    { name: "Netherlands", flag: "🇳🇱" },
    { name: "New Zealand", flag: "🇳🇿" },
    { name: "Nigeria", flag: "🇳🇬" },
    { name: "Norway", flag: "🇳🇴" },
    { name: "Peru", flag: "🇵🇪" },
    { name: "Philippines", flag: "🇵🇭" },
    { name: "Poland", flag: "🇵🇱" },
    { name: "Portugal", flag: "🇵🇹" },
    { name: "Saudi Arabia", flag: "🇸🇦" },
    { name: "Singapore", flag: "🇸🇬" },
    { name: "South Africa", flag: "🇿🇦" },
    { name: "South Korea", flag: "🇰🇷" },
    { name: "Spain", flag: "🇪🇸" },
    { name: "Sweden", flag: "🇸🇪" },
    { name: "Switzerland", flag: "🇨🇭" },
    { name: "Thailand", flag: "🇹🇭" },
    { name: "Turkey", flag: "🇹🇷" },
    { name: "United Arab Emirates", flag: "🇦🇪" },
    { name: "United Kingdom", flag: "🇬🇧" },
    { name: "United States", flag: "🇺🇸" },
    { name: "Vietnam", flag: "🇻🇳" },
    { name: "Lebanon", flag: "🇱🇧" },
    { name: "Ethiopia", flag: "🇪🇹" },
]

// Kitchen slugs accepted by 15gram, sent as ?kitchen[]= params when searching online recipes.
export const KITCHENS: { value: string; label: string }[] = [
    { value: "afrikaans", label: "African" },
    { value: "aziatisch", label: "Asian" },
    { value: "belgisch", label: "Belgian" },
    { value: "europees", label: "European" },
    { value: "frans", label: "French" },
    { value: "grieks", label: "Greek" },
    { value: "indisch", label: "Indian" },
    { value: "italiaans", label: "Italian" },
    { value: "mexicaans", label: "Mexican" },
    { value: "middenoosters", label: "Middle Eastern" },
    { value: "noordafrikaans", label: "North African" },
    { value: "nvt", label: "Other" },
    { value: "oosteuropees", label: "Eastern European" },
    { value: "scandinavisch", label: "Scandinavian" },
    { value: "spaans", label: "Spanish" },
    { value: "thais", label: "Thai" },
    { value: "usa", label: "American" },
    { value: "vietnamesees", label: "Vietnamese" },
    { value: "zuidamerikaans", label: "South American" },
]

// Course slugs accepted by 15gram, sent as ?course[]= params when searching online recipes.
export const COURSES: { value: string; label: string }[] = [
    { value: "voorgerecht", label: "Starter" },
    { value: "hapje", label: "Snack" },
    { value: "bijgerecht", label: "Side dish" },
    { value: "hoofdgerecht", label: "Main course" },
    { value: "ontbijt", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dessert", label: "Dessert" },
    { value: "drankje", label: "Drink" },
    { value: "nvt", label: "Other" },
]

// Dish slugs accepted by 15gram, sent as ?dish[]= params when searching online recipes.
export const DISHES: { value: string; label: string }[] = [
    { value: "aardappelgerecht", label: "Potato dish" },
    { value: "barbecuen", label: "Barbecue" },
    { value: "broodgerecht", label: "Bread dish" },
    { value: "carpaccio", label: "Carpaccio" },
    { value: "confituurgelei", label: "Confit egg" },
    { value: "curry", label: "Curry" },
    { value: "eigerecht", label: "Egg dish" },
    { value: "fruitgerecht", label: "Fruit dish" },
    { value: "gebak", label: "Pastry" },
    { value: "gebraad", label: "Roast" },
    { value: "gevogelte", label: "Poultry" },
    { value: "groentebereiding", label: "Vegetable dish" },
    { value: "hartigetaartquiche", label: "Quiche" },
    { value: "ijs", label: "Ice cream" },
    { value: "koekjes", label: "Cookies" },
    { value: "marinade", label: "Marinade" },
    { value: "ovenschotel", label: "Oven dish" },
    { value: "pannenkoek", label: "Pancake" },
    { value: "papillot", label: "Papillote" },
    { value: "pastagerecht", label: "Pasta dish" },
    { value: "pastasalade", label: "Pasta salad" },
    { value: "pateenterrine", label: "Terrine" },
    { value: "pita", label: "Pita" },
    { value: "pizza", label: "Pizza" },
    { value: "rijstgerecht", label: "Rice dish" },
    { value: "salade", label: "Salad" },
    { value: "saus", label: "Sauce" },
    { value: "schaalschelpdieren", label: "Shellfish" },
    { value: "soep", label: "Soup" },
    { value: "souffle", label: "Souffle" },
    { value: "stoofpot", label: "Stew" },
    { value: "sushi", label: "Sushi" },
    { value: "tajine", label: "Tagine" },
    { value: "tapas", label: "Tapas" },
    { value: "visschotel", label: "Fish dish" },
    { value: "vleesgerecht", label: "Meat dish" },
    { value: "wild", label: "Game" },
    { value: "wokgerecht", label: "Wok dish" },
    { value: "wrap", label: "Wrap" },
    { value: "zoetetaart", label: "Sweet pie" },
]

// Dietary slugs accepted by 15gram, sent as ?special[]= params when searching online recipes.
export const SPECIALS: { value: string; label: string }[] = [
    { value: "caloriearm", label: "Low calorie" },
    { value: "cholesterolarm", label: "Low cholesterol" },
    { value: "hoogvezelgehalte", label: "High fibre" },
    { value: "koolhydraatarm", label: "Low carb" },
    { value: "lactosevrij", label: "Lactose free" },
    { value: "suikerarm", label: "Low sugar" },
    { value: "vegan", label: "Vegan" },
    { value: "vegetarisch", label: "Vegetarian" },
    { value: "vetarm", label: "Low fat" },
    { value: "zoutarm", label: "Low salt" },
]

export const USERS_ARRAY = JSON.parse(USERS) as User[]

export const ADMIN_USERS_ARRAY = JSON.parse(ADMIN_USERS) as User[]

export const THEMES: { key: Theme; label: string }[] = [
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
    { key: "true dark", label: "True Dark" },
]

export const DEFAULT_FONT_SIZE = 35
export const MIN_FONT_SIZE = 30
export const MAX_FONT_SIZE = 80

export const DEBOUNCE_TIME = 1000

export const VERSION = Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version ?? "Unknown"

export const HEADER_HEIGHT = 110
