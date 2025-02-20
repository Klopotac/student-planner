import { gapi } from "gapi-script";

const CLIENT_ID = "218725761054-ts1m04d2qf9njhrrb29vkhel6uka1hvm.apps.googleusercontent.com";
const API_KEY = "AIzaSyCbbg_58yOgTdpES_IecW0hTpo9XJRD638";
// Scope allows read/write access to calendar events.
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export const initGoogleApi = () => {
  if (typeof window !== "undefined") {
    gapi.load("client:auth2", async () => {
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: SCOPES,
      });
    });
  }
};

export const signIn = async () => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn();
  }
  return authInstance.currentUser.get().getAuthResponse();
};

export const signOut = () => {
  const authInstance = gapi.auth2.getAuthInstance();
  authInstance.signOut();
};

export const getCalendarEvents = async () => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });
    return response.result.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};

export const createGoogleEvent = async (eventData: { title: string; startDate: string; endDate: string }) => {
  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary: eventData.title,
        start: { date: eventData.startDate },
        end: { date: eventData.endDate },
      },
    });
    return response.result;
  } catch (error) {
    console.error("Error creating calendar event:", error);
  }
};

// This function loops through your local events and creates them on Google Calendar.
export const syncLocalEventsToGoogle = async (localEvents: { title: string; start: string }[]) => {
  try {
    // Ensure the user is signed in before pushing events.
    await signIn();

    // Loop through each local event.
    for (const event of localEvents) {
      const startDate = event.start;
      // For all-day events, the end date is the day after the start date.
      const dateObj = new Date(startDate);
      dateObj.setDate(dateObj.getDate() + 1);
      const endDate = dateObj.toISOString().split("T")[0];

      await createGoogleEvent({ title: event.title, startDate, endDate });
    }
    alert("Local events pushed to Google Calendar successfully!");
  } catch (error) {
    console.error("Error pushing local events to Google Calendar:", error);
    alert("Failed to push local events to Google Calendar. Check console for details.");
  }
};
