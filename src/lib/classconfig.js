// Shared class settings. Used by the API routes (and can be imported by the frontend later).

export const TIMEZONE = "Africa/Johannesburg";
export const UTC_OFFSET = "+02:00"; // South Africa has no daylight saving
export const CAPACITY = 5; // parents per class
export const WEEKS = 5; // classes per booking
export const PRICE = "R1000"; // for all 5 classes
export const CLASS_DURATION_MINUTES = 60; // length of each class (adjust to yours)

export const LOCATIONS = {
  douglas: {
    id: "douglas",
    name: "Douglas",
    dayName: "Friday",
    weekday: 5, // Friday (Sunday = 0)
    times: [
      { id: "08:00", label: "8:00 am" },
      { id: "12:00", label: "12:00 pm" },
      { id: "16:30", label: "4:30 pm" },
    ],
  },
  kimberley: {
    id: "kimberley",
    name: "Kimberley",
    dayName: "Saturday",
    weekday: 6, // Saturday
    times: [{ id: "10:00", label: "10:00 am" }],
  },
};