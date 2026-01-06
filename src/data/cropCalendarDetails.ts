export interface CropCalendarEntry {
    crop: string;
    season: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';
    sowingMonths: string[];
    harvestMonths: string[];
    majorStates: string[];
}

export const CROP_CALENDAR_DETAILS: CropCalendarEntry[] = [
    {
        "crop": "Soybean",
        "season": "Kharif",
        "sowingMonths": ["June", "July", "August"],
        "harvestMonths": ["September", "October"],
        "majorStates": ["MP", "MH", "Rajasthan"]
    },
    {
        "crop": "Cotton (Kapas)",
        "season": "Kharif",
        "sowingMonths": ["June", "July", "August", "September"],
        "harvestMonths": ["October", "November"],
        "majorStates": ["Gujarat", "MH", "AP", "MP", "Karnataka"]
    },
    {
        "crop": "Turmeric",
        "season": "Rabi",
        "sowingMonths": ["June", "July", "August"],
        "harvestMonths": ["January", "February", "March", "April"],
        "majorStates": ["AP", "TN", "Odisha", "WB", "Karnataka", "MH"]
    },
    {
        "crop": "Castor Seed",
        "season": "Rabi",
        "sowingMonths": ["June", "July", "August"],
        "harvestMonths": ["January", "February", "March", "April"],
        "majorStates": ["Gujarat", "AP", "Rajasthan"]
    },
    {
        "crop": "Guar (Cluster Bean)",
        "season": "Kharif",
        "sowingMonths": ["July", "August"],
        "harvestMonths": ["October", "November"],
        "majorStates": ["Rajasthan", "Haryana", "Punjab"]
    },
    {
        "crop": "Chilli (Kharif)",
        "season": "Kharif",
        "sowingMonths": ["August"],
        "harvestMonths": ["January", "February"],
        "majorStates": ["AP", "Karnataka", "Odisha", "MH", "WB", "Rajasthan"]
    },
    {
        "crop": "Chilli (Summer)",
        "season": "Zaid",
        "sowingMonths": ["March"],
        "harvestMonths": ["June"],
        "majorStates": ["AP", "Karnataka", "Odisha", "MH", "WB", "Rajasthan"]
    },
    {
        "crop": "Maize (Kharif)",
        "season": "Kharif",
        "sowingMonths": ["June", "July", "August"],
        "harvestMonths": ["September"],
        "majorStates": ["Karnataka", "AP", "MH", "MP", "UP"]
    },
    {
        "crop": "Potato (Kharif)",
        "season": "Kharif",
        "sowingMonths": ["June", "July"],
        "harvestMonths": ["September", "October"],
        "majorStates": ["Karnataka", "AP", "TN"]
    },
    {
        "crop": "Potato (Rabi)",
        "season": "Rabi",
        "sowingMonths": ["October", "November", "December"],
        "harvestMonths": ["January", "February", "March"],
        "majorStates": ["UP", "WB", "Punjab", "Bihar", "Odisha"]
    },
    {
        "crop": "Maize (Rabi)",
        "season": "Rabi",
        "sowingMonths": ["October", "November"],
        "harvestMonths": ["February", "March"],
        "majorStates": ["Bihar", "AP", "TN", "Karnataka"]
    },
    {
        "crop": "Mustard (RMS)",
        "season": "Rabi",
        "sowingMonths": ["October", "November"],
        "harvestMonths": ["February", "March"],
        "majorStates": ["Rajasthan", "UP", "Punjab", "Haryana", "MP", "WB"]
    },
    {
        "crop": "Chana (Gram)",
        "season": "Rabi",
        "sowingMonths": ["October", "November"],
        "harvestMonths": ["February", "March"],
        "majorStates": ["MP", "UP", "Rajasthan"]
    },
    {
        "crop": "Barley",
        "season": "Rabi",
        "sowingMonths": ["October", "November"],
        "harvestMonths": ["February", "March"],
        "majorStates": ["Rajasthan"]
    },
    {
        "crop": "Jeera (Cumin)",
        "season": "Rabi",
        "sowingMonths": ["October", "November"],
        "harvestMonths": ["February", "March"],
        "majorStates": ["Gujarat", "Rajasthan"]
    },
    {
        "crop": "Coriander",
        "season": "Rabi",
        "sowingMonths": ["October", "November", "December"],
        "harvestMonths": ["February", "March", "April"],
        "majorStates": ["Rajasthan", "MP", "AP"]
    },
    {
        "crop": "Black Pepper",
        "season": "Perennial",
        "sowingMonths": ["September", "October"],
        "harvestMonths": ["January", "February", "March"],
        "majorStates": ["Kerala", "Karnataka"]
    },
    {
        "crop": "Mentha",
        "season": "Zaid",
        "sowingMonths": ["February", "March"],
        "harvestMonths": ["May", "June"],
        "majorStates": ["UP"]
    }
];
