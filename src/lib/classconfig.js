// Shared class settings. Used by the API routes (and can be imported by the frontend later).

export const TIMEZONE = "Africa/Johannesburg";
export const UTC_OFFSET = "+02:00"; // South Africa has no daylight saving
export const CAPACITY = 5; // parents per class
export const WEEKS = 5; // classes per booking

export const LOCATIONS = {
  douglas: {
    id: "douglas",
    name: "Douglas",
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
    weekday: 6, // Saturday
    times: [{ id: "10:00", label: "10:00 am" }],
  },
};